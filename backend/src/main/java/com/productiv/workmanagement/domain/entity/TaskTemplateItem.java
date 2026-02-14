package com.productiv.workmanagement.domain.entity;

import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.domain.entity.enums.TemplateDefaultAssignee;
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
import java.util.UUID;

@Entity
@Table(name = "task_template_items")
public class TaskTemplateItem extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private TaskTemplate template;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_status", nullable = false)
    private TaskStatus defaultStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_priority", nullable = false)
    private TaskPriority defaultPriority;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_assignee", nullable = false)
    private TemplateDefaultAssignee defaultAssignee;

    @Column(name = "due_offset_days")
    private Integer dueOffsetDays;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    public UUID getId() {
        return id;
    }

    public TaskTemplate getTemplate() {
        return template;
    }

    public void setTemplate(TaskTemplate template) {
        this.template = template;
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

    public TaskStatus getDefaultStatus() {
        return defaultStatus;
    }

    public void setDefaultStatus(TaskStatus defaultStatus) {
        this.defaultStatus = defaultStatus;
    }

    public TaskPriority getDefaultPriority() {
        return defaultPriority;
    }

    public void setDefaultPriority(TaskPriority defaultPriority) {
        this.defaultPriority = defaultPriority;
    }

    public TemplateDefaultAssignee getDefaultAssignee() {
        return defaultAssignee;
    }

    public void setDefaultAssignee(TemplateDefaultAssignee defaultAssignee) {
        this.defaultAssignee = defaultAssignee;
    }

    public Integer getDueOffsetDays() {
        return dueOffsetDays;
    }

    public void setDueOffsetDays(Integer dueOffsetDays) {
        this.dueOffsetDays = dueOffsetDays;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
