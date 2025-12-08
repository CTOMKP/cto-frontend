# 🚨 Deployment Timeout Fix - Coolify

## Current Status
✅ **Build completed successfully!** (611 seconds)
❌ **Deployment timed out during Docker image export**

The build is working, but Coolify's deployment timeout is too short for the Docker image export phase.

---

## Solution: Increase Deployment Timeout in Coolify

### Step 1: Access Server Settings
1. Go to your Coolify dashboard
2. Click on **Servers** in the sidebar
3. Click on your server (e.g., **Contabo VPS**)
4. Go to the **Advanced** tab

### Step 2: Increase Deployment Timeout
Find the **"Deployment timeout (seconds)"** field (currently set to `3600`)

**Change it to:**
- **Recommended:** `7200` (2 hours = 120 minutes)
- **Minimum if 7200 not available:** `5400` (90 minutes)

**Why 7200 seconds?**
- Build phase: ~40 minutes ✅
- Docker export: ~20-30 minutes
- Total needed: ~60-70 minutes
- Buffer: 2 hours recommended for safety

**Steps:**
1. Change `3600` to `7200` in the "Deployment timeout (seconds)" field
2. Click **Save** at the bottom
3. Wait for the settings to save

### Step 3: Check Proxy Timeout (If Still Failing)
If increasing deployment timeout doesn't help, you may also need to increase the proxy timeout:

**Via Terminal (SSH into your VPS):**
```bash
coolify proxy:set-read-timeout 300
```
This sets the proxy read timeout to 300 seconds (5 minutes). You can increase it further if needed.

**Or via Coolify UI:**
- Go to **Servers** → **Your Server** → **Proxy** tab
- Look for timeout settings (if available in your Coolify version)

---

## Alternative: Optimize Docker Image Size

If increasing timeout doesn't work, we can optimize the Docker image:

### Option A: Multi-stage Build (Advanced)
Create a `Dockerfile` to reduce final image size:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
```

**Note:** This requires changing Coolify to use Dockerfile instead of Nixpacks.

### Option B: Reduce node_modules Size
The `.dockerignore` file should already exclude `node_modules` from the build context, but the final image still includes them.

---

## Quick Fix (Do This Now!)

1. **In Coolify Dashboard:**
   - Go to **Servers** → **Contabo VPS** → **Advanced** tab
   - Find **"Deployment timeout (seconds)"** field
   - Change `3600` to `7200` (2 hours)
   - Click **Save** at the bottom

2. **Redeploy:**
   - Go back to your app: **CTOMarketplace Files** → **Deployment** tab
   - Click **"Redeploy"** button
   - Monitor the logs - it should now complete successfully!

---

## Expected Timeline After Fix

Based on your actual logs:
- **Build phase:** ~40 minutes ✅ (completed successfully)
- **Docker export:** ~20-30 minutes (was timing out)
- **Total needed:** ~60-70 minutes
- **Current timeout:** 3600 seconds (60 minutes) ❌ Too short!
- **New timeout:** 7200 seconds (120 minutes) ✅ Should complete successfully

---

## If Still Timing Out

If it still times out after increasing the timeout:

1. **Check VPS resources:**
   - CPU usage during export
   - Disk I/O speed
   - Available disk space

2. **Contact Coolify support** or check their documentation for:
   - Maximum timeout limits
   - Docker export optimization options
   - Alternative deployment methods

---

## Summary

✅ **Build is working perfectly!** - Node.js 20 and nixpacks.toml are correct
❌ **Deployment timeout too short** - Currently 3600 seconds (1 hour), but deployment needs ~70 minutes
🎯 **Action:** 
1. Go to **Servers** → **Contabo VPS** → **Advanced** tab
2. Change **"Deployment timeout (seconds)"** from `3600` to `7200`
3. Click **Save**
4. Redeploy your app

**Note:** If it still times out after increasing to 7200, you may also need to increase the proxy timeout via terminal: `coolify proxy:set-read-timeout 300`

