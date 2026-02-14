package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.ProjectContact;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectContactRepository extends JpaRepository<ProjectContact, UUID> {

    List<ProjectContact> findByProject_IdOrderByCreatedAtDesc(UUID projectId);

    Optional<ProjectContact> findByIdAndProject_Id(UUID id, UUID projectId);
}
