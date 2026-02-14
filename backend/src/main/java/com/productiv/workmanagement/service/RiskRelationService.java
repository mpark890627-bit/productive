package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Risk;
import com.productiv.workmanagement.domain.entity.RiskTag;
import com.productiv.workmanagement.domain.entity.RiskTagId;
import com.productiv.workmanagement.domain.entity.RiskTaskLink;
import com.productiv.workmanagement.domain.entity.RiskTaskLinkId;
import com.productiv.workmanagement.domain.entity.Tag;
import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.repository.RiskTagRepository;
import com.productiv.workmanagement.domain.repository.RiskTaskLinkRepository;
import com.productiv.workmanagement.domain.repository.TagRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.risk.RiskLinkedTaskResponse;
import com.productiv.workmanagement.web.dto.risk.RiskTagResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RiskRelationService {

    private final RiskService riskService;
    private final TaskService taskService;
    private final RiskTaskLinkRepository riskTaskLinkRepository;
    private final TagRepository tagRepository;
    private final RiskTagRepository riskTagRepository;

    public RiskRelationService(
        RiskService riskService,
        TaskService taskService,
        RiskTaskLinkRepository riskTaskLinkRepository,
        TagRepository tagRepository,
        RiskTagRepository riskTagRepository
    ) {
        this.riskService = riskService;
        this.taskService = taskService;
        this.riskTaskLinkRepository = riskTaskLinkRepository;
        this.tagRepository = tagRepository;
        this.riskTagRepository = riskTagRepository;
    }

    public void linkTask(UUID currentUserId, UUID riskId, UUID taskId) {
        Risk risk = riskService.getOwnedRisk(currentUserId, riskId);
        Task task = taskService.getOwnedTask(currentUserId, taskId);

        if (!risk.getProject().getId().equals(task.getProject().getId())) {
            throw new IllegalArgumentException("Risk and task must belong to the same project");
        }

        if (riskTaskLinkRepository.existsByRisk_IdAndTask_Id(riskId, taskId)) {
            return;
        }

        RiskTaskLink link = new RiskTaskLink();
        link.setId(new RiskTaskLinkId(riskId, taskId));
        link.setRisk(risk);
        link.setTask(task);
        riskTaskLinkRepository.save(link);
    }

    public void unlinkTask(UUID currentUserId, UUID riskId, UUID taskId) {
        riskService.getOwnedRisk(currentUserId, riskId);
        riskTaskLinkRepository.deleteByRisk_IdAndTask_Id(riskId, taskId);
    }

    @Transactional(readOnly = true)
    public List<RiskLinkedTaskResponse> getLinkedTasks(UUID currentUserId, UUID riskId) {
        riskService.getOwnedRisk(currentUserId, riskId);
        return riskTaskLinkRepository.findByRisk_Id(riskId).stream()
            .map(link -> new RiskLinkedTaskResponse(
                link.getTask().getId(),
                link.getTask().getTitle(),
                link.getTask().getStatus(),
                link.getTask().getPriority(),
                link.getTask().getDueDate()
            ))
            .toList();
    }

    public void addTag(UUID currentUserId, UUID riskId, UUID tagId) {
        Risk risk = riskService.getOwnedRisk(currentUserId, riskId);
        Tag tag = tagRepository.findById(tagId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + tagId));

        if (riskTagRepository.existsByRisk_IdAndTag_Id(riskId, tagId)) {
            return;
        }

        RiskTag link = new RiskTag();
        link.setId(new RiskTagId(riskId, tagId));
        link.setRisk(risk);
        link.setTag(tag);
        riskTagRepository.save(link);
    }

    public void removeTag(UUID currentUserId, UUID riskId, UUID tagId) {
        riskService.getOwnedRisk(currentUserId, riskId);
        riskTagRepository.deleteByRisk_IdAndTag_Id(riskId, tagId);
    }

    @Transactional(readOnly = true)
    public List<RiskTagResponse> getTags(UUID currentUserId, UUID riskId) {
        riskService.getOwnedRisk(currentUserId, riskId);
        return riskTagRepository.findByRisk_Id(riskId).stream()
            .map(link -> new RiskTagResponse(link.getTag().getId(), link.getTag().getName()))
            .toList();
    }
}
