package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Project;
import com.productiv.workmanagement.domain.entity.RecurringTaskRule;
import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.repository.RecurringTaskRuleRepository;
import com.productiv.workmanagement.web.dto.recurring.RecurringRuleCreateRequest;
import com.productiv.workmanagement.web.dto.recurring.RecurringRuleResponse;
import com.productiv.workmanagement.web.dto.recurring.RecurringRuleUpdateRequest;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RecurringTaskService {

    private final RecurringTaskRuleRepository recurringTaskRuleRepository;
    private final ProjectService projectService;
    private final NotificationService notificationService;
    private final com.productiv.workmanagement.domain.repository.TaskRepository taskRepository;

    public RecurringTaskService(
        RecurringTaskRuleRepository recurringTaskRuleRepository,
        ProjectService projectService,
        NotificationService notificationService,
        com.productiv.workmanagement.domain.repository.TaskRepository taskRepository
    ) {
        this.recurringTaskRuleRepository = recurringTaskRuleRepository;
        this.projectService = projectService;
        this.notificationService = notificationService;
        this.taskRepository = taskRepository;
    }

    public RecurringRuleResponse create(UUID currentUserId, RecurringRuleCreateRequest request) {
        Project project = projectService.getOwnedProject(currentUserId, request.projectId());

        RecurringTaskRule rule = new RecurringTaskRule();
        rule.setProject(project);
        rule.setOwnerUser(project.getOwnerUser());
        rule.setTitle(request.title().trim());
        rule.setDescription(request.description());
        rule.setStatus(request.status() == null ? com.productiv.workmanagement.domain.entity.enums.TaskStatus.TODO : request.status());
        rule.setPriority(request.priority() == null ? com.productiv.workmanagement.domain.entity.enums.TaskPriority.MEDIUM : request.priority());
        rule.setDueOffsetDays(request.dueOffsetDays());
        rule.setIntervalType(request.intervalType());
        rule.setIntervalValue(Math.max(1, request.intervalValue()));
        rule.setNextRunAt(request.nextRunAt());
        rule.setActive(true);

        return toResponse(recurringTaskRuleRepository.save(rule));
    }

    @Transactional(readOnly = true)
    public List<RecurringRuleResponse> getMine(UUID currentUserId) {
        return recurringTaskRuleRepository.findByOwnerUser_IdOrderByCreatedAtDesc(currentUserId).stream().map(this::toResponse).toList();
    }

    public RecurringRuleResponse patch(UUID currentUserId, UUID id, RecurringRuleUpdateRequest request) {
        RecurringTaskRule rule = recurringTaskRuleRepository.findByIdAndOwnerUser_Id(id, currentUserId)
            .orElseThrow(() -> new com.productiv.workmanagement.global.ResourceNotFoundException("Recurring rule not found: " + id));

        if (request.active() != null) {
            rule.setActive(request.active());
        }

        return toResponse(recurringTaskRuleRepository.save(rule));
    }

    public void delete(UUID currentUserId, UUID id) {
        RecurringTaskRule rule = recurringTaskRuleRepository.findByIdAndOwnerUser_Id(id, currentUserId)
            .orElseThrow(() -> new com.productiv.workmanagement.global.ResourceNotFoundException("Recurring rule not found: " + id));
        recurringTaskRuleRepository.delete(rule);
    }

    public int processDueRules(Instant now) {
        List<RecurringTaskRule> dueRules = recurringTaskRuleRepository.findTop20ByActiveTrueAndNextRunAtLessThanEqualOrderByNextRunAtAsc(now);
        int generated = 0;

        for (RecurringTaskRule rule : dueRules) {
            if (!rule.isActive() || rule.getNextRunAt().isAfter(now)) {
                continue;
            }

            Task task = new Task();
            task.setProject(rule.getProject());
            task.setTitle(rule.getTitle());
            task.setDescription(rule.getDescription());
            task.setStatus(rule.getStatus());
            task.setPriority(rule.getPriority());
            task.setAssigneeUser(null);
            task.setDueDate(resolveDueDate(rule));
            Task saved = taskRepository.save(task);

            Instant nextRun = computeNextRun(rule.getNextRunAt(), rule.getIntervalType(), rule.getIntervalValue());
            rule.setLastGeneratedAt(now);
            rule.setNextRunAt(nextRun);
            recurringTaskRuleRepository.save(rule);
            generated++;

            notificationService.notifyUser(
                rule.getOwnerUser().getId(),
                "RECURRING_TASK_CREATED",
                "반복 태스크가 생성되었습니다",
                "생성된 태스크: " + saved.getTitle(),
                "/app/projects/" + rule.getProject().getId() + "/board",
                "{}"
            );
        }

        return generated;
    }

    private LocalDate resolveDueDate(RecurringTaskRule rule) {
        if (rule.getDueOffsetDays() == null) {
            return null;
        }
        return LocalDate.now(ZoneOffset.UTC).plusDays(rule.getDueOffsetDays());
    }

    private Instant computeNextRun(Instant base, com.productiv.workmanagement.domain.entity.enums.RecurringIntervalType type, int value) {
        return switch (type) {
            case DAILY -> base.plusSeconds(86400L * value);
            case WEEKLY -> base.plusSeconds(604800L * value);
            case MONTHLY -> base.plusSeconds(2629746L * value);
        };
    }

    private RecurringRuleResponse toResponse(RecurringTaskRule rule) {
        return new RecurringRuleResponse(
            rule.getId(),
            rule.getProject().getId(),
            rule.getTitle(),
            rule.getDescription(),
            rule.getStatus(),
            rule.getPriority(),
            rule.getDueOffsetDays(),
            rule.getIntervalType(),
            rule.getIntervalValue(),
            rule.getNextRunAt(),
            rule.isActive(),
            rule.getLastGeneratedAt(),
            rule.getCreatedAt(),
            rule.getUpdatedAt()
        );
    }
}
