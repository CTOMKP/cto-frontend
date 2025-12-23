# Mascot Images S3 Setup Guide

## Overview

The mascot images are now served from AWS S3 via CloudFront CDN instead of being bundled in the Next.js build. This provides:
- ✅ Faster loading (CDN caching)
- ✅ Better performance (global edge locations)
- ✅ Consistent with project architecture
- ✅ No need to rebuild when updating images

## Step 1: Upload Images to S3

You need to upload the mascot images to your S3 bucket `ctom-bucket-backup` in the following structure:

```
s3://ctom-bucket-backup/
└── mascots/
    ├── STAGE/
    │   └── STAGE.png
    ├── SKIN/
    │   └── BASE SKIN.png
    └── TRAITS/
        ├── ARTIST.png
        ├── ARTIST2.png
        ├── ARTIST3.png
        ├── CTO.png
        ├── CTO2.png
        ├── DEGEN.png
        ├── DEGEN2.png
        ├── DEV.png
        ├── EARLYADT.WHALE.png
        ├── HACKER.png
        ├── HACKER2.png
        ├── HACKER3.png
        ├── HODLER.png
        ├── KOL.png
        ├── MOD.png
        ├── MOD2.png
        ├── MOD3.png
        ├── NEWBIE.png
        ├── SHILLER.png
        ├── VISIONARY.png
        ├── VISIONARY2.png
        ├── WHALE.png
        ├── WHALE2.png
        └── WHALE3.png
```

### Upload Methods

#### Option A: AWS Console (Recommended for one-time setup)
1. Go to AWS S3 Console
2. Navigate to bucket `ctom-bucket-backup`
3. Create folder `mascots/`
4. Upload images maintaining the folder structure:
   - `mascots/STAGE/STAGE.png`
   - `mascots/SKIN/BASE SKIN.png`
   - `mascots/TRAITS/*.png` (all trait images)

#### Option B: AWS CLI
```bash
# Install AWS CLI if not already installed
# Configure credentials: aws configure

# Upload all mascot images
aws s3 sync ./public/mascots/ s3://ctom-bucket-backup/mascots/ --region eu-north-1
```

#### Option C: Using Backend Script (if you have access)
You can create a script similar to the migration scripts in the backend to upload the images programmatically.

## Step 2: Configure CloudFront

Ensure your CloudFront distribution (`d2cjbd1iqkwr9j.cloudfront.net`) is configured to:
1. Serve files from `ctom-bucket-backup` bucket
2. Allow public read access to `mascots/*` paths
3. Set appropriate cache headers

## Step 3: Set Environment Variable

Make sure your frontend has the CloudFront domain configured:

```env
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=d2cjbd1iqkwr9j.cloudfront.net
```

This should already be set in your Coolify deployment environment variables.

## Step 4: Verify

After uploading, test the URLs:
- `https://d2cjbd1iqkwr9j.cloudfront.net/mascots/STAGE/STAGE.png`
- `https://d2cjbd1iqkwr9j.cloudfront.net/mascots/SKIN/BASE SKIN.png`
- `https://d2cjbd1iqkwr9j.cloudfront.net/mascots/TRAITS/CTO.png`

All should return 200 OK with the image content.

## Fallback Behavior

The code includes a fallback mechanism:
- If `NEXT_PUBLIC_CLOUDFRONT_DOMAIN` is not set, it will try to use local paths
- However, in production, images should always come from CloudFront

## Notes

- Images with spaces in filenames (like "BASE SKIN.png") are handled correctly by CloudFront
- The `getMascotImageUrl()` helper function automatically constructs the correct CloudFront URL
- Images are cached by CloudFront, so updates may take a few minutes to propagate
