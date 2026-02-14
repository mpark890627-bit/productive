package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.SavedView;
import com.productiv.workmanagement.domain.entity.enums.SavedViewTargetType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedViewRepository extends JpaRepository<SavedView, UUID> {

    List<SavedView> findByUser_IdAndTargetTypeOrderByCreatedAtDesc(UUID userId, SavedViewTargetType targetType);

    Optional<SavedView> findByIdAndUser_Id(UUID id, UUID userId);
}
