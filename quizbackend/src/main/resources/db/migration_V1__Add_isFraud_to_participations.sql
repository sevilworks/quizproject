-- Migration: Add isFraud column to participations table
-- Description: Adds fraud detection functionality to participation records
-- Date: 2025-12-01
-- Author: Auto-generated migration

-- Add isFraud column to participations table
ALTER TABLE participations 
ADD COLUMN is_fraud BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for performance on fraud queries
CREATE INDEX idx_participations_is_fraud ON participations(is_fraud);

-- Comment to document the column purpose
ALTER TABLE participations 
MODIFY COLUMN is_fraud BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Indicates if this participation is marked as fraudulent due to security violations';