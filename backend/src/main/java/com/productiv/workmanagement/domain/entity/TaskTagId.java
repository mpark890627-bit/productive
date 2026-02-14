package com.productiv.workmanagement.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class TaskTagId implements Serializable {

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(name = "tag_id", nullable = false)
    private UUID tagId;

    public TaskTagId() {
    }

    public TaskTagId(UUID taskId, UUID tagId) {
        this.taskId = taskId;
        this.tagId = tagId;
    }

    public UUID getTaskId() {
        return taskId;
    }

    public UUID getTagId() {
        return tagId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TaskTagId that)) {
            return false;
        }
        return Objects.equals(taskId, that.taskId) && Objects.equals(tagId, that.tagId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(taskId, tagId);
    }
}
