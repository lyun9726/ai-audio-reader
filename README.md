# AI Audio Reader

Transform PDFs and EPUBs into AI-powered audiobooks with automatic translation.

## ✨ Features

- 📚 **Upload PDF/EPUB** - Support for electronic documents
- 🌍 **AI Translation** - Translate between English, Chinese, Japanese, Spanish, and French
- 🎙️ **Text-to-Speech** - Generate natural-sounding audio with OpenAI TTS
- 📖 **Smart Reader** - Original/Translated/Dual view modes
- 🎵 **Audio Player** - Play, pause, skip, with speed control (0.75x-2.0x)
- 📊 **Reading Progress** - Automatic progress tracking across devices
- 🤖 **AI Summaries** - Generate chapter and daily summaries
- 🔐 **Secure Auth** - Email/password authentication with Supabase

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **AI Services**: OpenAI GPT-4 & TTS
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (https://supabase.com)
- OpenAI API key (https://platform.openai.com/api-keys)

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase - Get from https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up Supabase Database**

- Go to your Supabase project → SQL Editor
- Copy and paste the contents of `supabase/migrations/20250119000000_initial_schema.sql`
- Click "Run" to create all tables and policies

4. **Create Supabase Storage Bucket**

- Go to Storage → Create a new bucket named `audio`
- Make it **Public** (for serving audio files)

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the login page!

## 📖 How to Use

### 1. Create an Account
- Visit http://localhost:3000
- Click "Sign up"
- Enter your email and password

### 2. Upload a Book
- Click "Upload Book" from the dashboard
- Select a PDF or EPUB file
- Fill in the title, author, and select languages
- Click "Upload and Process"

### 3. Translate & Generate Audio
Currently manual triggers (add UI buttons later):

```bash
# Translate the book
curl -X POST http://localhost:3000/api/books/{bookId}/translate \
  -H "Cookie: sb-access-token=..."

# Generate TTS audio
curl -X POST http://localhost:3000/api/books/{bookId}/tts \
  -H "Cookie: sb-access-token=..." \
  -H "Content-Type: application/json" \
  -d '{"voice":"nova","speed":1.0}'
```

### 4. Read & Listen
- Click on your book from the dashboard
- Use the reader controls:
  - Toggle view mode (Original/Translated/Dual)
  - Play/Pause audio
  - Skip paragraphs
  - Adjust playback speed

## 📁 Project Structure

```
ai-audio-reader/
├── app/
│   ├── api/                 # API endpoints
│   │   ├── auth/           # Login, signup, logout
│   │   └── books/          # Book CRUD, translate, TTS, progress
│   ├── dashboard/          # User's book library
│   ├── login/              # Authentication page
│   ├── upload/             # Book upload page
│   ├── reader/[bookId]/    # Reading interface
│   └── layout.tsx          # Root layout with auth
├── lib/
│   ├── supabase/           # Supabase client (server & client)
│   ├── services/           # Business logic
│   │   ├── textExtractor.ts    # PDF/EPUB parsing
│   │   ├── translator.ts       # LLM translation
│   │   ├── tts.ts             # Text-to-speech
│   │   └── summarizer.ts      # AI summarization
│   ├── contexts/           # Auth context
│   └── types/              # TypeScript definitions
├── supabase/
│   └── migrations/         # Database schema
├── middleware.ts          # Auth protection
└── .env.local            # Your secrets (gitignored)
```

## 🌐 Deploy to Vercel

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ai-audio-reader.git
git push -u origin main
```

2. **Deploy on Vercel**

- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repo
- Add Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_APP_URL` (your-app.vercel.app)
- Click "Deploy"

3. **Update Supabase Settings**

In Supabase Dashboard → Authentication → URL Configuration:
- Add your Vercel URL to "Redirect URLs"

## 💰 Cost Estimation

Per book (~50k words / 300k characters):

| Service | Cost |
|---------|------|
| Translation (GPT-4o-mini) | $0.50 - $1.00 |
| TTS (OpenAI) | ~$0.30 |
| Storage & Bandwidth | ~$0.20 |
| **Total per book** | **~$1.00 - $1.50** |

## 🔧 API Reference

### Books
- `GET /api/books` - List user's books
- `POST /api/books/upload` - Upload PDF/EPUB
- `GET /api/books/{bookId}` - Get book details
- `GET /api/books/{bookId}/paragraphs` - Get paragraphs
- `GET /api/books/{bookId}/audio` - Get audio manifest

### Processing
- `POST /api/books/{bookId}/translate` - Translate book
- `POST /api/books/{bookId}/tts` - Generate audio

### Reading
- `GET /api/books/{bookId}/progress` - Get progress
- `POST /api/books/{bookId}/progress` - Save progress
- `POST /api/books/{bookId}/summary` - Generate AI summary

## 🐛 Troubleshooting

**PDF upload fails**
- Ensure PDF contains actual text (not scanned images)
- Check file size < 50MB

**Translation is slow**
- Normal for large books (batched to avoid rate limits)
- Takes ~1-2 minutes for a typical book

**Audio doesn't play**
- Verify Supabase Storage bucket is public
- Check browser console for CORS errors

**Supabase errors**
- Ensure migration SQL has been run
- Check environment variables are correct

## 🚧 Future Enhancements

- [ ] Background job queue for async processing
- [ ] OCR support for scanned PDFs
- [ ] Auto-trigger translation & TTS after upload
- [ ] Mind map visualization
- [ ] Offline audio download
- [ ] Subscription/billing with Stripe
- [ ] Mobile app

## 📄 License

MIT

---

Built with ❤️ using Next.js, Supabase, and OpenAI
