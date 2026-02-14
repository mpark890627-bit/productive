package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.Project;
import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.repository.ProjectRepository;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.global.ResourceNotFoundException;
import com.productiv.workmanagement.web.dto.project.ProjectCreateRequest;
import com.productiv.workmanagement.web.dto.project.ProjectResponse;
import com.productiv.workmanagement.web.dto.project.ProjectUpdateRequest;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public ProjectResponse create(UUID currentUserId, ProjectCreateRequest request) {
        User owner = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        Project project = new Project();
        project.setOwnerUser(owner);
        project.setName(request.name());
        project.setDescription(request.description());

        return toResponse(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getAllMine(UUID currentUserId, Pageable pageable) {
        return projectRepository.findByOwnerUser_Id(currentUserId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(UUID currentUserId, UUID id) {
        return toResponse(getOwnedProject(currentUserId, id));
    }

    public ProjectResponse patch(UUID currentUserId, UUID id, ProjectUpdateRequest request) {
        Project project = getOwnedProject(currentUserId, id);

        if (request.name() != null) {
            project.setName(request.name());
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }

        return toResponse(projectRepository.save(project));
    }

    public void delete(UUID currentUserId, UUID id) {
        Project project = getOwnedProject(currentUserId, id);
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public Project getOwnedProject(UUID currentUserId, UUID projectId) {
        return projectRepository.findByIdAndOwnerUser_Id(projectId, currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
            project.getId(),
            project.getOwnerUser().getId(),
            project.getName(),
            project.getDescription(),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }
}
