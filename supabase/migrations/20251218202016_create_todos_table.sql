/*
  # Create todos table

  1. New Tables
    - `todos`
      - `id` (uuid, primary key) - Unique identifier for each todo
      - `task` (text) - The task description
      - `completed` (boolean) - Whether the task is completed or not
      - `created_at` (timestamptz) - Timestamp when the todo was created
  
  2. Security
    - Enable RLS on `todos` table
    - Add policy for anyone to read todos
    - Add policy for anyone to insert todos
    - Add policy for anyone to update todos
    - Add policy for anyone to delete todos
    
  Note: This is a simple demo without authentication. All users can access all todos.
*/

CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view todos"
  ON todos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert todos"
  ON todos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update todos"
  ON todos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete todos"
  ON todos FOR DELETE
  USING (true);