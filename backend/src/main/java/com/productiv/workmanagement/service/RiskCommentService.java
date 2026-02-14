package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Risk;
import com.productiv.workmanagement.domain.entity.RiskComment;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.repository.RiskCommentRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.risk.RiskCommentCreateRequest;
import com.productiv.workmanagement.web.dto.risk.RiskCommentResponse;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RiskCommentService {

    private final RiskService riskService;
    private final RiskCommentRepository riskCommentRepository;
    private final UserRepository userRepository;

    public RiskCommentService(
        RiskService riskService,
        RiskCommentRepository riskCommentRepository,
        UserRepository userRepository
    ) {
        this.riskService = riskService;
        this.riskCommentRepository = riskCommentRepository;
        this.userRepository = userRepository;
    }

    public RiskCommentResponse create(UUID currentUserId, UUID riskId, RiskCommentCreateRequest request) {
        Risk risk = riskService.getOwnedRisk(currentUserId, riskId);
        User author = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        RiskComment comment = new RiskComment();
        comment.setRisk(risk);
        comment.setAuthorUser(author);
        comment.setContent(request.content().trim());
        return toResponse(riskCommentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public Page<RiskCommentResponse> getByRisk(UUID currentUserId, UUID riskId, Pageable pageable) {
        riskService.getOwnedRisk(currentUserId, riskId);
        return riskCommentRepository.findByRisk_Id(riskId, pageable).map(this::toResponse);
    }

    public void delete(UUID currentUserId, UUID commentId) {
        RiskComment comment = riskCommentRepository.findByIdAndRisk_Project_OwnerUser_Id(commentId, currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Risk comment not found: " + commentId));
        riskCommentRepository.delete(comment);
    }

    private RiskCommentResponse toResponse(RiskComment comment) {
        return new RiskCommentResponse(
            comment.getId(),
            comment.getRisk().getId(),
            comment.getAuthorUser().getId(),
            comment.getAuthorUser().getName(),
            comment.getContent(),
            comment.getCreatedAt(),
            comment.getUpdatedAt()
        );
    }
}
