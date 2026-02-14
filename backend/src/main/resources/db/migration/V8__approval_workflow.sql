CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    task_id UUID,
    requester_user_id UUID NOT NULL,
    approver_user_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    reason TEXT,
    decision_comment TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_approval_requests_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_requests_task_id FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    CONSTRAINT fk_approval_requests_requester_user_id FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_requests_approver_user_id FOREIGN KEY (approver_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_approval_requests_approver_user_id ON approval_requests(approver_user_id);
CREATE INDEX idx_approval_requests_requester_user_id ON approval_requests(requester_user_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
