CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Expand existing risks table to risk register schema
ALTER TABLE risks
    ADD COLUMN IF NOT EXISTS category VARCHAR(120),
    ADD COLUMN IF NOT EXISTS probability SMALLINT,
    ADD COLUMN IF NOT EXISTS impact SMALLINT,
    ADD COLUMN IF NOT EXISTS level_score INTEGER,
    ADD COLUMN IF NOT EXISTS next_review_date DATE,
    ADD COLUMN IF NOT EXISTS mitigation_plan TEXT,
    ADD COLUMN IF NOT EXISTS contingency_plan TEXT,
    ADD COLUMN IF NOT EXISTS triggers TEXT,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Backfill for existing rows from previous schema
UPDATE risks
SET probability = COALESCE(probability, GREATEST(1, LEAST(5, probability_score::SMALLINT)), 3)
WHERE probability IS NULL;

UPDATE risks
SET impact = COALESCE(impact, GREATEST(1, LEAST(5, impact_score::SMALLINT)), 3)
WHERE impact IS NULL;

UPDATE risks
SET level_score = COALESCE(level_score, probability * impact, 9)
WHERE level_score IS NULL;

-- Normalize legacy status values into new risk workflow states
UPDATE risks
SET status = 'IDENTIFIED'
WHERE status = 'OPEN';

-- Strengthen constraints for risk register
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_risks_status') THEN
        ALTER TABLE risks DROP CONSTRAINT ck_risks_status;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_risks_probability_score') THEN
        ALTER TABLE risks DROP CONSTRAINT ck_risks_probability_score;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_risks_impact_score') THEN
        ALTER TABLE risks DROP CONSTRAINT ck_risks_impact_score;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_risks_status_v2') THEN
        ALTER TABLE risks
            ADD CONSTRAINT ck_risks_status_v2
                CHECK (status IN ('IDENTIFIED', 'ASSESSING', 'MITIGATING', 'MONITORING', 'CLOSED'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_risks_probability_v2') THEN
        ALTER TABLE risks
            ADD CONSTRAINT ck_risks_probability_v2
                CHECK (probability BETWEEN 1 AND 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_risks_impact_v2') THEN
        ALTER TABLE risks
            ADD CONSTRAINT ck_risks_impact_v2
                CHECK (impact BETWEEN 1 AND 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_risks_level_score_v2') THEN
        ALTER TABLE risks
            ADD CONSTRAINT ck_risks_level_score_v2
                CHECK (level_score BETWEEN 1 AND 25);
    END IF;
END $$;

ALTER TABLE risks
    ALTER COLUMN probability SET NOT NULL,
    ALTER COLUMN impact SET NOT NULL,
    ALTER COLUMN level_score SET NOT NULL;

-- Required risk indexes
CREATE INDEX IF NOT EXISTS idx_risks_project_level_score
    ON risks(project_id, level_score);

-- Risk response actions
CREATE TABLE IF NOT EXISTS risk_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL,
    due_date DATE,
    assignee_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_risk_actions_risk_id
        FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_actions_assignee_user_id
        FOREIGN KEY (assignee_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_risk_actions_status
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE'))
);

CREATE INDEX IF NOT EXISTS idx_risk_actions_risk_id
    ON risk_actions(risk_id);

CREATE INDEX IF NOT EXISTS idx_risk_actions_assignee_user_id
    ON risk_actions(assignee_user_id);

CREATE INDEX IF NOT EXISTS idx_risk_actions_due_date
    ON risk_actions(due_date);

-- Link risks with existing tasks
CREATE TABLE IF NOT EXISTS risk_task_links (
    risk_id UUID NOT NULL,
    task_id UUID NOT NULL,
    PRIMARY KEY (risk_id, task_id),
    CONSTRAINT fk_risk_task_links_risk_id
        FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_task_links_task_id
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_risk_task_links_task_id
    ON risk_task_links(task_id);

-- Link risks with existing tags
CREATE TABLE IF NOT EXISTS risk_tags (
    risk_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (risk_id, tag_id),
    CONSTRAINT fk_risk_tags_risk_id
        FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_tags_tag_id
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Risk comments separated from task comments
CREATE TABLE IF NOT EXISTS risk_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id UUID NOT NULL,
    author_user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_risk_comments_risk_id
        FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_comments_author_user_id
        FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_risk_comments_risk_id
    ON risk_comments(risk_id);

CREATE INDEX IF NOT EXISTS idx_risk_comments_author_user_id
    ON risk_comments(author_user_id);
