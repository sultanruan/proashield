ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

UPDATE conversations SET status = 'passed' WHERE verdict = 'pass' AND status = 'pending';
UPDATE conversations SET status = 'failed' WHERE verdict = 'fail' AND status = 'pending';
