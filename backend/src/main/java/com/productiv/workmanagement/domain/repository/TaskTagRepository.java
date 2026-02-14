package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.TaskTag;
import com.productiv.workmanagement.domain.entity.TaskTagId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskTagRepository extends JpaRepository<TaskTag, TaskTagId> {

    List<TaskTag> findByTask_Id(UUID taskId);

    @Query("""
        SELECT tt
        FROM TaskTag tt
        JOIN FETCH tt.tag
        WHERE tt.task.id IN :taskIds
    """)
    List<TaskTag> findWithTagByTaskIds(@Param("taskIds") List<UUID> taskIds);

    boolean existsByTask_IdAndTag_Id(UUID taskId, UUID tagId);

    void deleteByTask_Id(UUID taskId);

    void deleteByTask_IdAndTag_Id(UUID taskId, UUID tagId);
}
