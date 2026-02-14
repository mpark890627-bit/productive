package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.Notification;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Notification n
        SET n.isRead = true, n.readAt = :readAt
        WHERE n.user.id = :userId AND n.isRead = false
    """)
    int markAllRead(@Param("userId") UUID userId, @Param("readAt") Instant readAt);
}
