package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Notification;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.repository.NotificationRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.notification.NotificationResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void notifyUser(UUID userId, String type, String title, String content, String linkUrl, String meta) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setLinkUrl(linkUrl);
        notification.setMeta(meta == null ? "{}" : meta);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(UUID currentUserId, Pageable pageable) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(currentUserId, pageable).map(this::toResponse);
    }

    public NotificationResponse markRead(UUID currentUserId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Notification not found: " + notificationId);
        }

        notification.setRead(true);
        notification.setReadAt(Instant.now());
        return toResponse(notificationRepository.save(notification));
    }

    public int markAllRead(UUID currentUserId) {
        return notificationRepository.markAllRead(currentUserId, Instant.now());
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getContent(),
            notification.getLinkUrl(),
            notification.getMeta(),
            notification.isRead(),
            notification.getReadAt(),
            notification.getCreatedAt()
        );
    }
}
