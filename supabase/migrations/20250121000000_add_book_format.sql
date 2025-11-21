-- Add format column to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS format TEXT CHECK (format IN ('pdf', 'epub', 'txt'));

-- Add file_url column to store original file URL
ALTER TABLE books
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Update existing books to have pdf format (default)
UPDATE books SET format = 'pdf' WHERE format IS NULL;

-- Add metadata columns for better book information
ALTER TABLE books
ADD COLUMN IF NOT EXISTS page_count INTEGER,
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS isbn TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_books_format ON books(format);

-- Add page and location tracking to book_paragraphs for PDF/EPUB
ALTER TABLE book_paragraphs
ADD COLUMN IF NOT EXISTS page INTEGER,
ADD COLUMN IF NOT EXISTS bbox JSONB,  -- For PDF bounding boxes
ADD COLUMN IF NOT EXISTS chapter_title TEXT,
ADD COLUMN IF NOT EXISTS href TEXT;  -- For EPUB chapter hrefs

-- Update reading_progress to store location (CFI for EPUB)
ALTER TABLE reading_progress
ADD COLUMN IF NOT EXISTS location TEXT;  -- EPUB CFI or PDF page info

-- Add comment to explain columns
COMMENT ON COLUMN books.format IS 'File format: pdf, epub, or txt';
COMMENT ON COLUMN books.file_url IS 'URL to original uploaded file';
COMMENT ON COLUMN book_paragraphs.bbox IS 'PDF bounding box: {x, y, width, height}';
COMMENT ON COLUMN book_paragraphs.href IS 'EPUB chapter href for navigation';
COMMENT ON COLUMN reading_progress.location IS 'EPUB CFI or PDF location string';
