# Circle Authentication Implementation

This document describes the Circle authentication system that has been implemented in the CTO frontend, replacing the previous Aptos authentication.

## Overview

The Circle authentication system provides:
- User registration and login
- Google OAuth integration
- Circle Programmable Wallet integration
- Aptos blockchain support
- PIN-based wallet security

## Files Added/Modified

### New Files Created:
- `src/core/circle-types.ts` - TypeScript interfaces for Circle authentication
- `src/core/circle-constants.ts` - Configuration constants for Circle API
- `src/services/circle-auth.ts` - Authentication service for user management
- `src/services/circle-wallet.ts` - Wallet service for Circle Programmable Wallets
- `src/hooks/useCircleAuth.ts` - React hook for authentication state management
- `src/hooks/useCircleWallet.ts` - React hook for wallet operations
- `src/components/GoogleOAuthProvider.tsx` - Google OAuth provider wrapper
- `server.js` - Backend server for Circle API integration
- `server-package.json` - Server dependencies
- `env.example` - Environment variables template

### Modified Files:
- `src/components/LoginButton.tsx` - Commented out Aptos authentication, integrated Circle auth
- `src/components/CircleChallengeForm.tsx` - Updated to show Circle authentication form with Google OAuth
- `src/app/layout.tsx` - Added Google OAuth provider
- `package.json` - Added axios and @react-oauth/google dependencies

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Server Dependencies

```bash
# Copy the server package.json
cp server-package.json package-server.json

# Install server dependencies
npm install --prefix . --package-lock-only=false express cors axios uuid dotenv nodemon
```

### 3. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Circle API Configuration (using your exact credentials)
NEXT_PUBLIC_CIRCLE_API_KEY=TEST_API_KEY:da4473a762c09430aa795c2269e993f7:4bb214206ac0fe0f3416f18d973d1ed4
NEXT_PUBLIC_CIRCLE_APP_ID=128be7e5-e077-5ed5-9281-eaa8b45fce4e
NEXT_PUBLIC_CIRCLE_API_BASE=https://api.circle.com/v1/w3s

# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Google OAuth Configuration (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 4. Start the Server

```bash
# Start the Circle Wallet backend server
node server.js
```

The server will run on `http://localhost:3001`

### 5. Start the Frontend

```bash
# In a new terminal
npm run dev
```

The frontend will run on `http://localhost:3000`

## How It Works

## How It Works

1. **User Registration**: Users can create accounts with email and password
2. **User Login**: Existing users can sign in with their credentials
3. **Wallet Creation**: After successful registration, a Circle Programmable Wallet is automatically created
4. **PIN Setup**: Users set up a PIN for wallet security through Circle's Web SDK
5. **Authentication State**: User authentication state is managed via React hooks and localStorage

## Key Features

- **Circle Web SDK Integration**: Uses `@circle-fin/w3s-pw-web-sdk` for wallet operations
- **Aptos Blockchain**: Configured to work with Aptos blockchain
- **PIN Security**: Wallet PIN setup through Circle's secure modal
- **Error Handling**: Comprehensive error handling for API failures
- **TypeScript Support**: Full TypeScript support with proper type definitions

## Usage

The authentication system is integrated into the `LoginButton.tsx` component. When users click the login button, they see the Circle authentication form where they can:

1. Switch between login and signup modes
2. Enter their email and password
3. For new users, confirm their password
4. Submit the form to authenticate

After successful authentication, users will have a Circle Programmable Wallet created and can access the application.

## Backend Requirements

This implementation expects a backend API running on `http://localhost:3001` with the following endpoints:

- `POST /api/circle/users` - Create new user
- `POST /api/circle/users/login` - User login
- `POST /api/circle/users/token` - Get user token for SDK
- `POST /api/circle/wallets` - Create wallet
- `GET /api/circle/users/:userId/wallets` - Get user wallets
- `GET /api/circle/wallets/:walletId/balances` - Get wallet balances

## Dependencies Added

- `axios` - For HTTP requests to the backend API

## Notes

- All Aptos-specific authentication code has been commented out but not removed
- The system is designed to work with Circle's sandbox environment by default
- Wallet creation includes PIN setup through Circle's secure modal system
- Authentication state persists in localStorage for session management
