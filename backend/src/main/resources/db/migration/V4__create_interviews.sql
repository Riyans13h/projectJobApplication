-- Create interviews table
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    round_name VARCHAR(150) NOT NULL,
    interview_date TIMESTAMP NOT NULL,
    mode VARCHAR(50) NOT NULL,
    result VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interviews_application_id FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Create indexes for common interview queries
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_interview_date ON interviews(interview_date);
CREATE INDEX idx_interviews_result ON interviews(result);
