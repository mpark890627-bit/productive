-- Expand saved_views for user-specific presets (filters + sorting)
-- filter_json example:
-- {"status":["TODO"],"assignee":"ME","due":{"from":"2026-02-01","to":"2026-02-28"},"keyword":"api"}
-- sort_json example:
-- {"field":"dueDate","direction":"asc"}

ALTER TABLE saved_views
    ADD COLUMN IF NOT EXISTS target_type VARCHAR(30) NOT NULL DEFAULT 'TASKS',
    ADD COLUMN IF NOT EXISTS sort_json JSONB NOT NULL DEFAULT '{"field":"dueDate","direction":"asc"}'::jsonb;

-- Backfill/normalize target type for existing rows
UPDATE saved_views
SET target_type = 'TASKS'
WHERE target_type IS NULL OR target_type <> 'TASKS';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_saved_views_target_type'
    ) THEN
        ALTER TABLE saved_views
            ADD CONSTRAINT ck_saved_views_target_type CHECK (target_type = 'TASKS');
    END IF;
END $$;
