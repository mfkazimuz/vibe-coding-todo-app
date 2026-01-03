/*
  # Add task details to todos table

  1. New Columns
    - `description` (text, nullable) - Optional description/note for the task
    - `deadline` (date, nullable) - Optional deadline date for the task
    - `priority` (text, default 'medium') - Priority level: 'high', 'medium', 'low'
  
  2. Changes
    - Added three new columns to `todos` table to support task details, deadlines, and priority levels
    - Priority defaults to 'medium' for backward compatibility
    - Tasks will be automatically sorted by priority in the application
  
  3. Notes
    - No RLS changes needed - existing policies remain in effect
    - All new columns are optional to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'description'
  ) THEN
    ALTER TABLE todos ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'deadline'
  ) THEN
    ALTER TABLE todos ADD COLUMN deadline date;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'priority'
  ) THEN
    ALTER TABLE todos ADD COLUMN priority text DEFAULT 'medium';
  END IF;
END $$;