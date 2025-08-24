-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK(difficulty BETWEEN 1 AND 5),
  stem TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array of 4 strings
  correct_index INTEGER NOT NULL CHECK(correct_index BETWEEN 0 AND 3),
  explanation TEXT
);

-- Session table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active','completed')),
  current_difficulty INTEGER NOT NULL CHECK(current_difficulty BETWEEN 1 AND 5),
  item_index INTEGER NOT NULL,
  blueprint TEXT NOT NULL -- JSON array of 100 categories
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_category_difficulty ON questions(category, difficulty);
