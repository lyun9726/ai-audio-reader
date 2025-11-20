-- Add missing RLS policies for UPDATE operations

-- Allow users to update paragraphs of their own books
CREATE POLICY "Users can update paragraphs of their books" ON book_paragraphs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM books WHERE books.id = book_paragraphs.book_id AND books.owner_user_id = auth.uid()
        )
    );

-- Allow users to update audio manifest of their books
CREATE POLICY "Users can update audio of their books" ON book_audio_manifest
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM books WHERE books.id = book_audio_manifest.book_id AND books.owner_user_id = auth.uid()
        )
    );

-- Allow users to delete paragraphs of their books (for cleanup)
CREATE POLICY "Users can delete paragraphs of their books" ON book_paragraphs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM books WHERE books.id = book_paragraphs.book_id AND books.owner_user_id = auth.uid()
        )
    );

-- Allow users to delete audio of their books (for regeneration)
CREATE POLICY "Users can delete audio of their books" ON book_audio_manifest
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM books WHERE books.id = book_audio_manifest.book_id AND books.owner_user_id = auth.uid()
        )
    );
