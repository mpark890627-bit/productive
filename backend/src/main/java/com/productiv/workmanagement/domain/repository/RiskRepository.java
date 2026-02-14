package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.Risk;
import com.productiv.workmanagement.domain.entity.enums.RiskStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RiskRepository extends JpaRepository<Risk, UUID>, JpaSpecificationExecutor<Risk> {

    @EntityGraph(attributePaths = {"ownerUser"})
    Optional<Risk> findByIdAndProject_Id(UUID id, UUID projectId);

    boolean existsByIdAndProject_OwnerUser_Id(UUID id, UUID ownerUserId);

    @EntityGraph(attributePaths = {"ownerUser"})
    Optional<Risk> findByIdAndProject_OwnerUser_Id(UUID id, UUID ownerUserId);

    @Query("""
        SELECT r.status, COUNT(r)
        FROM Risk r
        WHERE r.project.id = :projectId
        GROUP BY r.status
    """)
    List<Object[]> countByStatusInProject(@Param("projectId") UUID projectId);

    @Query("""
        SELECT r.levelScore
        FROM Risk r
        WHERE r.project.id = :projectId
    """)
    List<Integer> findLevelScoresByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT r.project.id FROM Risk r WHERE r.id = :riskId")
    Optional<UUID> findProjectIdByRiskId(@Param("riskId") UUID riskId);

    @Query("SELECT r.title FROM Risk r WHERE r.id = :riskId")
    Optional<String> findTitleById(@Param("riskId") UUID riskId);
}
