# AWS CORS Configuration Update Required

## Current Status
✅ S3 Bucket Policy: Configured  
✅ S3 CORS: Partially configured (missing main frontend domains)  
❌ CloudFront Response Headers Policy: Needs verification/configuration

## Required Updates

### 1. Update S3 Bucket CORS Configuration

Your current CORS is missing the main frontend domains. Update it to:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "HEAD"
        ],
        "AllowedOrigins": [
            "https://www.ctomarketplace.com",
            "https://ctomarketplace.com",
            "https://ctomemes.xyz",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173"
        ],
        "ExposeHeaders": [
            "Content-Length",
            "Content-Type",
            "ETag",
            "Last-Modified"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

**Steps:**
1. Go to AWS S3 Console → `ctom-bucket-backup`
2. Click **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit** and paste the updated configuration above
5. Click **Save changes**

### 2. Update S3 Bucket Policy (Add Public Read for Mascots)

Add public read access for `/mascots/*` path. Update your bucket policy to include:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowUploadsFromCTOMUser",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::914654948893:user/ctom-coolify"
            },
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::ctom-bucket-backup/user-uploads/*",
                "arn:aws:s3:::ctom-bucket-backup/memes/*"
            ]
        },
        {
            "Sid": "AllowListBucketForCTOMUser",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::914654948893:user/ctom-coolify"
            },
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": "arn:aws:s3:::ctom-bucket-backup"
        },
        {
            "Sid": "AllowCloudFrontAccess",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ctom-bucket-backup/*",
            "Condition": {
                "ArnLike": {
                    "AWS:SourceArn": "arn:aws:cloudfront::914654948893:distribution/E2HZU2DDXZMH23"
                }
            }
        },
        {
            "Sid": "AllowPublicReadForMemes",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ctom-bucket-backup/memes/*"
        },
        {
            "Sid": "AllowPublicReadForUserUploads",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ctom-bucket-backup/user-uploads/*"
        },
        {
            "Sid": "AllowPublicReadForMascots",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ctom-bucket-backup/mascots/*"
        }
    ]
}
```

**Steps:**
1. Go to AWS S3 Console → `ctom-bucket-backup`
2. Click **Permissions** tab
3. Scroll to **Bucket policy**
4. Click **Edit** and add the new statement for `/mascots/*`
5. Click **Save changes**

### 3. Configure CloudFront Response Headers Policy (CRITICAL)

CloudFront needs to forward CORS headers to the browser. This is the most important step!

**Option A: Create/Update Response Headers Policy**

1. Go to AWS CloudFront Console
2. Click **Policies** → **Response headers policies**
3. Find or create a policy (e.g., `ctomemes-cors-policy`)
4. Configure **CORS** settings:
   - **Access-Control-Allow-Origin**: Select "Specify origins" and add:
     - `https://www.ctomarketplace.com`
     - `https://ctomarketplace.com`
     - `https://ctomemes.xyz`
     - `http://localhost:3000`
   - **Access-Control-Allow-Methods**: `GET, HEAD`
   - **Access-Control-Allow-Headers**: `*`
   - **Access-Control-Max-Age**: `3000`
   - **Access-Control-Expose-Headers**: `Content-Length, Content-Type, ETag, Last-Modified`
   - **Origin override**: Leave unchecked (use origin header from request)
5. Click **Create policy** or **Save changes**

**Option B: Use Origin Response Headers (Alternative)**

If you prefer to use S3 CORS headers directly:
1. Go to CloudFront distribution `E2HZU2DDXZMH23`
2. Click **Behaviors** tab
3. Select the default behavior (or the one serving mascots)
4. Click **Edit**
5. Scroll to **Cache key and origin requests**
6. Under **Origin request policy**, ensure it forwards `Origin` header
7. Under **Response headers policy**, select "CORS-Customize" or your custom policy

### 4. Attach Response Headers Policy to CloudFront Distribution

1. Go to CloudFront distribution `E2HZU2DDXZMH23`
2. Click **Behaviors** tab
3. Select the default behavior (or the one serving `/mascots/*`)
4. Click **Edit**
5. Scroll to **Response headers policy**
6. Select the CORS policy you created/updated
7. Click **Save changes**

### 5. Invalidate CloudFront Cache

1. Go to CloudFront distribution `E2HZU2DDXZMH23`
2. Click **Invalidations** tab
3. Click **Create invalidation**
4. Enter: `/mascots/*`
5. Click **Create invalidation**

This ensures the new CORS headers are applied immediately.

## Verification

After completing all steps:

1. **Test image URLs directly:**
   - Open: `https://d2cjbd1iqkwr9j.cloudfront.net/mascots/STAGE/STAGE.png`
   - Check browser DevTools → Network tab
   - Verify response headers include:
     - `Access-Control-Allow-Origin: https://www.ctomarketplace.com` (or your origin)
     - `Access-Control-Allow-Methods: GET, HEAD`
     - `Access-Control-Expose-Headers: Content-Length, Content-Type, ETag, Last-Modified`

2. **Test PFP reveal flow:**
   - Go to your frontend
   - Click "Reveal Your Mascot"
   - Check browser console - should NOT see "tainted canvas" errors
   - Mascot should reveal successfully

## Important Notes

- **CloudFront Response Headers Policy is CRITICAL** - Without it, even if S3 has CORS configured, CloudFront won't forward the headers to the browser
- The `crossOrigin='anonymous'` code fix is already applied in the frontend
- CORS headers must match the origin making the request (browser enforces this strictly)
- Cache invalidation may take a few minutes to propagate
