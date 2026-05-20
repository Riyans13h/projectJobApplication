-- Create applications table
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    job_id VARCHAR(100),
    location VARCHAR(255),
    work_mode VARCHAR(50),
    employment_type VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    application_date DATE NOT NULL,
    applied_through VARCHAR(255),
    email_used VARCHAR(255),
    phone_used VARCHAR(20),
    notes TEXT,
    cooldown_period INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX idx_user_id ON applications(user_id);
CREATE INDEX idx_status ON applications(status);
CREATE INDEX idx_company_name ON applications(company_name);
CREATE INDEX idx_user_status ON applications(user_id, status);
CREATE INDEX idx_application_date ON applications(application_date);
