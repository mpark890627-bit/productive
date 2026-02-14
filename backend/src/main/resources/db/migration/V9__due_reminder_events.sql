CREATE TABLE due_reminder_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reminder_type VARCHAR(30) NOT NULL,
    reminder_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_due_reminder_events_task_id FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_due_reminder_events_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_due_reminder_events UNIQUE (task_id, user_id, reminder_type, reminder_date)
);

CREATE INDEX idx_due_reminder_events_user_id ON due_reminder_events(user_id);
