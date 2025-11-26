-- AI Audio Reader - Supabase Database Schema
-- PostgreSQL schema for production deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: books
-- ================================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT,
  file_path TEXT,
  file_type VARCHAR(50),
  content_blocks JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_created_at ON books(created_at DESC);

-- ================================================
-- TABLE: users (extends Supabase Auth)
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ================================================
-- TABLE: reading_progress
-- ================================================
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter INTEGER DEFAULT 0,
  current_block INTEGER DEFAULT 0,
  scroll_position INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  percent DECIMAL(5,2) DEFAULT 0.00,
  device_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX idx_progress_updated_at ON reading_progress(updated_at DESC);

-- ================================================
-- TABLE: notes_highlights
-- ================================================
CREATE TABLE IF NOT EXISTS notes_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  block_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('note', 'highlight')),
  color VARCHAR(20),
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_user_book ON notes_highlights(user_id, book_id);
CREATE INDEX idx_notes_block ON notes_highlights(block_index);
CREATE INDEX idx_notes_type ON notes_highlights(type);

-- ================================================
-- TABLE: tts_cache
-- ================================================
CREATE TABLE IF NOT EXISTS tts_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  voice VARCHAR(100) NOT NULL,
  audio_url TEXT NOT NULL,
  audio_data BYTEA,
  duration_seconds DECIMAL(10,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(text, voice)
);

CREATE INDEX idx_tts_text_voice ON tts_cache(text, voice);
CREATE INDEX idx_tts_expires_at ON tts_cache(expires_at);

-- ================================================
-- TABLE: user_summaries
-- ================================================
CREATE TABLE IF NOT EXISTS user_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  level VARCHAR(50),
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_summaries_user_book ON user_summaries(user_id, book_id);
CREATE INDEX idx_summaries_level ON user_summaries(level);

-- ================================================
-- TABLE: flashcard_progress
-- ================================================
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  flashcard_id TEXT NOT NULL,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE,
  last_review TIMESTAMP WITH TIME ZONE,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id, flashcard_id)
);

CREATE INDEX idx_flashcards_user_book ON flashcard_progress(user_id, book_id);
CREATE INDEX idx_flashcards_next_review ON flashcard_progress(next_review);

-- ================================================
-- TABLE: study_plans
-- ================================================
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  total_days INTEGER NOT NULL,
  completed_days INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_plans_user_book ON study_plans(user_id, book_id);
CREATE INDEX idx_plans_dates ON study_plans(start_date, end_date);

-- ================================================
-- TABLE: translations
-- ================================================
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_text TEXT NOT NULL,
  target_lang VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  source_lang VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_text, target_lang)
);

CREATE INDEX idx_translations_lookup ON translations(source_text, target_lang);

-- ================================================
-- FUNCTIONS: Updated timestamps
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes_highlights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON user_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcard_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON study_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- POLICIES: Row Level Security (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Books: Public read, authenticated write
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create books"
  ON books FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users: Users can only see and update their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Reading Progress: Users can only access their own progress
CREATE POLICY "Users can view own progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON reading_progress FOR ALL
  USING (auth.uid() = user_id);

-- Notes: Users can only access their own notes
CREATE POLICY "Users can view own notes"
  ON notes_highlights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes"
  ON notes_highlights FOR ALL
  USING (auth.uid() = user_id);

-- TTS Cache: Public read (cached audio)
CREATE POLICY "TTS cache is viewable by everyone"
  ON tts_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can write TTS cache"
  ON tts_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- User Summaries: Users own data only
CREATE POLICY "Users can view own summaries"
  ON user_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own summaries"
  ON user_summaries FOR ALL
  USING (auth.uid() = user_id);

-- Flashcard Progress: Users own data only
CREATE POLICY "Users can view own flashcards"
  ON flashcard_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own flashcards"
  ON flashcard_progress FOR ALL
  USING (auth.uid() = user_id);

-- Study Plans: Users own data only
CREATE POLICY "Users can view own plans"
  ON study_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own plans"
  ON study_plans FOR ALL
  USING (auth.uid() = user_id);

-- Translations: Public read, authenticated write
CREATE POLICY "Translations are viewable by everyone"
  ON translations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create translations"
  ON translations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ================================================
-- SEED DATA (Optional - for development)
-- ================================================

-- Insert demo book (optional)
-- INSERT INTO books (title, author, content_blocks)
-- VALUES (
--   'Demo Book',
--   'Demo Author',
--   '[{"type": "paragraph", "text": "This is a demo paragraph."}]'::jsonb
-- );

-- ================================================
-- VIEWS: Useful aggregations
-- ================================================

-- View: User reading statistics
CREATE OR REPLACE VIEW user_reading_stats AS
SELECT
  u.id AS user_id,
  u.email,
  u.display_name,
  COUNT(DISTINCT rp.book_id) AS books_in_progress,
  COUNT(DISTINCT nh.book_id) AS books_with_notes,
  AVG(rp.percent) AS avg_completion,
  MAX(rp.updated_at) AS last_read_at
FROM users u
LEFT JOIN reading_progress rp ON u.id = rp.user_id
LEFT JOIN notes_highlights nh ON u.id = nh.user_id
GROUP BY u.id, u.email, u.display_name;

-- View: Book popularity
CREATE OR REPLACE VIEW book_popularity AS
SELECT
  b.id,
  b.title,
  b.author,
  COUNT(DISTINCT rp.user_id) AS reader_count,
  AVG(rp.percent) AS avg_completion,
  MAX(rp.updated_at) AS last_read_at
FROM books b
LEFT JOIN reading_progress rp ON b.id = rp.book_id
GROUP BY b.id, b.title, b.author
ORDER BY reader_count DESC;
