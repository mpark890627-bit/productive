package com.productiv.workmanagement.domain.repository;

import com.productiv.workmanagement.domain.entity.Task;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    @EntityGraph(attributePaths = {"project", "assigneeUser"})
    @Query("""
        SELECT t
        FROM Task t
        WHERE t.project.id = :projectId
          AND t.project.ownerUser.id = :ownerUserId
          AND (:statusFiltering = false OR t.status = :status)
          AND (:assigneeFiltering = false OR t.assigneeUser.id = :assigneeUserId)
          AND (:dueFromFiltering = false OR t.dueDate >= :dueFrom)
          AND (:dueToFiltering = false OR t.dueDate <= :dueTo)
          AND (
            :keywordFiltering = false OR
            LOWER(t.title) LIKE :keywordPattern OR
            LOWER(COALESCE(t.description, '')) LIKE :keywordPattern
          )
    """)
    Page<Task> searchInOwnedProject(
        @Param("projectId") UUID projectId,
        @Param("ownerUserId") UUID ownerUserId,
        @Param("statusFiltering") boolean statusFiltering,
        @Param("status") TaskStatus status,
        @Param("assigneeFiltering") boolean assigneeFiltering,
        @Param("assigneeUserId") UUID assigneeUserId,
        @Param("dueFromFiltering") boolean dueFromFiltering,
        @Param("dueFrom") LocalDate dueFrom,
        @Param("dueToFiltering") boolean dueToFiltering,
        @Param("dueTo") LocalDate dueTo,
        @Param("keywordFiltering") boolean keywordFiltering,
        @Param("keywordPattern") String keywordPattern,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"project", "assigneeUser"})
    Optional<Task> findByIdAndProject_OwnerUser_Id(UUID id, UUID ownerUserId);

    @EntityGraph(attributePaths = {"project", "assigneeUser"})
    @Query("""
        SELECT DISTINCT t
        FROM Task t
        LEFT JOIN TaskWatcher tw ON tw.task.id = t.id
        WHERE t.project.ownerUser.id = :ownerUserId
          AND (t.assigneeUser.id = :currentUserId OR tw.user.id = :currentUserId)
          AND (:status IS NULL OR t.status = :status)
          AND (:dueFrom IS NULL OR t.dueDate >= :dueFrom)
          AND (:dueTo IS NULL OR t.dueDate <= :dueTo)
          AND (
            :keywordPattern IS NULL OR
            LOWER(t.title) LIKE :keywordPattern OR
            LOWER(COALESCE(t.description, '')) LIKE :keywordPattern
          )
    """)
    Page<Task> searchInboxTasks(
        @Param("ownerUserId") UUID ownerUserId,
        @Param("currentUserId") UUID currentUserId,
        @Param("status") TaskStatus status,
        @Param("dueFrom") LocalDate dueFrom,
        @Param("dueTo") LocalDate dueTo,
        @Param("keywordPattern") String keywordPattern,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"project", "assigneeUser"})
    @Query("""
        SELECT DISTINCT t
        FROM Task t
        LEFT JOIN TaskWatcher tw ON tw.task.id = t.id AND tw.user.id = :currentUserId
        WHERE t.project.ownerUser.id = :ownerUserId
          AND (
              :includeAllVisible = true
              OR
              (:includeAssigned = true AND t.assigneeUser.id = :currentUserId)
              OR
              (:includeWatching = true AND tw.user.id = :currentUserId)
          )
          AND (:projectFiltering = false OR t.project.id = :projectId)
          AND (:dueFiltering = false OR (t.dueDate IS NOT NULL AND t.dueDate >= :dueFrom AND t.dueDate <= :dueTo))
          AND t.status IN :statuses
          AND (
            :keywordFiltering = false OR
            LOWER(t.title) LIKE :keywordPattern OR
            LOWER(COALESCE(t.description, '')) LIKE :keywordPattern
          )
    """)
    Page<Task> searchInboxTasksByMode(
        @Param("ownerUserId") UUID ownerUserId,
        @Param("currentUserId") UUID currentUserId,
        @Param("includeAllVisible") boolean includeAllVisible,
        @Param("includeAssigned") boolean includeAssigned,
        @Param("includeWatching") boolean includeWatching,
        @Param("projectFiltering") boolean projectFiltering,
        @Param("projectId") UUID projectId,
        @Param("dueFiltering") boolean dueFiltering,
        @Param("dueFrom") LocalDate dueFrom,
        @Param("dueTo") LocalDate dueTo,
        @Param("statuses") Collection<TaskStatus> statuses,
        @Param("keywordFiltering") boolean keywordFiltering,
        @Param("keywordPattern") String keywordPattern,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"project", "assigneeUser"})
    @Query("""
        SELECT t
        FROM Task t
        WHERE t.dueDate IS NOT NULL
          AND t.status <> com.productiv.workmanagement.domain.entity.enums.TaskStatus.DONE
          AND t.dueDate <= :maxDueDate
    """)
    Page<Task> findDueTasks(@Param("maxDueDate") LocalDate maxDueDate, Pageable pageable);
}
