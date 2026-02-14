package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.RecurringTaskRule;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringTaskRuleRepository extends JpaRepository<RecurringTaskRule, UUID> {

    List<RecurringTaskRule> findByOwnerUser_IdOrderByCreatedAtDesc(UUID ownerUserId);

    Optional<RecurringTaskRule> findByIdAndOwnerUser_Id(UUID id, UUID ownerUserId);

    List<RecurringTaskRule> findTop20ByActiveTrueAndNextRunAtLessThanEqualOrderByNextRunAtAsc(Instant now);
}
