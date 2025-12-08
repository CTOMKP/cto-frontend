Fix Coolify Build Timeout - Instructions for Frontend Dev

## Problem
The frontend build is timing out in Coolify after ~5 minutes because:
1. Coolify uses Node.js 18 by default, but packages need Node.js 20+
2. Build context is too large (includes large image files)
3. Build timeout is set too low

## Solution
Add these 3 files to fix the build timeout issue.



## Files to Add

### 1. `nixpacks.toml` (Required)
**Location:** Root of the project (same level as `package.json`)

**Content:**
toml
[phases.setup]
nixPkgs = [
  'nodejs_20',  # Use Node.js 20 instead of 18
  'npm-9_x',
]

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'


**What it does:** Forces Coolify to use Node.js 20 instead of 18, which is required for `@panoraexchange/widget-sdk` and other packages.


### 2. `.dockerignore` (Recommended)
**Location:** Root of the project

**Content:**
```
node_modules
.next
.git
.env.local
.env*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.pem
dist
build
coverage
.vscode
.idea
*.swp
*.swo
*~

# Large image files (already in git, no need to copy during Docker build)
public/mascots/**/*.png
public/why-img.png
```

**What it does:** Excludes large files from Docker build context, making builds faster.

---

### 3. `.nvmrc` (Optional but Recommended)
**Location:** Root of the project

**Content:**
```
20
```

**What it does:** Specifies Node.js version for local development consistency.

---

## Steps to Apply

1. **Create the files above in the root of the `cto-frontend` repository

2. **Commit and push:
   ```bash
   git add nixpacks.toml .dockerignore .nvmrc
   git commit -m "fix: Add build optimizations to fix Coolify timeout

   - Add nixpacks.toml to force Node.js 20
   - Add .dockerignore to reduce build context
   - Add .nvmrc for Node.js version consistency"
   git push origin main
   

3. **In Coolify Dashboard:
   - Go to **Configuration** → **Environment Variables**
   - Add: `NODE_VERSION=20`
   - Save

4. **Redeploy in Coolify



## Expected Result

-Build should complete successfully in ~3-5 minutes  
-No more timeout errors  
-All packages compatible with Node.js 20  



## Testing Locally

The build works locally (tested and confirmed):
- Build time: ~56 seconds
- No errors
- All pages generated successfully

The optimizations will make Coolify builds work the same way.



## Questions?

If you have any questions or issues, let me know!

