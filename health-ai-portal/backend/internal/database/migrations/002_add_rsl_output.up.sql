-- Add rsl_output column for Research & Strategy Lead role
ALTER TABLE cycles ADD COLUMN IF NOT EXISTS rsl_output TEXT;
