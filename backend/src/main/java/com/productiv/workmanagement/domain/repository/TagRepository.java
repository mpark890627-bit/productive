package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.Tag;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findByName(String name);

    List<Tag> findByIdIn(Collection<UUID> ids);

    List<Tag> findByNameContainingIgnoreCaseOrderByNameAsc(String keyword);

    List<Tag> findAllByOrderByNameAsc();
}
