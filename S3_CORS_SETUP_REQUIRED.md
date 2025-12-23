# S3/CloudFront CORS Setup Required for PFP Flow

## Problem
The PFP reveal flow is stuck because of CORS "tainted canvas" error:
```
Uncaught SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': 
Tainted canvases may not be exported.
```

This happens when loading images from CloudFront (cross-origin) into a canvas without proper CORS headers.

## Solution: Configure CORS on S3 and CloudFront

### Step 1: Update S3 Bucket CORS Policy

1. Go to AWS S3 Console → `ctom-bucket-backup`
2. Click **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit** and update the configuration to include the main frontend domain:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "https://www.ctomarketplace.com",
            "https://ctomarketplace.com",
            "https://ctomemes.xyz",
            "http://localhost:3000"
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

5. Click **Save changes**

### Step 2: Update CloudFront Response Headers Policy

1. Go to AWS CloudFront Console
2. Find your distribution: `E2HZU2DDXZMH23` (d2cjbd1iqkwr9j.cloudfront.net)
3. Go to **Policies** → **Response headers policies**
4. Find or create the CORS policy (e.g., `ctomemes-cors-policy`)
5. Update **CORS settings**:
   - **Access-Control-Allow-Origin**: `https://www.ctomarketplace.com, https://ctomarketplace.com, https://ctomemes.xyz, http://localhost:3000`
   - **Access-Control-Allow-Methods**: `GET, HEAD`
   - **Access-Control-Allow-Headers**: `*`
   - **Access-Control-Max-Age**: `3000`
   - **Access-Control-Expose-Headers**: `Content-Length, Content-Type, ETag, Last-Modified`
   - **Origin override**: Leave unchecked (use origin header)
6. Save the policy

### Step 3: Attach Policy to CloudFront Distribution

1. Go back to your CloudFront distribution
2. Click **Behaviors** tab
3. Select the default behavior (or the one serving mascots)
4. Click **Edit**
5. Scroll to **Response headers policy**
6. Select the CORS policy you just updated
7. Click **Save changes**
8. **Invalidate CloudFront cache** (optional but recommended):
   - Go to **Invalidations** tab
   - Create invalidation for: `/mascots/*`
   - This ensures new CORS headers are applied immediately

## Code Fix Applied

The code has been updated to set `crossOrigin = 'anonymous'` on image elements when loading from CloudFront. This is required for CORS to work properly.

## Verification

After configuring CORS:
1. Test the PFP reveal flow
2. Check browser console - should NOT see "tainted canvas" errors
3. Mascot should reveal successfully
4. Composite image should be generated and saved

## Note

If CORS is not configured, the canvas will be "tainted" and `toDataURL()` will fail, causing the reveal to get stuck.
