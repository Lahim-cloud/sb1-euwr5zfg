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
      EXTRACT(EPOCH FROM (end_date::timestamp - GREATEST(start_date::timestamp, CURRENT_TIMESTAMP))) / (60 * 60 * 24 * 7)
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
BEGIN
  -- Calculate total weeks across all active projects
  WITH project_calculations AS (
    SELECT 
      id,
      CEIL(
        EXTRACT(EPOCH FROM (end_date::timestamp - GREATEST(start_date::timestamp, CURRENT_TIMESTAMP))) / (60 * 60 * 24 * 7)
      ) as project_weeks
    FROM projects
    WHERE status = 'active'
    AND end_date > CURRENT_DATE
  ),
  total_weeks AS (
    SELECT COALESCE(SUM(project_weeks), 0) as total
    FROM project_calculations
  )
  UPDATE projects p
  SET 
    total_active_weeks = tw.total,
    calculated_allocation_percentage = 
      CASE 
        WHEN p.auto_allocate_overhead THEN
          CASE 
            WHEN tw.total > 0 THEN (pc.project_weeks / tw.total) * 100
            ELSE 0
          END
        ELSE p.manual_allocation_percentage
      END
  FROM project_calculations pc, total_weeks tw
  WHERE p.id = pc.id
  AND p.status = 'active'
  AND p.end_date > CURRENT_DATE;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update allocations
DROP TRIGGER IF EXISTS project_allocation_trigger ON projects;
CREATE TRIGGER project_allocation_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH STATEMENT
EXECUTE FUNCTION update_project_allocations();