package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.TaskWatcher;
import com.productiv.workmanagement.domain.entity.TaskWatcherId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskWatcherRepository extends JpaRepository<TaskWatcher, TaskWatcherId> {

    boolean existsByTask_IdAndUser_Id(UUID taskId, UUID userId);

    void deleteByTask_IdAndUser_Id(UUID taskId, UUID userId);

    @EntityGraph(attributePaths = {"user"})
    List<TaskWatcher> findByTask_IdOrderByCreatedAtAsc(UUID taskId);
}
