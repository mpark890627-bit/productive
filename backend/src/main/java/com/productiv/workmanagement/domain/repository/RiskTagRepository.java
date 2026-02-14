package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.RiskTag;
import com.productiv.workmanagement.domain.entity.RiskTagId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskTagRepository extends JpaRepository<RiskTag, RiskTagId> {

    boolean existsByRisk_IdAndTag_Id(UUID riskId, UUID tagId);

    void deleteByRisk_IdAndTag_Id(UUID riskId, UUID tagId);

    @EntityGraph(attributePaths = {"tag"})
    List<RiskTag> findByRisk_Id(UUID riskId);
}
