package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Project;
import com.productiv.workmanagement.domain.entity.ProjectContact;
import com.productiv.workmanagement.domain.repository.ProjectContactRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.projectcontact.ProjectContactCreateRequest;
import com.productiv.workmanagement.web.dto.projectcontact.ProjectContactResponse;
import com.productiv.workmanagement.web.dto.projectcontact.ProjectContactUpdateRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectContactService {

    private final ProjectContactRepository projectContactRepository;
    private final ProjectService projectService;

    public ProjectContactService(
        ProjectContactRepository projectContactRepository,
        ProjectService projectService
    ) {
        this.projectContactRepository = projectContactRepository;
        this.projectService = projectService;
    }

    @Transactional(readOnly = true)
    public List<ProjectContactResponse> getAll(UUID currentUserId, UUID projectId) {
        projectService.getOwnedProject(currentUserId, projectId);
        return projectContactRepository.findByProject_IdOrderByCreatedAtDesc(projectId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public ProjectContactResponse create(UUID currentUserId, UUID projectId, ProjectContactCreateRequest request) {
        Project project = projectService.getOwnedProject(currentUserId, projectId);

        ProjectContact contact = new ProjectContact();
        contact.setProject(project);
        contact.setName(normalizeRequiredName(request.name()));
        contact.setRole(trimToNull(request.role()));
        contact.setEmail(trimToNull(request.email()));
        contact.setPhone(trimToNull(request.phone()));
        contact.setMemo(trimToNull(request.memo()));

        return toResponse(projectContactRepository.save(contact));
    }

    public ProjectContactResponse patch(
        UUID currentUserId,
        UUID projectId,
        UUID contactId,
        ProjectContactUpdateRequest request
    ) {
        projectService.getOwnedProject(currentUserId, projectId);
        ProjectContact contact = findByIdAndProjectId(contactId, projectId);

        if (request.name() != null) {
            contact.setName(normalizeRequiredName(request.name()));
        }
        if (request.role() != null) {
            contact.setRole(trimToNull(request.role()));
        }
        if (request.email() != null) {
            contact.setEmail(trimToNull(request.email()));
        }
        if (request.phone() != null) {
            contact.setPhone(trimToNull(request.phone()));
        }
        if (request.memo() != null) {
            contact.setMemo(trimToNull(request.memo()));
        }

        return toResponse(projectContactRepository.save(contact));
    }

    public void delete(UUID currentUserId, UUID projectId, UUID contactId) {
        projectService.getOwnedProject(currentUserId, projectId);
        ProjectContact contact = findByIdAndProjectId(contactId, projectId);
        projectContactRepository.delete(contact);
    }

    private ProjectContact findByIdAndProjectId(UUID contactId, UUID projectId) {
        return projectContactRepository.findByIdAndProject_Id(contactId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project contact not found: " + contactId));
    }

    private ProjectContactResponse toResponse(ProjectContact contact) {
        return new ProjectContactResponse(
            contact.getId(),
            contact.getProject().getId(),
            contact.getName(),
            contact.getRole(),
            contact.getEmail(),
            contact.getPhone(),
            contact.getMemo(),
            contact.getCreatedAt(),
            contact.getUpdatedAt()
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeRequiredName(String value) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Contact name must not be blank");
        }
        return trimmed;
    }
}
