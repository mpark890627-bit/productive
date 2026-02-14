package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.TaskTemplate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, UUID> {

    List<TaskTemplate> findByOwnerUser_IdOrderByCreatedAtDesc(UUID ownerUserId);

    Page<TaskTemplate> findByOwnerUser_Id(UUID ownerUserId, Pageable pageable);

    Optional<TaskTemplate> findByIdAndOwnerUser_Id(UUID id, UUID ownerUserId);
}
