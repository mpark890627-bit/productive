package com.productiv.workmanagement.domain.entity;

import com.productiv.workmanagement.domain.entity.enums.RecurringIntervalType;
import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recurring_task_rules")
public class RecurringTaskRule extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User ownerUser;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private TaskPriority priority;

    @Column(name = "due_offset_days")
    private Integer dueOffsetDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "interval_type", nullable = false)
    private RecurringIntervalType intervalType;

    @Column(name = "interval_value", nullable = false)
    private Integer intervalValue;

    @Column(name = "next_run_at", nullable = false)
    private Instant nextRunAt;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "last_generated_at")
    private Instant lastGeneratedAt;

    public UUID getId() {
        return id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getOwnerUser() {
        return ownerUser;
    }

    public void setOwnerUser(User ownerUser) {
        this.ownerUser = ownerUser;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public Integer getDueOffsetDays() {
        return dueOffsetDays;
    }

    public void setDueOffsetDays(Integer dueOffsetDays) {
        this.dueOffsetDays = dueOffsetDays;
    }

    public RecurringIntervalType getIntervalType() {
        return intervalType;
    }

    public void setIntervalType(RecurringIntervalType intervalType) {
        this.intervalType = intervalType;
    }

    public Integer getIntervalValue() {
        return intervalValue;
    }

    public void setIntervalValue(Integer intervalValue) {
        this.intervalValue = intervalValue;
    }

    public Instant getNextRunAt() {
        return nextRunAt;
    }

    public void setNextRunAt(Instant nextRunAt) {
        this.nextRunAt = nextRunAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getLastGeneratedAt() {
        return lastGeneratedAt;
    }

    public void setLastGeneratedAt(Instant lastGeneratedAt) {
        this.lastGeneratedAt = lastGeneratedAt;
    }
}
