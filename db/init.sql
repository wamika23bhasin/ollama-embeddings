CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS case_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  number TEXT UNIQUE NOT NULL,
  issue_summary TEXT,
  issue_description TEXT,
  release_version TEXT,
  steps_to_reproduce TEXT,
  status TEXT,
  priority TEXT,
  assigned_to TEXT,
  created_by TEXT,
  created_date DATE,
  work_notes_list JSONB NOT NULL DEFAULT '[]'::JSONB,
  embedding VECTOR(1024),
  embedding_model TEXT,
  CHECK (jsonb_typeof(work_notes_list) = 'array')
);