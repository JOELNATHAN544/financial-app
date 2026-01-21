-- Add reset_password_code_attempts column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_code_attempts INTEGER DEFAULT 0;
