package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.RiskComment;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskCommentRepository extends JpaRepository<RiskComment, UUID> {

    @EntityGraph(attributePaths = {"authorUser"})
    Page<RiskComment> findByRisk_Id(UUID riskId, Pageable pageable);

    @EntityGraph(attributePaths = {"authorUser"})
    Optional<RiskComment> findByIdAndRisk_Project_OwnerUser_Id(UUID id, UUID ownerUserId);
}
