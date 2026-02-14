package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Risk;
import com.productiv.workmanagement.domain.entity.RiskAction;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.entity.enums.RiskActionStatus;
import com.productiv.workmanagement.domain.repository.RiskActionRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.security.RiskAccessGuard;
import com.productiv.workmanagement.web.dto.risk.RiskActionCreateRequest;
import com.productiv.workmanagement.web.dto.risk.RiskActionResponse;
import com.productiv.workmanagement.web.dto.risk.RiskActionUpdateRequest;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RiskActionService {

    private final RiskActionRepository riskActionRepository;
    private final RiskAccessGuard riskAccessGuard;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public RiskActionService(
        RiskActionRepository riskActionRepository,
        RiskAccessGuard riskAccessGuard,
        UserRepository userRepository,
        ActivityLogService activityLogService
    ) {
        this.riskActionRepository = riskActionRepository;
        this.riskAccessGuard = riskAccessGuard;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    public RiskActionResponse create(UUID currentUserId, UUID riskId, RiskActionCreateRequest request) {
        Risk risk = riskAccessGuard.getOwnedRiskOrThrow(currentUserId, riskId);

        RiskAction action = new RiskAction();
        action.setRisk(risk);
        action.setTitle(request.title().trim());
        action.setDescription(trimToNull(request.description()));
        action.setStatus(request.status() == null ? RiskActionStatus.OPEN : request.status());
        action.setDueDate(request.dueDate());
        action.setAssigneeUser(resolveAssignee(request.assigneeUserId()));

        RiskAction saved = riskActionRepository.save(action);
        activityLogService.log(
            currentUserId,
            "RISK",
            riskId,
            "RISK_ACTION_CREATED",
            Map.of(
                "riskId", riskId.toString(),
                "projectId", risk.getProject().getId().toString(),
                "actionId", saved.getId().toString(),
                "status", saved.getStatus().name()
            )
        );
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<RiskActionResponse> getByRisk(UUID currentUserId, UUID riskId, Pageable pageable) {
        riskAccessGuard.getOwnedRiskOrThrow(currentUserId, riskId);
        return riskActionRepository.findByRisk_Id(riskId, pageable).map(this::toResponse);
    }

    public RiskActionResponse patch(UUID currentUserId, UUID actionId, RiskActionUpdateRequest request) {
        RiskAction action = riskActionRepository.findByIdAndRisk_Project_OwnerUser_Id(actionId, currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Risk action not found: " + actionId));

        RiskActionStatus beforeStatus = action.getStatus();

        if (request.title() != null) {
            String title = request.title().trim();
            if (title.isEmpty()) {
                throw new IllegalArgumentException("Risk action title must not be blank");
            }
            action.setTitle(title);
        }
        if (request.description() != null) {
            action.setDescription(trimToNull(request.description()));
        }
        if (request.status() != null) {
            action.setStatus(request.status());
        }
        if (request.dueDate() != null) {
            action.setDueDate(request.dueDate());
        }
        if (request.assigneeUserId() != null) {
            action.setAssigneeUser(resolveAssignee(request.assigneeUserId()));
        }

        RiskAction saved = riskActionRepository.save(action);
        String actionType = saved.getStatus() == RiskActionStatus.DONE && beforeStatus != RiskActionStatus.DONE
            ? "RISK_ACTION_DONE"
            : "RISK_ACTION_UPDATED";

        activityLogService.log(
            currentUserId,
            "RISK",
            saved.getRisk().getId(),
            actionType,
            Map.of(
                "riskId", saved.getRisk().getId().toString(),
                "projectId", saved.getRisk().getProject().getId().toString(),
                "actionId", saved.getId().toString(),
                "status", saved.getStatus().name()
            )
        );

        return toResponse(saved);
    }

    public void delete(UUID currentUserId, UUID actionId) {
        RiskAction action = riskActionRepository.findByIdAndRisk_Project_OwnerUser_Id(actionId, currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Risk action not found: " + actionId));
        riskActionRepository.delete(action);
    }

    @Transactional(readOnly = true)
    public long countOverdueActions(UUID projectId) {
        return riskActionRepository.countByRisk_Project_IdAndStatusNotAndDueDateBefore(
            projectId,
            RiskActionStatus.DONE,
            LocalDate.now()
        );
    }

    private RiskActionResponse toResponse(RiskAction action) {
        UUID assigneeId = action.getAssigneeUser() == null ? null : action.getAssigneeUser().getId();
        String assigneeName = action.getAssigneeUser() == null ? null : action.getAssigneeUser().getName();
        return new RiskActionResponse(
            action.getId(),
            action.getRisk().getId(),
            action.getTitle(),
            action.getDescription(),
            action.getStatus(),
            action.getDueDate(),
            assigneeId,
            assigneeName,
            action.getCreatedAt(),
            action.getUpdatedAt()
        );
    }

    private User resolveAssignee(UUID assigneeUserId) {
        if (assigneeUserId == null) {
            return null;
        }
        return userRepository.findById(assigneeUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assigneeUserId));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
