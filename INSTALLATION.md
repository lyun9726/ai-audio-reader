# Installation Guide - AI Audio Reader Updates

## Quick Start

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Install NPM Dependencies
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @anthropic-ai/sdk p-queue jszip fast-xml-parser uuid
npm install --save-dev @types/uuid
```

### 3. Install System Dependencies

#### macOS
```bash
# Calibre (for MOBI/AZW formats)
brew install --cask calibre

# unrar (for CBR comics)
brew install unrar
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y calibre unrar
```

#### Windows
- Download Calibre from https://calibre-ebook.com/download
- Download UnRAR from https://www.rarlab.com/rar_add.htm

### 4. Configure Environment Variables

Add to `.env.local`:

```bash
# AWS S3 for File Upload (Task 3)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name

# Upload Configuration
MAX_UPLOAD_SIZE=5368709120  # 5GB in bytes
UPLOAD_API_KEY=your-secret-api-key-for-upload

# Translation Engine (Task 4)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Alternative LLM providers
# OPENAI_API_KEY=sk-...
# TRANSLATE_API_URL=http://localhost:3001/translate

# Translation Configuration
TRANSLATE_BATCH_SIZE=32
TRANSLATE_CONCURRENCY=3
TRANSLATE_RETRIES=3
TRANSLATE_CACHE_ENABLED=true

# Existing variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
```

### 5. Verify Installation

```bash
# Check Calibre
ebook-convert --version

# Check unrar
unrar

# Check Node dependencies
npm list @aws-sdk/client-s3 @anthropic-ai/sdk
```

### 6. Run Build
```bash
npm run build
```

### 7. Deploy to Vercel

#### Option A: Auto-deploy (Recommended)
```bash
git add .
git commit -m "feat: Add extended format support, chunked upload, and translation engine"
git push origin main
```
Vercel will automatically deploy.

#### Option B: Manual deploy
```bash
vercel --prod
```

## AWS S3 Setup

### Create S3 Bucket
```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

### Configure CORS
Create `cors.json`:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Apply CORS:
```bash
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
```

### Create IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

### Set Lifecycle Policy (Optional but Recommended)
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket your-bucket-name \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "DeleteIncompleteUploads",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 7
      }
    }]
  }'
```

## Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
S3_BUCKET
MAX_UPLOAD_SIZE
UPLOAD_API_KEY
ANTHROPIC_API_KEY
TRANSLATE_BATCH_SIZE
TRANSLATE_CONCURRENCY
TRANSLATE_RETRIES
```

## Testing

### Test Upload System
```bash
# Run local dev server
npm run dev

# In another terminal, test upload
curl -X POST http://localhost:3000/api/upload/init \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "filename": "test.pdf",
    "filesize": 1048576,
    "contentType": "application/pdf",
    "mode": "direct"
  }'
```

### Test Translation
```bash
# Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run demo
npx ts-node tests/translate-demo.ts
```

## Troubleshooting

### "ebook-convert not found"
```bash
# macOS: Add to PATH
export PATH="/Applications/calibre.app/Contents/MacOS:$PATH"

# Linux: Install calibre
sudo apt-get install calibre
```

### "AWS credentials not configured"
- Verify `.env.local` contains AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Restart Next.js dev server after adding env vars

### "ANTHROPIC_API_KEY not configured"
- Get API key from https://console.anthropic.com/
- Add to `.env.local`
- Restart server

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Optional: Switch to Cloudflare R2

R2 is S3-compatible and often cheaper:

```bash
# .env.local
AWS_ACCESS_KEY_ID=your_r2_access_key_id
AWS_SECRET_ACCESS_KEY=your_r2_secret_access_key
AWS_REGION=auto
S3_BUCKET=your-r2-bucket
AWS_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

Update `src/lib/storage/s3Client.ts`:
```typescript
this.client = new S3Client({
  region: config.region,
  credentials: config.credentials,
  endpoint: process.env.AWS_ENDPOINT, // Add this line
});
```

## Performance Tuning

### Upload Configuration
```bash
# For fast connections (100+ Mbps)
TRANSLATE_CONCURRENCY=8
UPLOAD_PART_SIZE=20971520  # 20MB

# For slow connections (<10 Mbps)
TRANSLATE_CONCURRENCY=2
UPLOAD_PART_SIZE=5242880   # 5MB
```

### Translation Configuration
```bash
# For high-volume processing
TRANSLATE_BATCH_SIZE=64
TRANSLATE_CONCURRENCY=8

# For rate-limited API tiers
TRANSLATE_BATCH_SIZE=16
TRANSLATE_CONCURRENCY=2
```

## Monitoring

### Check Upload Status
```bash
curl http://localhost:3000/api/upload/status?uploadId=your-upload-id \
  -H "x-api-key: your-api-key"
```

### Monitor S3 Usage
```bash
aws s3 ls s3://your-bucket-name/uploads/ --recursive --human-readable --summarize
```

### Check Translation Cache
```typescript
import { getCacheStats } from '@/core/translate/translateBatch';
console.log(getCacheStats());
```

## Next Steps

1. Upload a test book through the web interface
2. Verify file appears in S3 bucket
3. Test translation on a few paragraphs
4. Monitor Vercel logs for any errors
5. Set up monitoring alerts for production

## Support

- GitHub Issues: https://github.com/your-repo/issues
- Documentation: See README_TASK_*.md files
- Email: your-support-email@example.com
