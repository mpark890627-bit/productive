package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.RiskAction;
import com.productiv.workmanagement.domain.entity.enums.RiskActionStatus;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskActionRepository extends JpaRepository<RiskAction, UUID> {

    @EntityGraph(attributePaths = {"assigneeUser"})
    Page<RiskAction> findByRisk_Id(UUID riskId, Pageable pageable);

    @EntityGraph(attributePaths = {"assigneeUser"})
    Optional<RiskAction> findByIdAndRisk_Project_OwnerUser_Id(UUID id, UUID ownerUserId);

    long countByRisk_Project_IdAndStatusNotAndDueDateBefore(UUID projectId, RiskActionStatus status, LocalDate dueDate);
}
