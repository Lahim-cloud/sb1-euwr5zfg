/*
  # Enhance project cost allocation

  1. Changes
    - Add columns for automatic overhead allocation
    - Add constraints to ensure valid allocation percentages
*/

-- Add columns for automatic overhead allocation
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS auto_allocate_overhead BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS manual_allocation_percentage NUMERIC;

-- Add constraint to ensure valid allocation percentages
ALTER TABLE public.projects
ADD CONSTRAINT valid_allocation_percentage 
CHECK (
  (auto_allocate_overhead = true AND manual_allocation_percentage IS NULL) OR
  (auto_allocate_overhead = false AND manual_allocation_percentage >= 0 AND manual_allocation_percentage <= 100)
);