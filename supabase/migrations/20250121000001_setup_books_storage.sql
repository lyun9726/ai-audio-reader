-- Create books storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- RLS Policies for books bucket
DROP POLICY IF EXISTS "Users can upload books" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read books" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their books" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their books" ON storage.objects;

-- Allow authenticated users to upload books
CREATE POLICY "Users can upload books"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'books' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to read books (public bucket)
CREATE POLICY "Anyone can read books"
ON storage.objects FOR SELECT
USING (bucket_id = 'books');

-- Allow users to update their own books
CREATE POLICY "Users can update their books"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'books' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own books
CREATE POLICY "Users can delete their books"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'books' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
