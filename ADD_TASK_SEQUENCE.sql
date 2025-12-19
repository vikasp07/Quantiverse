-- Step 1: Add sequence column if it doesn't exist
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS sequence INTEGER DEFAULT 1;

-- Step 2: Auto-populate sequence for tasks that don't have it
UPDATE public.tasks t
SET sequence = (
  SELECT ROW_NUMBER() OVER (PARTITION BY simulation_id ORDER BY created_at ASC, id ASC)
  FROM public.tasks t2
  WHERE t2.simulation_id = t.simulation_id
  AND t2.id = t.id
)
WHERE t.sequence IS NULL OR t.sequence = 1;

-- Step 3: Verify the update worked
SELECT simulation_id, id, title, sequence FROM public.tasks ORDER BY simulation_id, sequence;
