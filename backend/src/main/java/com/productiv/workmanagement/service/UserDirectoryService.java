package com.productiv.workmanagement.service;

import com.productiv.workmanagement.domain.entity.User;
import com.productiv.workmanagement.domain.repository.UserRepository;
import com.productiv.workmanagement.web.dto.user.UserOptionResponse;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserDirectoryService {

    private final UserRepository userRepository;
    private final ProjectService projectService;

    public UserDirectoryService(UserRepository userRepository, ProjectService projectService) {
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    public Page<UserOptionResponse> searchUsersInProject(UUID currentUserId, UUID projectId, String keyword, Pageable pageable) {
        projectService.getOwnedProject(currentUserId, projectId);

        String normalizedKeyword = normalize(keyword);
        Page<User> page = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            normalizedKeyword,
            normalizedKeyword,
            pageable
        );
        return page.map(user -> new UserOptionResponse(
            user.getId(),
            user.getName(),
            user.getEmail()
        ));
    }

    private String normalize(String keyword) {
        if (keyword == null) {
            return "";
        }
        return keyword.trim();
    }
}
