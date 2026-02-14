package com.productiv.workmanagement.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.productiv.workmanagement.domain.entity.SavedView;
import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.entity.TaskWatcher;
import com.productiv.workmanagement.domain.entity.TaskWatcherId;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.entity.enums.SavedViewTargetType;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.domain.repository.SavedViewRepository;
import com.productiv.workmanagement.domain.repository.TaskRepository;
import com.productiv.workmanagement.domain.repository.TaskWatcherRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ForbiddenException;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.inbox.InboxMode;
import com.productiv.workmanagement.web.dto.inbox.InboxTaskResponse;
import com.productiv.workmanagement.web.dto.inbox.SavedViewCreateRequest;
import com.productiv.workmanagement.web.dto.inbox.SavedViewResponse;
import com.productiv.workmanagement.web.dto.inbox.SavedViewUpdateRequest;
import com.productiv.workmanagement.web.dto.inbox.TaskWatcherResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InboxService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final TaskRepository taskRepository;
    private final TaskWatcherRepository taskWatcherRepository;
    private final SavedViewRepository savedViewRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;
    private final ObjectMapper objectMapper;

    public InboxService(
        TaskRepository taskRepository,
        TaskWatcherRepository taskWatcherRepository,
        SavedViewRepository savedViewRepository,
        UserRepository userRepository,
        TaskService taskService,
        ObjectMapper objectMapper
    ) {
        this.taskRepository = taskRepository;
        this.taskWatcherRepository = taskWatcherRepository;
        this.savedViewRepository = savedViewRepository;
        this.userRepository = userRepository;
        this.taskService = taskService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Page<InboxTaskResponse> getInboxTasks(
        UUID currentUserId,
        InboxMode mode,
        List<TaskStatus> statuses,
        UUID projectId,
        String keyword,
        Pageable pageable
    ) {
        InboxMode resolvedMode = mode == null ? InboxMode.ALL_VISIBLE : mode;
        LocalDate today = LocalDate.now();

        LocalDate dueFrom = null;
        LocalDate dueTo = null;
        boolean dueFiltering = false;
        boolean includeAllVisible = false;
        boolean includeAssigned = true;
        boolean includeWatching = true;

        if (resolvedMode == InboxMode.ASSIGNED) {
            includeWatching = false;
        } else if (resolvedMode == InboxMode.WATCHING) {
            includeAssigned = false;
        } else if (resolvedMode == InboxMode.DUE_SOON) {
            includeAllVisible = true;
            includeAssigned = false;
            includeWatching = false;
            dueFrom = today;
            dueTo = today.plusDays(3);
            dueFiltering = true;
        } else if (resolvedMode == InboxMode.OVERDUE) {
            includeAllVisible = true;
            includeAssigned = false;
            includeWatching = false;
            dueFrom = LocalDate.of(1970, 1, 1);
            dueTo = today.minusDays(1);
            dueFiltering = true;
        } else if (resolvedMode == InboxMode.ALL_VISIBLE) {
            includeAllVisible = true;
            includeAssigned = false;
            includeWatching = false;
        }

        if (!dueFiltering) {
            dueFrom = LocalDate.of(1970, 1, 1);
            dueTo = LocalDate.of(9999, 12, 31);
        }

        List<TaskStatus> resolvedStatuses = (statuses == null || statuses.isEmpty())
            ? List.of(TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE)
            : statuses;
        String keywordPattern = normalizeKeywordPattern(keyword);
        boolean keywordFiltering = keywordPattern != null;
        boolean projectFiltering = projectId != null;

        Page<Task> page = taskRepository.searchInboxTasksByMode(
            currentUserId,
            currentUserId,
            includeAllVisible,
            includeAssigned,
            includeWatching,
            projectFiltering,
            projectId,
            dueFiltering,
            dueFrom,
            dueTo,
            resolvedStatuses,
            keywordFiltering,
            keywordPattern,
            pageable
        );

        return page.map(task -> new InboxTaskResponse(
            task.getId(),
            task.getProject().getId(),
            task.getTitle(),
            task.getDescription(),
            task.getStatus(),
            task.getPriority(),
            task.getDueDate(),
            task.getAssigneeUser() == null ? null : task.getAssigneeUser().getId(),
            task.getUpdatedAt()
        ));
    }

    public void watchTask(UUID currentUserId, UUID taskId) {
        Task task = taskService.getOwnedTask(currentUserId, taskId);
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        if (taskWatcherRepository.existsByTask_IdAndUser_Id(taskId, currentUserId)) {
            return;
        }

        TaskWatcher watcher = new TaskWatcher();
        watcher.setId(new TaskWatcherId(taskId, currentUserId));
        watcher.setTask(task);
        watcher.setUser(user);
        taskWatcherRepository.save(watcher);
    }

    public void unwatchTask(UUID currentUserId, UUID taskId) {
        taskService.getOwnedTask(currentUserId, taskId);
        taskWatcherRepository.deleteByTask_IdAndUser_Id(taskId, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<TaskWatcherResponse> getTaskWatchers(UUID currentUserId, UUID taskId) {
        boolean isOwner = taskRepository.findByIdAndProject_OwnerUser_Id(taskId, currentUserId).isPresent();
        boolean isWatcher = taskWatcherRepository.existsByTask_IdAndUser_Id(taskId, currentUserId);

        if (!isOwner && !isWatcher) {
            if (!taskRepository.existsById(taskId)) {
                throw new ResourceNotFoundException("Task not found: " + taskId);
            }
            throw new ForbiddenException("You do not have access to this task watchers list.");
        }

        return taskWatcherRepository.findByTask_IdOrderByCreatedAtAsc(taskId).stream()
            .map(taskWatcher -> new TaskWatcherResponse(
                taskWatcher.getUser().getId(),
                taskWatcher.getUser().getName(),
                taskWatcher.getUser().getEmail(),
                taskWatcher.getCreatedAt()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<SavedViewResponse> getSavedViews(UUID currentUserId, SavedViewTargetType targetType) {
        SavedViewTargetType resolvedTarget = targetType == null ? SavedViewTargetType.TASKS : targetType;
        return savedViewRepository.findByUser_IdAndTargetTypeOrderByCreatedAtDesc(currentUserId, resolvedTarget)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public SavedViewResponse createSavedView(UUID currentUserId, SavedViewCreateRequest request) {
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        SavedView savedView = new SavedView();
        savedView.setUser(user);
        savedView.setName(request.name().trim());
        savedView.setTargetType(request.targetType());
        savedView.setFilterJson(writeJson(request.filterJson()));
        savedView.setSortJson(writeJson(request.sortJson()));

        return toResponse(savedViewRepository.save(savedView));
    }

    public SavedViewResponse patchSavedView(UUID currentUserId, UUID id, SavedViewUpdateRequest request) {
        SavedView savedView = savedViewRepository.findByIdAndUser_Id(id, currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Saved view not found: " + id));

        if (request.name() != null) {
            savedView.setName(request.name().trim());
        }
        if (request.targetType() != null) {
            savedView.setTargetType(request.targetType());
        }
        if (request.filterJson() != null) {
            savedView.setFilterJson(writeJson(request.filterJson()));
        }
        if (request.sortJson() != null) {
            savedView.setSortJson(writeJson(request.sortJson()));
        }

        return toResponse(savedViewRepository.save(savedView));
    }

    public void deleteSavedView(UUID currentUserId, UUID id) {
        SavedView savedView = savedViewRepository.findByIdAndUser_Id(id, currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Saved view not found: " + id));
        savedViewRepository.delete(savedView);
    }

    private SavedViewResponse toResponse(SavedView savedView) {
        return new SavedViewResponse(
            savedView.getId(),
            savedView.getName(),
            savedView.getTargetType(),
            readJson(savedView.getFilterJson()),
            readJson(savedView.getSortJson()),
            savedView.getCreatedAt(),
            savedView.getUpdatedAt()
        );
    }

    private String normalizeKeywordPattern(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }
        return "%" + keyword.trim().toLowerCase() + "%";
    }

    private String writeJson(Map<String, Object> value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Map.of() : value);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid json payload.");
        }
    }

    private Map<String, Object> readJson(String value) {
        try {
            if (value == null || value.isBlank()) {
                return Map.of();
            }
            return objectMapper.readValue(value, MAP_TYPE);
        } catch (JsonProcessingException e) {
            return Map.of();
        }
    }
}
