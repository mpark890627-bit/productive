package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.TimeEntry;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.repository.TimeEntryRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.timetracking.TimeEntryResponse;
import com.productiv.workmanagement.web.dto.timetracking.TimeEntryStopRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TimeTrackingService {

    private final TimeEntryRepository timeEntryRepository;
    private final TaskService taskService;
    private final UserRepository userRepository;

    public TimeTrackingService(TimeEntryRepository timeEntryRepository, TaskService taskService, UserRepository userRepository) {
        this.timeEntryRepository = timeEntryRepository;
        this.taskService = taskService;
        this.userRepository = userRepository;
    }

    public TimeEntryResponse start(UUID currentUserId, UUID taskId) {
        if (timeEntryRepository.findByUser_IdAndEndedAtIsNull(currentUserId).isPresent()) {
            throw new IllegalArgumentException("이미 실행 중인 타이머가 있습니다.");
        }

        var task = taskService.getOwnedTask(currentUserId, taskId);
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        TimeEntry entry = new TimeEntry();
        entry.setTask(task);
        entry.setUser(user);
        entry.setStartedAt(Instant.now());

        return toResponse(timeEntryRepository.save(entry));
    }

    public TimeEntryResponse stop(UUID currentUserId, UUID taskId, TimeEntryStopRequest request) {
        taskService.getOwnedTask(currentUserId, taskId);

        TimeEntry running = timeEntryRepository.findByUser_IdAndEndedAtIsNull(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("실행 중인 타이머가 없습니다."));

        if (!running.getTask().getId().equals(taskId)) {
            throw new IllegalArgumentException("다른 태스크 타이머가 실행 중입니다.");
        }

        Instant endedAt = Instant.now();
        running.setEndedAt(endedAt);
        running.setDurationSeconds(Duration.between(running.getStartedAt(), endedAt).toSeconds());
        running.setNote(request.note());

        return toResponse(timeEntryRepository.save(running));
    }

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getTaskEntries(UUID currentUserId, UUID taskId) {
        taskService.getOwnedTask(currentUserId, taskId);
        return timeEntryRepository.findByTask_IdAndUser_IdOrderByStartedAtDesc(taskId, currentUserId)
            .stream().map(this::toResponse).toList();
    }

    private TimeEntryResponse toResponse(TimeEntry entry) {
        return new TimeEntryResponse(
            entry.getId(),
            entry.getTask().getId(),
            entry.getStartedAt(),
            entry.getEndedAt(),
            entry.getDurationSeconds(),
            entry.getNote(),
            entry.getCreatedAt(),
            entry.getUpdatedAt()
        );
    }
}
