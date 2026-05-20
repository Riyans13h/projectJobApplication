-- Create timeline table
CREATE TABLE timeline (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    event VARCHAR(150) NOT NULL,
    notes TEXT,
    event_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timeline_application_id FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Create indexes for common timeline queries
CREATE INDEX idx_timeline_application_id ON timeline(application_id);
CREATE INDEX idx_timeline_event_date ON timeline(event_date);
CREATE INDEX idx_timeline_application_event_date ON timeline(application_id, event_date DESC);
