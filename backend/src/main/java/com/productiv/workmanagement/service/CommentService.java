package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Comment;
import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.repository.CommentRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.comment.CommentCreateRequest;
import com.productiv.workmanagement.web.dto.comment.CommentResponse;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;

    public CommentService(
        CommentRepository commentRepository,
        UserRepository userRepository,
        TaskService taskService
    ) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.taskService = taskService;
    }

    public CommentResponse create(UUID currentUserId, UUID taskId, CommentCreateRequest request) {
        Task task = taskService.getOwnedTask(currentUserId, taskId);
        User author = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setAuthorUser(author);
        comment.setContent(request.content());

        return toResponse(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getByTaskId(UUID currentUserId, UUID taskId, Pageable pageable) {
        taskService.getOwnedTask(currentUserId, taskId);
        return commentRepository.findByTask_Id(taskId, pageable).map(this::toResponse);
    }

    public void delete(UUID currentUserId, UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        taskService.getOwnedTask(currentUserId, comment.getTask().getId());
        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
            comment.getId(),
            comment.getTask().getId(),
            comment.getAuthorUser().getId(),
            comment.getAuthorUser().getName(),
            comment.getContent(),
            comment.getCreatedAt(),
            comment.getUpdatedAt()
        );
    }
}
