package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Project;
import com.productiv.workmanagement.domain.entity.Tag;
import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.entity.TaskTag;
import com.productiv.workmanagement.domain.entity.TaskTagId;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.domain.repository.TagRepository;
import com.productiv.workmanagement.domain.repository.TaskRepository;
import com.productiv.workmanagement.domain.repository.TaskTagRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.security.TaskAccessGuard;
import com.productiv.workmanagement.web.dto.task.TaskCreateRequest;
import com.productiv.workmanagement.web.dto.task.TaskListSummaryResponse;
import com.productiv.workmanagement.web.dto.task.TaskResponse;
import com.productiv.workmanagement.web.dto.task.TaskUpdateRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final TaskTagRepository taskTagRepository;
    private final ProjectService projectService;
    private final ActivityLogService activityLogService;
    private final TaskAccessGuard taskAccessGuard;

    public TaskService(
        TaskRepository taskRepository,
        UserRepository userRepository,
        TagRepository tagRepository,
        TaskTagRepository taskTagRepository,
        ProjectService projectService,
        ActivityLogService activityLogService,
        TaskAccessGuard taskAccessGuard
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.taskTagRepository = taskTagRepository;
        this.projectService = projectService;
        this.activityLogService = activityLogService;
        this.taskAccessGuard = taskAccessGuard;
    }

    public TaskResponse create(UUID currentUserId, UUID projectId, TaskCreateRequest request) {
        Project project = projectService.getOwnedProject(currentUserId, projectId);

        User assignee = resolveAssignee(request.assigneeUserId());

        Task task = new Task();
        task.setProject(project);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setAssigneeUser(assignee);

        Task saved = taskRepository.save(task);

        activityLogService.log(
            currentUserId,
            "TASK",
            saved.getId(),
            "CREATED",
            Map.of("status", saved.getStatus().name())
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> searchOwnedTasks(
        UUID currentUserId,
        UUID projectId,
        TaskStatus status,
        TaskPriority priority,
        UUID assigneeUserId,
        LocalDate dueFrom,
        LocalDate dueTo,
        String keyword,
        Pageable pageable
    ) {
        boolean projectFiltering = projectId != null;
        UUID resolvedProjectId = projectFiltering ? projectId : currentUserId;
        boolean statusFiltering = status != null;
        TaskStatus resolvedStatus = statusFiltering ? status : TaskStatus.TODO;
        boolean priorityFiltering = priority != null;
        TaskPriority resolvedPriority = priorityFiltering ? priority : TaskPriority.MEDIUM;
        boolean assigneeFiltering = assigneeUserId != null;
        UUID resolvedAssigneeUserId = assigneeFiltering ? assigneeUserId : currentUserId;
        boolean dueFromFiltering = dueFrom != null;
        LocalDate resolvedDueFrom = dueFromFiltering ? dueFrom : LocalDate.of(1970, 1, 1);
        boolean dueToFiltering = dueTo != null;
        LocalDate resolvedDueTo = dueToFiltering ? dueTo : LocalDate.of(9999, 12, 31);
        String keywordPattern = normalizeKeywordPattern(keyword);
        boolean keywordFiltering = keywordPattern != null;
        String resolvedKeywordPattern = keywordFiltering ? keywordPattern : "%";

        Page<Task> taskPage = taskRepository.searchOwnedTasks(
            currentUserId,
            projectFiltering,
            resolvedProjectId,
            statusFiltering,
            resolvedStatus,
            priorityFiltering,
            resolvedPriority,
            assigneeFiltering,
            resolvedAssigneeUserId,
            dueFromFiltering,
            resolvedDueFrom,
            dueToFiltering,
            resolvedDueTo,
            keywordFiltering,
            resolvedKeywordPattern,
            pageable
        );
        Map<UUID, List<TaskResponse.TagItem>> tagsByTaskId = loadTagsByTaskIds(taskPage.getContent());
        return taskPage.map(task -> toResponse(task, tagsByTaskId.getOrDefault(task.getId(), List.of())));
    }

    @Transactional(readOnly = true)
    public TaskListSummaryResponse getOwnedSummary(UUID currentUserId, UUID projectId) {
        boolean projectFiltering = projectId != null;
        UUID resolvedProjectId = projectFiltering ? projectId : currentUserId;
        LocalDate today = LocalDate.now();
        LocalDate dueSoonEnd = today.plusDays(3);

        long total = taskRepository.countOwnedTasks(currentUserId, projectFiltering, resolvedProjectId);
        long inProgress = taskRepository.countOwnedTasksByStatus(
            currentUserId,
            projectFiltering,
            resolvedProjectId,
            TaskStatus.IN_PROGRESS
        );
        long dueSoon = taskRepository.countOwnedDueSoonTasks(
            currentUserId,
            projectFiltering,
            resolvedProjectId,
            today,
            dueSoonEnd
        );
        long overdue = taskRepository.countOwnedOverdueTasks(
            currentUserId,
            projectFiltering,
            resolvedProjectId,
            today
        );

        return new TaskListSummaryResponse(total, inProgress, dueSoon, overdue);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> searchInProject(
        UUID currentUserId,
        UUID projectId,
        TaskStatus status,
        UUID assigneeUserId,
        LocalDate dueFrom,
        LocalDate dueTo,
        String keyword,
        Pageable pageable
    ) {
        projectService.getOwnedProject(currentUserId, projectId);
        String keywordPattern = normalizeKeywordPattern(keyword);
        boolean statusFiltering = status != null;
        TaskStatus resolvedStatus = statusFiltering ? status : TaskStatus.TODO;
        boolean assigneeFiltering = assigneeUserId != null;
        UUID resolvedAssigneeUserId = assigneeFiltering ? assigneeUserId : currentUserId;
        boolean dueFromFiltering = dueFrom != null;
        LocalDate resolvedDueFrom = dueFromFiltering ? dueFrom : LocalDate.of(1970, 1, 1);
        boolean dueToFiltering = dueTo != null;
        LocalDate resolvedDueTo = dueToFiltering ? dueTo : LocalDate.of(9999, 12, 31);
        boolean keywordFiltering = keywordPattern != null;
        String resolvedKeywordPattern = keywordFiltering ? keywordPattern : "%";

        Page<Task> taskPage = taskRepository.searchInOwnedProject(
            projectId,
            currentUserId,
            statusFiltering,
            resolvedStatus,
            assigneeFiltering,
            resolvedAssigneeUserId,
            dueFromFiltering,
            resolvedDueFrom,
            dueToFiltering,
            resolvedDueTo,
            keywordFiltering,
            resolvedKeywordPattern,
            pageable
        );
        Map<UUID, List<TaskResponse.TagItem>> tagsByTaskId = loadTagsByTaskIds(taskPage.getContent());
        return taskPage.map(task -> toResponse(task, tagsByTaskId.getOrDefault(task.getId(), List.of())));
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(UUID currentUserId, UUID taskId) {
        Task task = getOwnedTask(currentUserId, taskId);
        return toResponse(task);
    }

    public TaskResponse patch(UUID currentUserId, UUID taskId, TaskUpdateRequest request) {
        Task task = getOwnedTask(currentUserId, taskId);
        TaskStatus beforeStatus = task.getStatus();

        if (request.title() != null) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.assigneeUserId() != null) {
            task.setAssigneeUser(resolveAssignee(request.assigneeUserId()));
        }

        Task saved = taskRepository.save(task);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("taskId", saved.getId().toString());
        meta.put("status", saved.getStatus().name());

        if (request.status() != null && beforeStatus != request.status()) {
            meta.put("beforeStatus", beforeStatus.name());
            meta.put("afterStatus", request.status().name());
            activityLogService.log(currentUserId, "TASK", saved.getId(), "STATUS_CHANGED", meta);
        } else {
            activityLogService.log(currentUserId, "TASK", saved.getId(), "UPDATED", meta);
        }

        return toResponse(saved);
    }

    public void delete(UUID currentUserId, UUID taskId) {
        Task task = getOwnedTask(currentUserId, taskId);
        taskTagRepository.deleteByTask_Id(taskId);
        taskRepository.delete(task);

        activityLogService.log(
            currentUserId,
            "TASK",
            taskId,
            "DELETED",
            Map.of("projectId", task.getProject().getId().toString())
        );
    }

    public void addTag(UUID currentUserId, UUID taskId, UUID tagId) {
        Task task = getOwnedTask(currentUserId, taskId);
        Tag tag = tagRepository.findById(tagId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + tagId));

        if (taskTagRepository.existsByTask_IdAndTag_Id(taskId, tagId)) {
            return;
        }

        TaskTag taskTag = new TaskTag();
        taskTag.setId(new TaskTagId(taskId, tagId));
        taskTag.setTask(task);
        taskTag.setTag(tag);
        taskTagRepository.save(taskTag);
    }

    public void removeTag(UUID currentUserId, UUID taskId, UUID tagId) {
        getOwnedTask(currentUserId, taskId);
        taskTagRepository.deleteByTask_IdAndTag_Id(taskId, tagId);
    }

    @Transactional(readOnly = true)
    public Task getOwnedTask(UUID currentUserId, UUID taskId) {
        return taskAccessGuard.getOwnedTaskOrThrow(currentUserId, taskId);
    }

    private User resolveAssignee(UUID assigneeUserId) {
        if (assigneeUserId == null) {
            return null;
        }
        return userRepository.findById(assigneeUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assigneeUserId));
    }

    private TaskResponse toResponse(Task task) {
        List<TaskResponse.TagItem> tags = loadTagsByTaskIds(List.of(task)).getOrDefault(task.getId(), List.of());
        return toResponse(task, tags);
    }

    private TaskResponse toResponse(Task task, List<TaskResponse.TagItem> tags) {
        UUID assigneeUserId = task.getAssigneeUser() == null ? null : task.getAssigneeUser().getId();
        return new TaskResponse(
            task.getId(),
            task.getProject().getId(),
            task.getTitle(),
            task.getDescription(),
            task.getStatus(),
            task.getPriority(),
            task.getDueDate(),
            assigneeUserId,
            tags,
            task.getCreatedAt(),
            task.getUpdatedAt()
        );
    }

    private Map<UUID, List<TaskResponse.TagItem>> loadTagsByTaskIds(List<Task> tasks) {
        if (tasks.isEmpty()) {
            return Map.of();
        }

        List<UUID> taskIds = tasks.stream().map(Task::getId).toList();
        Map<UUID, List<TaskResponse.TagItem>> tagsByTaskId = new HashMap<>();
        for (UUID taskId : taskIds) {
            tagsByTaskId.put(taskId, new ArrayList<>());
        }

        taskTagRepository.findWithTagByTaskIds(taskIds).forEach(taskTag ->
            tagsByTaskId.get(taskTag.getTask().getId())
                .add(new TaskResponse.TagItem(taskTag.getTag().getId(), taskTag.getTag().getName()))
        );

        return tagsByTaskId;
    }

    private String normalizeKeywordPattern(String keyword) {
        if (keyword == null) {
            return null;
        }
        String normalized = keyword.trim().toLowerCase();
        if (normalized.isEmpty()) {
            return null;
        }
        return "%" + normalized + "%";
    }
}
