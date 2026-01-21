-- Comprehensive migration to ensure all password reset columns exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_code VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_code_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_resend_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reset_password_resend_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_code_attempts INTEGER DEFAULT 0;
