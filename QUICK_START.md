# Quick Start Guide - Circle Authentication

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create `.env.local` file with your Circle API credentials:

```env
# Circle API Configuration (using your exact credentials)
NEXT_PUBLIC_CIRCLE_API_KEY=TEST_API_KEY:da4473a762c09430aa795c2269e993f7:4bb214206ac0fe0f3416f18d973d1ed4
NEXT_PUBLIC_CIRCLE_APP_ID=128be7e5-e077-5ed5-9281-eaa8b45fce4e
NEXT_PUBLIC_CIRCLE_API_BASE=https://api.circle.com/v1/w3s
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Google OAuth (optional - add your Google Client ID)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Start Everything
```bash
# Option 1: Start both server and frontend together
npm run dev:full

# Option 2: Start separately (in different terminals)
# Terminal 1: Start server
npm run server

# Terminal 2: Start frontend  
npm run dev
```

### 4. Test the Authentication
1. Open `http://localhost:3000`
2. Click the "Login" button
3. Try creating an account or logging in
4. Google OAuth will work if you've configured `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## 🎯 What You'll See

- **Login Form**: Email/password authentication
- **Google OAuth**: "Continue with Google" button (if configured)
- **Circle Wallet**: Automatic wallet creation after signup
- **PIN Setup**: Secure PIN setup through Circle's modal

## 🔧 Troubleshooting

### Server not starting?
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill process if needed
kill -9 $(lsof -t -i:3001)
```

### Frontend not connecting to server?
- Make sure server is running on `http://localhost:3001`
- Check that `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001` in `.env.local`

### Circle API errors?
- Verify your Circle API credentials in `.env.local`
- Check the server console for detailed error messages

## 📚 Full Documentation

See `CIRCLE_AUTH_README.md` for complete implementation details.

## 🎉 You're Ready!

The Circle authentication system is now fully integrated and ready to use!








