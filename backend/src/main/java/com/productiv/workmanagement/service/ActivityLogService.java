package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.ActivityLog;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.repository.ActivityLogRepository;
import com.productiv.workmanagement.domain.repository.ProjectRepository;
import com.productiv.workmanagement.domain.repository.RiskRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ForbiddenException;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.security.TaskAccessGuard;
import com.productiv.workmanagement.web.dto.activity.ActivityLogResponse;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final RiskRepository riskRepository;
    private final TaskAccessGuard taskAccessGuard;

    public ActivityLogService(
        ActivityLogRepository activityLogRepository,
        UserRepository userRepository,
        ProjectRepository projectRepository,
        RiskRepository riskRepository,
        TaskAccessGuard taskAccessGuard
    ) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.riskRepository = riskRepository;
        this.taskAccessGuard = taskAccessGuard;
    }

    public void log(UUID actorUserId, String entityType, UUID entityId, String action, Map<String, Object> meta) {
        User actor = userRepository.findById(actorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + actorUserId));

        ActivityLog log = new ActivityLog();
        log.setActorUser(actor);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setMeta(meta);
        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogResponse> getByEntity(UUID currentUserId, String entityType, UUID entityId, Pageable pageable) {
        validateOwnership(currentUserId, entityType, entityId);
        return activityLogRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable)
            .map(this::toResponse);
    }

    private void validateOwnership(UUID currentUserId, String entityType, UUID entityId) {
        String normalizedType = entityType.toUpperCase();
        if ("PROJECT".equals(normalizedType)) {
            projectRepository.findByIdAndOwnerUser_Id(entityId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + entityId));
            return;
        }
        if ("TASK".equals(normalizedType)) {
            taskAccessGuard.getOwnedTaskOrThrow(currentUserId, entityId);
            return;
        }
        if ("RISK".equals(normalizedType)) {
            if (riskRepository.existsByIdAndProject_OwnerUser_Id(entityId, currentUserId)) {
                return;
            }
            if (riskRepository.existsById(entityId)) {
                throw new ForbiddenException("You do not have access to this risk.");
            }
            throw new ResourceNotFoundException("Risk not found: " + entityId);
        }
    }

    private ActivityLogResponse toResponse(ActivityLog entity) {
        return new ActivityLogResponse(
            entity.getId(),
            entity.getActorUser().getId(),
            entity.getEntityType(),
            entity.getEntityId(),
            entity.getAction(),
            entity.getMeta(),
            entity.getCreatedAt()
        );
    }
}
