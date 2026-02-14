package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Project;
import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.entity.TaskTemplate;
import com.productiv.workmanagement.domain.entity.TaskTemplateItem;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.domain.entity.enums.TemplateDefaultAssignee;
import com.productiv.workmanagement.domain.repository.TaskRepository;
import com.productiv.workmanagement.domain.repository.TaskTemplateItemRepository;
import com.productiv.workmanagement.domain.repository.TaskTemplateRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.template.TaskTemplateApplyRequest;
import com.productiv.workmanagement.web.dto.template.TaskTemplateApplyResponse;
import com.productiv.workmanagement.web.dto.template.TaskTemplateCreateRequest;
import com.productiv.workmanagement.web.dto.template.TaskTemplateItemRequest;
import com.productiv.workmanagement.web.dto.template.TaskTemplateItemResponse;
import com.productiv.workmanagement.web.dto.template.TaskTemplateItemUpdateRequest;
import com.productiv.workmanagement.web.dto.template.TaskTemplateResponse;
import com.productiv.workmanagement.web.dto.template.TaskTemplateUpdateRequest;
import java.time.LocalDate;
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
public class TaskTemplateService {

    private final TaskTemplateRepository taskTemplateRepository;
    private final TaskTemplateItemRepository taskTemplateItemRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final TaskRepository taskRepository;
    private final ActivityLogService activityLogService;

    public TaskTemplateService(
        TaskTemplateRepository taskTemplateRepository,
        TaskTemplateItemRepository taskTemplateItemRepository,
        UserRepository userRepository,
        ProjectService projectService,
        TaskRepository taskRepository,
        ActivityLogService activityLogService
    ) {
        this.taskTemplateRepository = taskTemplateRepository;
        this.taskTemplateItemRepository = taskTemplateItemRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
        this.taskRepository = taskRepository;
        this.activityLogService = activityLogService;
    }

    public TaskTemplateResponse create(UUID currentUserId, TaskTemplateCreateRequest request) {
        User owner = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        TaskTemplate template = new TaskTemplate();
        template.setOwnerUser(owner);
        template.setName(request.name().trim());
        template.setDescription(request.description());
        TaskTemplate saved = taskTemplateRepository.save(template);

        List<TaskTemplateItemRequest> items = request.items() == null ? List.of() : request.items();
        for (int order = 0; order < items.size(); order++) {
            taskTemplateItemRepository.save(buildItemEntity(saved, items.get(order), order));
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<TaskTemplateResponse> getMine(UUID currentUserId, Pageable pageable) {
        return taskTemplateRepository.findByOwnerUser_Id(currentUserId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskTemplateResponse getById(UUID currentUserId, UUID templateId) {
        return toResponse(getOwnedTemplate(currentUserId, templateId));
    }

    public TaskTemplateResponse patch(UUID currentUserId, UUID templateId, TaskTemplateUpdateRequest request) {
        TaskTemplate template = getOwnedTemplate(currentUserId, templateId);

        if (request.name() != null) {
            template.setName(request.name().trim());
        }
        if (request.description() != null) {
            template.setDescription(request.description());
        }

        return toResponse(taskTemplateRepository.save(template));
    }

    public void delete(UUID currentUserId, UUID templateId) {
        TaskTemplate template = getOwnedTemplate(currentUserId, templateId);
        taskTemplateItemRepository.deleteByTemplate_Id(template.getId());
        taskTemplateRepository.delete(template);
    }

    public TaskTemplateItemResponse createItem(UUID currentUserId, UUID templateId, TaskTemplateItemRequest request) {
        TaskTemplate template = getOwnedTemplate(currentUserId, templateId);
        int order = request.sortOrder() == null
            ? taskTemplateItemRepository.findByTemplate_IdOrderBySortOrderAscCreatedAtAsc(templateId).size()
            : request.sortOrder();
        TaskTemplateItem saved = taskTemplateItemRepository.save(buildItemEntity(template, request, order));
        return toItemResponse(saved);
    }

    public TaskTemplateItemResponse patchItem(UUID currentUserId, UUID itemId, TaskTemplateItemUpdateRequest request) {
        TaskTemplateItem item = getOwnedItem(currentUserId, itemId);

        if (request.title() != null) {
            item.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            item.setDescription(request.description());
        }
        if (request.defaultStatus() != null) {
            item.setDefaultStatus(request.defaultStatus());
        }
        if (request.defaultPriority() != null) {
            item.setDefaultPriority(request.defaultPriority());
        }
        if (request.defaultAssignee() != null) {
            item.setDefaultAssignee(request.defaultAssignee());
        }
        if (request.dueOffsetDays() != null) {
            item.setDueOffsetDays(request.dueOffsetDays());
        }
        if (request.sortOrder() != null) {
            item.setSortOrder(request.sortOrder());
        }

        return toItemResponse(taskTemplateItemRepository.save(item));
    }

    public void deleteItem(UUID currentUserId, UUID itemId) {
        TaskTemplateItem item = getOwnedItem(currentUserId, itemId);
        taskTemplateItemRepository.delete(item);
    }

    public TaskTemplateApplyResponse applyToProject(
        UUID currentUserId,
        UUID projectId,
        UUID templateId,
        TaskTemplateApplyRequest request
    ) {
        TaskTemplateApplyRequest resolvedRequest = request == null
            ? new TaskTemplateApplyRequest(null, null)
            : request;
        TaskTemplate template = getOwnedTemplate(currentUserId, templateId);
        Project project = projectService.getOwnedProject(currentUserId, projectId);
        List<TaskTemplateItem> items = taskTemplateItemRepository.findByTemplate_IdOrderBySortOrderAscCreatedAtAsc(template.getId());
        LocalDate baseDate = resolvedRequest.baseDate() == null ? LocalDate.now() : resolvedRequest.baseDate();

        User overrideAssignee = resolvedRequest.overrideAssigneeUserId() == null
            ? null
            : userRepository.findById(resolvedRequest.overrideAssigneeUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + resolvedRequest.overrideAssigneeUserId()));
        User me = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        List<Task> tasksToCreate = items.stream().map(item -> {
            Task task = new Task();
            task.setProject(project);
            task.setTitle(item.getTitle());
            task.setDescription(item.getDescription());
            task.setStatus(item.getDefaultStatus());
            task.setPriority(item.getDefaultPriority());
            task.setDueDate(item.getDueOffsetDays() == null ? null : baseDate.plusDays(item.getDueOffsetDays()));
            task.setAssigneeUser(resolveAssigneeForApply(item, me, overrideAssignee));
            return task;
        }).toList();

        List<Task> createdTasks = taskRepository.saveAll(tasksToCreate);
        List<UUID> createdTaskIds = createdTasks.stream().map(Task::getId).toList();

        for (Task createdTask : createdTasks) {
            Map<String, Object> meta = new LinkedHashMap<>();
            meta.put("templateId", templateId.toString());
            meta.put("projectId", projectId.toString());
            meta.put("baseDate", baseDate.toString());
            meta.put("taskTitle", createdTask.getTitle());
            activityLogService.log(currentUserId, "TASK", createdTask.getId(), "TEMPLATE_APPLIED", meta);
        }

        return new TaskTemplateApplyResponse(
            projectId,
            templateId,
            createdTaskIds.size(),
            createdTaskIds
        );
    }

    @Transactional(readOnly = true)
    private TaskTemplate getOwnedTemplate(UUID currentUserId, UUID templateId) {
        return taskTemplateRepository.findByIdAndOwnerUser_Id(templateId, currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
    }

    @Transactional(readOnly = true)
    private TaskTemplateItem getOwnedItem(UUID currentUserId, UUID itemId) {
        return taskTemplateItemRepository.findByIdAndTemplate_OwnerUser_Id(itemId, currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Template item not found: " + itemId));
    }

    private TaskTemplateItem buildItemEntity(TaskTemplate template, TaskTemplateItemRequest request, int fallbackOrder) {
        TaskTemplateItem templateItem = new TaskTemplateItem();
        templateItem.setTemplate(template);
        templateItem.setTitle(request.title().trim());
        templateItem.setDescription(request.description());
        templateItem.setDefaultStatus(request.defaultStatus() == null ? TaskStatus.TODO : request.defaultStatus());
        templateItem.setDefaultPriority(request.defaultPriority() == null ? TaskPriority.MEDIUM : request.defaultPriority());
        templateItem.setDefaultAssignee(
            request.defaultAssignee() == null ? TemplateDefaultAssignee.UNASSIGNED : request.defaultAssignee()
        );
        templateItem.setDueOffsetDays(request.dueOffsetDays());
        templateItem.setSortOrder(request.sortOrder() == null ? fallbackOrder : request.sortOrder());
        return templateItem;
    }

    private User resolveAssigneeForApply(TaskTemplateItem item, User me, User overrideAssignee) {
        if (overrideAssignee != null) {
            return overrideAssignee;
        }
        if (item.getDefaultAssignee() == TemplateDefaultAssignee.ME) {
            return me;
        }
        return null;
    }

    private TaskTemplateItemResponse toItemResponse(TaskTemplateItem item) {
        return new TaskTemplateItemResponse(
            item.getId(),
            item.getTemplate().getId(),
            item.getTitle(),
            item.getDescription(),
            item.getDefaultStatus(),
            item.getDefaultPriority(),
            item.getDefaultAssignee(),
            item.getDueOffsetDays(),
            item.getSortOrder(),
            item.getCreatedAt(),
            item.getUpdatedAt()
        );
    }

    private TaskTemplateResponse toResponse(TaskTemplate template) {
        List<TaskTemplateResponse.Item> items = taskTemplateItemRepository.findByTemplate_IdOrderBySortOrderAscCreatedAtAsc(template.getId())
            .stream()
            .map(item -> new TaskTemplateResponse.Item(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getDefaultStatus(),
                item.getDefaultPriority(),
                item.getDefaultAssignee(),
                item.getDueOffsetDays(),
                item.getSortOrder()
            ))
            .toList();

        return new TaskTemplateResponse(
            template.getId(),
            template.getName(),
            template.getDescription(),
            items,
            template.getCreatedAt(),
            template.getUpdatedAt()
        );
    }
}
