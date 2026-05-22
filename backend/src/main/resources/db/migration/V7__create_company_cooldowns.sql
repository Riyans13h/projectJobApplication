-- Create company cooldowns table
CREATE TABLE company_cooldowns (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    role VARCHAR(150),
    last_applied_date DATE NOT NULL,
    cooldown_period INT NOT NULL,
    eligible_reapply_date DATE NOT NULL,
    apply_anyway_note TEXT,
    applied_anyway_at TIMESTAMP,
    source VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for cooldown lookup and dashboard alerts
CREATE INDEX idx_company_cooldowns_user_id ON company_cooldowns(user_id);
CREATE INDEX idx_company_cooldowns_company ON company_cooldowns(company_name);
CREATE INDEX idx_company_cooldowns_eligible_date ON company_cooldowns(eligible_reapply_date);
