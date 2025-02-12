/*
  # Enhance project cost allocation

  1. Changes
    - Add columns for tracking active project allocation
    - Add function to calculate overhead allocation
    - Add trigger to update allocations when projects change

  2. Security
    - Maintain existing RLS policies
*/

-- Add columns for tracking allocation details
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS total_active_weeks NUMERIC,
ADD COLUMN IF NOT EXISTS calculated_allocation_percentage NUMERIC;

-- Function to calculate total active weeks across all projects
CREATE OR REPLACE FUNCTION calculate_total_active_weeks()
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    CEIL(
      EXTRACT(EPOCH FROM (end_date - GREATEST(start_date, CURRENT_DATE))) / (60 * 60 * 24 * 7)
    )
  ), 0)
  INTO total
  FROM projects
  WHERE status = 'active'
  AND end_date > CURRENT_DATE;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to update project allocations
CREATE OR REPLACE FUNCTION update_project_allocations()
RETURNS TRIGGER AS $$
DECLARE
  total_weeks NUMERIC;
  project_weeks NUMERIC;
BEGIN
  -- Calculate total weeks across all active projects
  total_weeks := calculate_total_active_weeks();
  
  -- Update allocations for all active projects
  FOR project_weeks IN 
    SELECT CEIL(
      EXTRACT(EPOCH FROM (end_date - GREATEST(start_date, CURRENT_DATE))) / (60 * 60 * 24 * 7)
    )
    FROM projects
    WHERE status = 'active'
    AND end_date > CURRENT_DATE
  LOOP
    UPDATE projects
    SET 
      total_active_weeks = total_weeks,
      calculated_allocation_percentage = 
        CASE 
          WHEN auto_allocate_overhead THEN
            CASE 
              WHEN total_weeks > 0 THEN (project_weeks / total_weeks) * 100
              ELSE 0
            END
          ELSE manual_allocation_percentage
        END
    WHERE status = 'active'
    AND end_date > CURRENT_DATE;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update allocations
CREATE OR REPLACE TRIGGER project_allocation_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH STATEMENT
EXECUTE FUNCTION update_project_allocations();