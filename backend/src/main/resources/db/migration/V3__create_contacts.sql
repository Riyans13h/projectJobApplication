-- Create contacts table
CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    company VARCHAR(150),
    role VARCHAR(150),
    level VARCHAR(100),
    linkedin_url VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(30),
    contact_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_CONTACTED',
    help_score VARCHAR(50),
    source VARCHAR(150),
    notes TEXT,
    last_contact_date DATE,
    next_followup_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contacts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for common contact CRM queries
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_help_score ON contacts(help_score);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_user_status ON contacts(user_id, status);
CREATE INDEX idx_contacts_next_followup_date ON contacts(next_followup_date);
