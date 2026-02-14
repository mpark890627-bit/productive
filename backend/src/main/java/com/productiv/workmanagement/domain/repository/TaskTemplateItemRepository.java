package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.TaskTemplateItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskTemplateItemRepository extends JpaRepository<TaskTemplateItem, UUID> {

    List<TaskTemplateItem> findByTemplate_IdOrderBySortOrderAscCreatedAtAsc(UUID templateId);

    Optional<TaskTemplateItem> findByIdAndTemplate_OwnerUser_Id(UUID id, UUID ownerUserId);

    void deleteByTemplate_Id(UUID templateId);
}
