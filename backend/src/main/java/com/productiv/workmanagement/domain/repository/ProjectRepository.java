package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.Project;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Page<Project> findByOwnerUser_Id(UUID ownerUserId, Pageable pageable);

    Optional<Project> findByIdAndOwnerUser_Id(UUID id, UUID ownerUserId);
}
