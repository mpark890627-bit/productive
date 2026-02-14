-- Align task template schema with MVP requirements
-- task_templates: unique(owner_user_id, name)
-- task_template_items: default_status/default_priority/default_assignee + sort indexes
-- task_template_item_tags: optional tag mapping table

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'task_template_items'
          AND column_name = 'status'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'task_template_items'
          AND column_name = 'default_status'
    ) THEN
        ALTER TABLE task_template_items RENAME COLUMN status TO default_status;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'task_template_items'
          AND column_name = 'priority'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'task_template_items'
          AND column_name = 'default_priority'
    ) THEN
        ALTER TABLE task_template_items RENAME COLUMN priority TO default_priority;
    END IF;
END $$;

ALTER TABLE task_template_items
    ADD COLUMN IF NOT EXISTS default_assignee VARCHAR(30) NOT NULL DEFAULT 'UNASSIGNED';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_task_templates_owner_user_name'
    ) THEN
        ALTER TABLE task_templates
            ADD CONSTRAINT uq_task_templates_owner_user_name UNIQUE (owner_user_id, name);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_task_template_items_default_status'
    ) THEN
        ALTER TABLE task_template_items
            ADD CONSTRAINT ck_task_template_items_default_status
                CHECK (default_status IN ('TODO', 'IN_PROGRESS', 'DONE'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_task_template_items_default_priority'
    ) THEN
        ALTER TABLE task_template_items
            ADD CONSTRAINT ck_task_template_items_default_priority
                CHECK (default_priority IN ('LOW', 'MEDIUM', 'HIGH'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_task_template_items_default_assignee'
    ) THEN
        ALTER TABLE task_template_items
            ADD CONSTRAINT ck_task_template_items_default_assignee
                CHECK (default_assignee IN ('ME', 'UNASSIGNED'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_task_template_items_template_sort
    ON task_template_items(template_id, sort_order);

CREATE TABLE IF NOT EXISTS task_template_item_tags (
    template_item_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (template_item_id, tag_id),
    CONSTRAINT fk_task_template_item_tags_template_item_id
        FOREIGN KEY (template_item_id) REFERENCES task_template_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_template_item_tags_tag_id
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_template_item_tags_tag_id
    ON task_template_item_tags(tag_id);
