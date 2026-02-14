package com.productiv.workmanagement.security;

import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.repository.TaskRepository;
import com.productiv.workmanagement.global.ForbiddenException;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TaskAccessGuard {

    private final TaskRepository taskRepository;

    public TaskAccessGuard(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public Task getOwnedTaskOrThrow(UUID currentUserId, UUID taskId) {
        return taskRepository.findByIdAndProject_OwnerUser_Id(taskId, currentUserId)
            .orElseGet(() -> {
                if (taskRepository.existsById(taskId)) {
                    throw new ForbiddenException("You do not have access to this task.");
                }
                throw new ResourceNotFoundException("Task not found: " + taskId);
            });
    }
}
