package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.DueReminderEvent;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DueReminderEventRepository extends JpaRepository<DueReminderEvent, UUID> {

    boolean existsByTask_IdAndUser_IdAndReminderTypeAndReminderDate(
        UUID taskId,
        UUID userId,
        String reminderType,
        LocalDate reminderDate
    );
}
