-- Create 'audio' storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  true, -- Make bucket public so audio URLs work directly
  52428800, -- 50MB max file size
  ARRAY['audio/mpeg', 'audio/mp3']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload audio files for their own books
-- Files are stored as: {bookId}/{paraIdx}.mp3
-- We verify ownership by checking if the bookId belongs to the user
CREATE POLICY "Users can upload audio for their books" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio' AND
  EXISTS (
    SELECT 1 FROM books
    WHERE books.id::text = (storage.foldername(name))[1]
    AND books.owner_user_id = auth.uid()
  )
);

-- Allow authenticated users to update audio files for their own books
CREATE POLICY "Users can update audio for their books" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio' AND
  EXISTS (
    SELECT 1 FROM books
    WHERE books.id::text = (storage.foldername(name))[1]
    AND books.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'audio' AND
  EXISTS (
    SELECT 1 FROM books
    WHERE books.id::text = (storage.foldername(name))[1]
    AND books.owner_user_id = auth.uid()
  )
);

-- Allow anyone to read public audio files (needed for playback)
CREATE POLICY "Anyone can read audio files" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio');

-- Allow authenticated users to delete audio for their own books
CREATE POLICY "Users can delete audio for their books" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio' AND
  EXISTS (
    SELECT 1 FROM books
    WHERE books.id::text = (storage.foldername(name))[1]
    AND books.owner_user_id = auth.uid()
  )
);
