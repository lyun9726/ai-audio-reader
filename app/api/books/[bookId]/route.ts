import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const supabase = await createClient()
    const { bookId } = await params

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('owner_user_id', user.id)
      .single()

    if (error || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const supabase = await createClient()
    const { bookId } = await params

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify book ownership
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('owner_user_id', user.id)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    console.log('[Delete Book] Deleting book:', bookId, book.title)

    // Delete storage files if they exist
    if (book.file_url || book.s3_original_url) {
      try {
        const supabaseAdmin = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Extract file path from URL
        const fileUrl = book.file_url || book.s3_original_url
        const urlParts = fileUrl.split('/books/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          console.log('[Delete Book] Deleting storage file:', filePath)

          const { error: storageError } = await supabaseAdmin.storage
            .from('books')
            .remove([filePath])

          if (storageError) {
            console.error('[Delete Book] Storage deletion error:', storageError)
            // Continue anyway - database cleanup is more important
          } else {
            console.log('[Delete Book] ✓ Storage file deleted')
          }
        }

        // Delete audio files if any
        if (book.s3_audio_url) {
          const audioUrlParts = book.s3_audio_url.split('/audio/')
          if (audioUrlParts.length > 1) {
            const audioPath = audioUrlParts[1]
            console.log('[Delete Book] Deleting audio files for book:', audioPath)

            // List and delete all audio files for this book
            const { data: audioFiles } = await supabaseAdmin.storage
              .from('audio')
              .list(audioPath.split('/')[0])

            if (audioFiles && audioFiles.length > 0) {
              const paths = audioFiles.map(f => `${audioPath.split('/')[0]}/${f.name}`)
              await supabaseAdmin.storage.from('audio').remove(paths)
              console.log('[Delete Book] ✓ Deleted', audioFiles.length, 'audio files')
            }
          }
        }
      } catch (storageError) {
        console.error('[Delete Book] Storage cleanup error:', storageError)
        // Continue anyway
      }
    }

    // Delete paragraphs (cascade should handle this, but be explicit)
    const { error: parasError } = await supabase
      .from('book_paragraphs')
      .delete()
      .eq('book_id', bookId)

    if (parasError) {
      console.error('[Delete Book] Paragraph deletion error:', parasError)
      // Continue anyway
    } else {
      console.log('[Delete Book] ✓ Paragraphs deleted')
    }

    // Delete progress records
    const { error: progressError } = await supabase
      .from('reading_progress')
      .delete()
      .eq('book_id', bookId)

    if (progressError) {
      console.error('[Delete Book] Progress deletion error:', progressError)
      // Continue anyway
    } else {
      console.log('[Delete Book] ✓ Progress records deleted')
    }

    // Finally, delete the book record
    const { error: deleteError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('owner_user_id', user.id)

    if (deleteError) {
      console.error('[Delete Book] Book deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete book' },
        { status: 500 }
      )
    }

    console.log('[Delete Book] ✓ Book deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully'
    })
  } catch (error: any) {
    console.error('[Delete Book] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}
