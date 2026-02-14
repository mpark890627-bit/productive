package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.RiskTaskLink;
import com.productiv.workmanagement.domain.entity.RiskTaskLinkId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskTaskLinkRepository extends JpaRepository<RiskTaskLink, RiskTaskLinkId> {

    boolean existsByRisk_IdAndTask_Id(UUID riskId, UUID taskId);

    void deleteByRisk_IdAndTask_Id(UUID riskId, UUID taskId);

    @EntityGraph(attributePaths = {"task"})
    List<RiskTaskLink> findByRisk_Id(UUID riskId);
}
