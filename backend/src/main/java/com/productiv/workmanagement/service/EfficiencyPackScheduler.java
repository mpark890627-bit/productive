package com.productiv.workmanagement.service;

import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EfficiencyPackScheduler {

    private static final long RECURRING_LOCK_KEY = 61001L;
    private static final long REMINDER_LOCK_KEY = 61002L;

    private final SchedulerLockService schedulerLockService;
    private final RecurringTaskService recurringTaskService;
    private final DueReminderService dueReminderService;

    public EfficiencyPackScheduler(
        SchedulerLockService schedulerLockService,
        RecurringTaskService recurringTaskService,
        DueReminderService dueReminderService
    ) {
        this.schedulerLockService = schedulerLockService;
        this.recurringTaskService = recurringTaskService;
        this.dueReminderService = dueReminderService;
    }

    @Scheduled(fixedDelayString = "${app.scheduler.recurring-fixed-delay-ms:60000}")
    public void processRecurringRules() {
        if (!schedulerLockService.tryLock(RECURRING_LOCK_KEY)) {
            return;
        }
        try {
            recurringTaskService.processDueRules(Instant.now());
        } finally {
            schedulerLockService.unlock(RECURRING_LOCK_KEY);
        }
    }

    @Scheduled(fixedDelayString = "${app.scheduler.reminder-fixed-delay-ms:120000}")
    public void processDueReminders() {
        if (!schedulerLockService.tryLock(REMINDER_LOCK_KEY)) {
            return;
        }
        try {
            dueReminderService.processDueReminders();
        } finally {
            schedulerLockService.unlock(REMINDER_LOCK_KEY);
        }
    }
}
