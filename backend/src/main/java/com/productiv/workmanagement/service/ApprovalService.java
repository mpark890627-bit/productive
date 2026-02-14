package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.ApprovalRequest;
import com.productiv.workmanagement.domain.entity.Project;
import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.entity.enums.ApprovalStatus;
import com.productiv.workmanagement.domain.repository.ApprovalRequestRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ForbiddenException;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.approval.ApprovalCreateRequest;
import com.productiv.workmanagement.web.dto.approval.ApprovalDecisionRequest;
import com.productiv.workmanagement.web.dto.approval.ApprovalResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ApprovalService {

    private final ApprovalRequestRepository approvalRequestRepository;
    private final ProjectService projectService;
    private final TaskService taskService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ApprovalService(
        ApprovalRequestRepository approvalRequestRepository,
        ProjectService projectService,
        TaskService taskService,
        UserRepository userRepository,
        NotificationService notificationService
    ) {
        this.approvalRequestRepository = approvalRequestRepository;
        this.projectService = projectService;
        this.taskService = taskService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public ApprovalResponse create(UUID currentUserId, ApprovalCreateRequest request) {
        Project project = projectService.getOwnedProject(currentUserId, request.projectId());

        Task task = null;
        if (request.taskId() != null) {
            task = taskService.getOwnedTask(currentUserId, request.taskId());
        }

        User approver = userRepository.findById(request.approverUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Approver not found: " + request.approverUserId()));

        User requester = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        ApprovalRequest approvalRequest = new ApprovalRequest();
        approvalRequest.setProject(project);
        approvalRequest.setTask(task);
        approvalRequest.setRequesterUser(requester);
        approvalRequest.setApproverUser(approver);
        approvalRequest.setStatus(ApprovalStatus.PENDING);
        approvalRequest.setReason(request.reason());

        ApprovalRequest saved = approvalRequestRepository.save(approvalRequest);

        notificationService.notifyUser(
            approver.getId(),
            "APPROVAL_REQUESTED",
            "승인 요청이 도착했습니다",
            "요청자: " + requester.getName(),
            "/app/approvals",
            "{\"approvalRequestId\":\"" + saved.getId() + "\"}"
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ApprovalResponse> getMyApprovals(UUID currentUserId, ApprovalStatus status, Pageable pageable) {
        Page<ApprovalRequest> page;
        if (status == null) {
            page = approvalRequestRepository.findByApproverUser_IdOrderByCreatedAtDesc(currentUserId, pageable);
        } else {
            page = approvalRequestRepository.findByApproverUser_IdAndStatusOrderByCreatedAtDesc(currentUserId, status, pageable);
        }
        return page.map(this::toResponse);
    }

    public ApprovalResponse approve(UUID currentUserId, UUID id, ApprovalDecisionRequest request) {
        return decide(currentUserId, id, ApprovalStatus.APPROVED, request.comment());
    }

    public ApprovalResponse reject(UUID currentUserId, UUID id, ApprovalDecisionRequest request) {
        return decide(currentUserId, id, ApprovalStatus.REJECTED, request.comment());
    }

    private ApprovalResponse decide(UUID currentUserId, UUID id, ApprovalStatus status, String comment) {
        ApprovalRequest approvalRequest = approvalRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Approval request not found: " + id));

        if (!approvalRequest.getApproverUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("승인 권한이 없습니다.");
        }

        if (approvalRequest.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("이미 처리된 승인 요청입니다.");
        }

        approvalRequest.setStatus(status);
        approvalRequest.setDecisionComment(comment);
        approvalRequest.setDecidedAt(Instant.now());

        ApprovalRequest saved = approvalRequestRepository.save(approvalRequest);

        notificationService.notifyUser(
            saved.getRequesterUser().getId(),
            "APPROVAL_DECIDED",
            "승인 요청이 처리되었습니다",
            "결과: " + status.name(),
            "/app/approvals",
            "{\"approvalRequestId\":\"" + saved.getId() + "\",\"status\":\"" + status.name() + "\"}"
        );

        return toResponse(saved);
    }

    private ApprovalResponse toResponse(ApprovalRequest approvalRequest) {
        return new ApprovalResponse(
            approvalRequest.getId(),
            approvalRequest.getProject().getId(),
            approvalRequest.getTask() == null ? null : approvalRequest.getTask().getId(),
            approvalRequest.getRequesterUser().getId(),
            approvalRequest.getApproverUser().getId(),
            approvalRequest.getStatus(),
            approvalRequest.getReason(),
            approvalRequest.getDecisionComment(),
            approvalRequest.getDecidedAt(),
            approvalRequest.getCreatedAt(),
            approvalRequest.getUpdatedAt()
        );
    }
}
