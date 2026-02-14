package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.DueReminderEvent;
import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.repository.DueReminderEventRepository;
import com.productiv.workmanagement.domain.repository.TaskRepository;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DueReminderService {

    private final TaskRepository taskRepository;
    private final DueReminderEventRepository dueReminderEventRepository;
    private final NotificationService notificationService;

    @Value("${app.reminder.due-soon-days:2}")
    private int dueSoonDays;

    public DueReminderService(
        TaskRepository taskRepository,
        DueReminderEventRepository dueReminderEventRepository,
        NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.dueReminderEventRepository = dueReminderEventRepository;
        this.notificationService = notificationService;
    }

    public int processDueReminders() {
        LocalDate today = LocalDate.now();
        LocalDate maxDueDate = today.plusDays(Math.max(0, dueSoonDays));

        int sent = 0;
        for (Task task : taskRepository.findDueTasks(maxDueDate, PageRequest.of(0, 200)).getContent()) {
            User recipient = task.getAssigneeUser() != null ? task.getAssigneeUser() : task.getProject().getOwnerUser();
            if (recipient == null || task.getDueDate() == null) {
                continue;
            }

            String reminderType = task.getDueDate().isBefore(today) ? "OVERDUE" : "DUE_SOON";
            if (dueReminderEventRepository.existsByTask_IdAndUser_IdAndReminderTypeAndReminderDate(
                task.getId(),
                recipient.getId(),
                reminderType,
                today
            )) {
                continue;
            }

            DueReminderEvent event = new DueReminderEvent();
            event.setTask(task);
            event.setUser(recipient);
            event.setReminderType(reminderType);
            event.setReminderDate(today);
            dueReminderEventRepository.save(event);

            String content = reminderType.equals("OVERDUE")
                ? "태스크가 연체되었습니다: " + task.getTitle()
                : "마감 임박 태스크: " + task.getTitle() + " (" + task.getDueDate() + ")";

            notificationService.notifyUser(
                recipient.getId(),
                reminderType,
                reminderType.equals("OVERDUE") ? "연체 태스크 알림" : "마감 임박 알림",
                content,
                "/app/projects/" + task.getProject().getId() + "/board",
                "{\"taskId\":\"" + task.getId() + "\"}"
            );
            sent++;
        }

        return sent;
    }
}
