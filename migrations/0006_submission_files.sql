-- Uploaded files (job application CVs). Stored in parts to stay under D1's 2 MB row limit.
CREATE TABLE submission_files (
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  part INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (submission_id, part)
);
