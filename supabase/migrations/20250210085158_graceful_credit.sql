/*
  # Project Allocation System
  
  1. Changes
    - Drop existing triggers and functions
    - Create optimized project allocation function
    - Add performance index
    - Set up proper error handling
  
  2. Security
    - Maintain data integrity with proper error handling
*/

-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS project_allocation_trigger ON projects;
DROP FUNCTION IF EXISTS update_project_allocations();
DROP FUNCTION IF EXISTS calculate_total_active_weeks();

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  total_active_weeks NUMERIC,
  calculated_allocation_percentage NUMERIC,
  auto_allocate_overhead BOOLEAN DEFAULT true,
  manual_allocation_percentage NUMERIC,
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create optimized function to update project allocations
CREATE OR REPLACE FUNCTION update_project_allocations() 
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
  v_error_message text;
BEGIN
  -- Single UPDATE statement using window functions for efficiency
  WITH active_weeks AS (
    SELECT 
      id,
      CEIL(
        EXTRACT(EPOCH FROM (end_date::timestamp - GREATEST(start_date::timestamp, CURRENT_TIMESTAMP))) / (60 * 60 * 24 * 7)
      ) as project_weeks,
      SUM(
        CEIL(
          EXTRACT(EPOCH FROM (end_date::timestamp - GREATEST(start_date::timestamp, CURRENT_TIMESTAMP))) / (60 * 60 * 24 * 7)
        )
      ) OVER () as total_weeks
    FROM projects
    WHERE status = 'active'
    AND end_date >= start_date
  )
  UPDATE projects p
  SET 
    total_active_weeks = aw.total_weeks,
    calculated_allocation_percentage = 
      CASE 
        WHEN p.auto_allocate_overhead THEN
          CASE 
            WHEN aw.total_weeks > 0 THEN 
              (aw.project_weeks / aw.total_weeks * 100)
            ELSE 0
          END
        ELSE p.manual_allocation_percentage
      END
  FROM active_weeks aw
  WHERE p.id = aw.id
  AND p.status = 'active'
  AND p.end_date >= p.start_date;

  RETURN NULL;

EXCEPTION 
  WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RAISE WARNING 'Error in update_project_allocations: %', v_error_message;
    RETURN NULL;
END
$$;

-- Create trigger to update allocations
CREATE TRIGGER project_allocation_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH STATEMENT
EXECUTE FUNCTION update_project_allocations();

-- Add index for performance (using only immutable operations)
CREATE INDEX IF NOT EXISTS idx_projects_status_dates 
ON projects (status, start_date, end_date)
WHERE status = 'active';