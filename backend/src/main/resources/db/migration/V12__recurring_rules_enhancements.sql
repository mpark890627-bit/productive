-- Expand recurring_task_rules for richer recurrence policy
-- Keep legacy columns for backward compatibility with existing code paths.

ALTER TABLE recurring_task_rules
    ADD COLUMN IF NOT EXISTS created_by_user_id UUID,
    ADD COLUMN IF NOT EXISTS default_status VARCHAR(30),
    ADD COLUMN IF NOT EXISTS assignee_user_id UUID,
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Seoul',
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE,
    ADD COLUMN IF NOT EXISTS frequency VARCHAR(30),
    ADD COLUMN IF NOT EXISTS "interval" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS by_week_days TEXT[],
    ADD COLUMN IF NOT EXISTS by_month_day INTEGER,
    ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMPTZ;

-- Backfill for existing rows
UPDATE recurring_task_rules
SET created_by_user_id = owner_user_id
WHERE created_by_user_id IS NULL;

UPDATE recurring_task_rules
SET default_status = status
WHERE default_status IS NULL;

UPDATE recurring_task_rules
SET frequency = interval_type
WHERE frequency IS NULL;

UPDATE recurring_task_rules
SET "interval" = GREATEST(1, COALESCE(interval_value, 1))
WHERE "interval" IS NULL OR "interval" < 1;

UPDATE recurring_task_rules
SET start_date = COALESCE(start_date, DATE(created_at))
WHERE start_date IS NULL;

UPDATE recurring_task_rules
SET last_run_at = last_generated_at
WHERE last_run_at IS NULL AND last_generated_at IS NOT NULL;

-- FK constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_recurring_task_rules_created_by_user_id'
    ) THEN
        ALTER TABLE recurring_task_rules
            ADD CONSTRAINT fk_recurring_task_rules_created_by_user_id
                FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_recurring_task_rules_assignee_user_id'
    ) THEN
        ALTER TABLE recurring_task_rules
            ADD CONSTRAINT fk_recurring_task_rules_assignee_user_id
                FOREIGN KEY (assignee_user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Required checks for new recurrence model
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_recurring_task_rules_frequency'
    ) THEN
        ALTER TABLE recurring_task_rules
            ADD CONSTRAINT ck_recurring_task_rules_frequency
                CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_recurring_task_rules_default_status'
    ) THEN
        ALTER TABLE recurring_task_rules
            ADD CONSTRAINT ck_recurring_task_rules_default_status
                CHECK (default_status IN ('TODO', 'IN_PROGRESS', 'DONE'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_recurring_task_rules_priority'
    ) THEN
        ALTER TABLE recurring_task_rules
            ADD CONSTRAINT ck_recurring_task_rules_priority
                CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_recurring_task_rules_interval_positive'
    ) THEN
        ALTER TABLE recurring_task_rules
            ADD CONSTRAINT ck_recurring_task_rules_interval_positive
                CHECK ("interval" >= 1);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_recurring_task_rules_by_month_day'
    ) THEN
        ALTER TABLE recurring_task_rules
            ADD CONSTRAINT ck_recurring_task_rules_by_month_day
                CHECK (by_month_day IS NULL OR (by_month_day >= 1 AND by_month_day <= 31));
    END IF;
END $$;

-- Make key new columns not null after backfill
ALTER TABLE recurring_task_rules
    ALTER COLUMN created_by_user_id SET NOT NULL,
    ALTER COLUMN default_status SET NOT NULL,
    ALTER COLUMN start_date SET NOT NULL,
    ALTER COLUMN frequency SET NOT NULL;

-- Keep required index coverage
CREATE INDEX IF NOT EXISTS idx_recurring_task_rules_project_id
    ON recurring_task_rules(project_id);

CREATE INDEX IF NOT EXISTS idx_recurring_task_rules_next_run_at
    ON recurring_task_rules(next_run_at);

CREATE TABLE IF NOT EXISTS recurring_task_rule_tags (
    rule_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (rule_id, tag_id),
    CONSTRAINT fk_recurring_task_rule_tags_rule_id
        FOREIGN KEY (rule_id) REFERENCES recurring_task_rules(id) ON DELETE CASCADE,
    CONSTRAINT fk_recurring_task_rule_tags_tag_id
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recurring_task_rule_tags_tag_id
    ON recurring_task_rule_tags(tag_id);
