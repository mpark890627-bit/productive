package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.ApprovalRequest;
import com.productiv.workmanagement.domain.entity.enums.ApprovalStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, UUID> {

    Page<ApprovalRequest> findByApproverUser_IdAndStatusOrderByCreatedAtDesc(UUID approverUserId, ApprovalStatus status, Pageable pageable);

    Page<ApprovalRequest> findByApproverUser_IdOrderByCreatedAtDesc(UUID approverUserId, Pageable pageable);
}
