package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.TimeEntry;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, UUID> {

    Optional<TimeEntry> findByUser_IdAndEndedAtIsNull(UUID userId);

    List<TimeEntry> findByTask_IdAndUser_IdOrderByStartedAtDesc(UUID taskId, UUID userId);
}
