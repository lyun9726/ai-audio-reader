# AI Audio Reader - Deployment Guide

Complete deployment guide for production environment.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Supabase Setup](#supabase-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Production Architecture                 │
└─────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │────────>│   Backend    │────────>│   Database   │
│   (Vercel)   │         │   (Vercel)   │         │  (Supabase)  │
│              │         │              │         │              │
│ - Next.js    │         │ - API Routes │         │ - PostgreSQL │
│ - React      │         │ - Edge Fns   │         │ - Storage    │
│ - Tailwind   │         │ - Serverless │         │ - Auth       │
└──────────────┘         └──────────────┘         └──────────────┘
```

**Stack:**
- **Frontend/Backend:** Vercel (Next.js 14+)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth (optional) + Custom Session System
- **CDN:** Vercel Edge Network

---

## ✅ Prerequisites

### Required Accounts
1. **GitHub Account** - For code repository
2. **Vercel Account** - For frontend/backend deployment
3. **Supabase Account** - For database and storage

### Local Tools
```bash
# Node.js 18+
node --version  # Should be >= 18.0.0

# npm or yarn
npm --version

# Git
git --version

# Supabase CLI (optional)
npx supabase --version
```

---

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name:** ai-audio-reader
   - **Database Password:** (save this!)
   - **Region:** Choose closest to your users
4. Click "Create new project"

### Step 2: Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Verify tables created: `books`, `users`, `reading_progress`, etc.

### Step 3: Get Connection Details

In Supabase project settings:

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public key**
   - **service_role key** (keep secret!)

3. Go to **Settings** > **Database**
4. Copy **Connection String** (Postgres):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### Step 4: Enable Storage (Optional)

1. Go to **Storage** in Supabase dashboard
2. Click "Create bucket"
3. Bucket name: `book-files`
4. Public bucket: `No` (private)
5. Click "Create bucket"

---

## 🚀 Vercel Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR-USERNAME/ai-audio-reader.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Framework Preset:** Next.js
5. **Root Directory:** `./`
6. Click "Deploy" (will fail first time - need env vars)

### Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

#### Required Variables

```env
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (for direct connections)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Session Secret
SESSION_SECRET=your_random_32_char_secret_here
```

#### Optional Variables (for AI features)

```env
# OpenAI API (for real AI features)
OPENAI_API_KEY=sk-...

# Or Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# TTS Services
ELEVENLABS_API_KEY=your_key_here
```

### Step 4: Redeploy

1. After adding environment variables
2. Go to **Deployments** tab
3. Click "..." on latest deployment
4. Click "Redeploy"
5. Wait for deployment to complete

### Step 5: Verify Deployment

1. Visit your deployment URL (e.g., `https://ai-audio-reader.vercel.app`)
2. Test basic functionality:
   - Homepage loads
   - Can navigate to reader
   - API routes respond (check `/api/auth/login` GET request)

---

## 🔐 Environment Variables Reference

### Frontend (NEXT_PUBLIC_*)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes | `eyJ...` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | Yes | `https://your-app.vercel.app` |

### Backend (Server-side)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection | Yes | `postgresql://...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes | `eyJ...` |
| `SESSION_SECRET` | Session encryption key | Yes | `random-32-char-string` |
| `OPENAI_API_KEY` | OpenAI API key | No | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | No | `sk-ant-...` |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS key | No | `...` |

---

## 📝 Post-Deployment Checklist

### 1. Test Authentication

```bash
# Register new user
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","displayName":"Test User"}'

# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'
```

### 2. Test AI Features

```bash
# Test translation
curl -X POST https://your-app.vercel.app/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","targetLang":"zh"}'

# Test summary generation
curl -X POST https://your-app.vercel.app/api/ai/deepsummary \
  -H "Content-Type: application/json" \
  -d '{"bookId":"demo","blocks":[{"type":"paragraph","text":"Test"}],"level":"short"}'
```

### 3. Monitor Logs

1. Go to Vercel dashboard
2. Click on your project
3. Go to **Logs** tab
4. Monitor for errors
5. Check function execution times

### 4. Set Up Custom Domain (Optional)

1. In Vercel project settings
2. Go to **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

---

## 🐛 Troubleshooting

### Database Connection Errors

**Problem:** `Error: connect ECONNREFUSED`

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active
3. Ensure IP is not blocked in Supabase settings
4. Try using pooler connection string for serverless

### Build Failures

**Problem:** Build fails on Vercel

**Solution:**
1. Check build logs for specific errors
2. Ensure all dependencies in `package.json`
3. Verify TypeScript types are correct
4. Try building locally: `npm run build`

### API Routes 404

**Problem:** API routes return 404

**Solution:**
1. Verify route files are in `app/api/` directory
2. Check `vercel.json` configuration
3. Ensure files export GET/POST functions
4. Clear Vercel cache and redeploy

### Session/Auth Issues

**Problem:** Users can't login/register

**Solution:**
1. Verify `SESSION_SECRET` is set
2. Check database tables exist
3. Verify RLS policies in Supabase
4. Test with demo credentials first

### Slow Response Times

**Problem:** API responses are slow

**Solution:**
1. Enable caching for static responses
2. Use Vercel Edge Functions where possible
3. Optimize database queries
4. Add indexes to frequently queried columns
5. Consider upgrading Vercel plan

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Enable in project settings
2. Go to **Analytics** tab
3. Monitor:
   - Page views
   - Response times
   - Error rates

### Supabase Monitoring

1. Go to Supabase dashboard
2. Check **Database** > **Logs**
3. Monitor:
   - Query performance
   - Connection count
   - Storage usage

### Custom Monitoring

Add logging to API routes:

```typescript
export async function POST(request: NextRequest) {
  console.log('[API] Request received:', {
    path: request.url,
    method: request.method,
    timestamp: new Date().toISOString(),
  })

  // ... your code ...
}
```

---

## 🔄 CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run build
      - run: npm test

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID}}
```

---

## 🎯 Performance Optimization

### 1. Enable Edge Functions

Update `vercel.json`:

```json
{
  "functions": {
    "app/api/translate/route.ts": {
      "runtime": "edge"
    },
    "app/api/ai/*/route.ts": {
      "runtime": "edge"
    }
  }
}
```

### 2. Add Response Caching

```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

### 3. Database Connection Pooling

Use Supabase Pooler for serverless:

```env
DATABASE_URL=postgresql://postgres.xxx:6543/postgres?pgbouncer=true
```

---

## 📞 Support

- **Documentation:** Check `/docs` folder
- **Issues:** GitHub Issues
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Supabase Support:** [supabase.com/support](https://supabase.com/support)

---

**Last Updated:** 2025-11-26
**Version:** 1.0.0
