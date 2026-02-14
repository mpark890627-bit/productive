CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    probability_score INTEGER,
    impact_score INTEGER,
    due_date DATE,
    owner_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_risks_project_id
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_risks_owner_user_id
        FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_risks_status CHECK (status IN ('OPEN', 'MITIGATING', 'CLOSED')),
    CONSTRAINT ck_risks_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT ck_risks_probability_score CHECK (probability_score IS NULL OR (probability_score >= 1 AND probability_score <= 5)),
    CONSTRAINT ck_risks_impact_score CHECK (impact_score IS NULL OR (impact_score >= 1 AND impact_score <= 5))
);

CREATE INDEX IF NOT EXISTS idx_risks_project_id
    ON risks(project_id);

CREATE INDEX IF NOT EXISTS idx_risks_project_status
    ON risks(project_id, status);

CREATE INDEX IF NOT EXISTS idx_risks_project_severity
    ON risks(project_id, severity);

CREATE INDEX IF NOT EXISTS idx_risks_owner_user_id
    ON risks(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_risks_due_date
    ON risks(due_date);
