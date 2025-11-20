-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    original_lang TEXT NOT NULL DEFAULT 'en',
    target_lang TEXT NOT NULL DEFAULT 'zh',
    s3_original_url TEXT,
    cover_url TEXT,
    status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'translating', 'generating_audio', 'ready', 'error')),
    total_chapters INTEGER NOT NULL DEFAULT 0,
    total_paragraphs INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Book paragraphs table
CREATE TABLE IF NOT EXISTS book_paragraphs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter INTEGER NOT NULL DEFAULT 1,
    para_idx INTEGER NOT NULL,
    text_original TEXT NOT NULL,
    text_translated TEXT,
    tokens INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(book_id, para_idx)
);

-- Book audio manifest table
CREATE TABLE IF NOT EXISTS book_audio_manifest (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    para_idx INTEGER NOT NULL,
    audio_url TEXT NOT NULL,
    duration REAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(book_id, para_idx)
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    last_para_idx INTEGER NOT NULL DEFAULT 0,
    page INTEGER,
    play_pos_seconds REAL NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    scope TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    meta_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_books_owner ON books(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_paragraphs_book ON book_paragraphs(book_id, para_idx);
CREATE INDEX IF NOT EXISTS idx_audio_book ON book_audio_manifest(book_id, para_idx);
CREATE INDEX IF NOT EXISTS idx_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_summaries_user_book ON summaries(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_paragraphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_audio_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books
CREATE POLICY "Users can view their own books" ON books
    FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert their own books" ON books
    FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own books" ON books
    FOR UPDATE USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own books" ON books
    FOR DELETE USING (auth.uid() = owner_user_id);

-- RLS Policies for book_paragraphs
CREATE POLICY "Users can view paragraphs of their books" ON book_paragraphs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books WHERE books.id = book_paragraphs.book_id AND books.owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert paragraphs for their books" ON book_paragraphs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM books WHERE books.id = book_paragraphs.book_id AND books.owner_user_id = auth.uid()
        )
    );

-- RLS Policies for book_audio_manifest
CREATE POLICY "Users can view audio of their books" ON book_audio_manifest
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books WHERE books.id = book_audio_manifest.book_id AND books.owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert audio for their books" ON book_audio_manifest
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM books WHERE books.id = book_audio_manifest.book_id AND books.owner_user_id = auth.uid()
        )
    );

-- RLS Policies for reading_progress
CREATE POLICY "Users can view their own progress" ON reading_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON reading_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON reading_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for summaries
CREATE POLICY "Users can view their own summaries" ON summaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries" ON summaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
