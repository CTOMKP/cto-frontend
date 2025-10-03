const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: './.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Circle API Configuration - Using the exact credentials you provided
const CIRCLE_API_BASE = process.env.CIRCLE_API_BASE || 'https://api.circle.com/v1/w3s';
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || 'TEST_API_KEY:da4473a762c09430aa795c2269e993f7:4bb214206ac0fe0f3416f18d973d1ed4';
const CIRCLE_APP_ID = process.env.CIRCLE_APP_ID || '128be7e5-e077-5ed5-9281-eaa8b45fce4e';

// File path for storing user credentials
const CREDENTIALS_FILE = path.join(__dirname, 'user_credentials.json');

// In-memory storage for user credentials (will be loaded from file)
let userCredentials = new Map();

// Load user credentials from file on startup
async function loadUserCredentials() {
  try {
    const data = await fs.readFile(CREDENTIALS_FILE, 'utf8');
    const credentials = JSON.parse(data);
    userCredentials = new Map(Object.entries(credentials));
    console.log(`✅ Loaded ${userCredentials.size} user credentials from file`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📁 No credentials file found, starting with empty storage');
      userCredentials = new Map();
    } else {
      console.error('❌ Error loading credentials file:', error.message);
      userCredentials = new Map();
    }
  }
}

// Save user credentials to file
async function saveUserCredentials() {
  try {
    const credentials = Object.fromEntries(userCredentials);
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
    console.log(`💾 Saved ${userCredentials.size} user credentials to file`);
  } catch (error) {
    console.error('❌ Error saving credentials file:', error.message);
  }
}

// Initialize credentials on startup
loadUserCredentials();

// Headers for Circle API
const getCircleHeaders = (userToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CIRCLE_API_KEY}`,
  };
  
  if (userToken) {
    headers['X-User-Token'] = userToken;
  }
  
  return headers;
};

// Utility function for API error handling
const handleCircleApiError = (error, operation) => {
  console.error(`Circle API Error (${operation}):`, {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message
  });
  
  return {
    success: false,
    error: error.response?.data?.message || error.message || 'Unknown error',
    code: error.response?.status || 500
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Circle Wallet Backend'
  });
});

// 1. Create User
app.post('/api/circle/users', async (req, res) => {
  try {
    const { userId, email, password, blockchain = 'APTOS' } = req.body;
    
    console.log('Creating Circle user:', { userId, email, blockchain });
    
    // Store password directly
    userCredentials.set(userId, password);
    
    // Save credentials to file
    await saveUserCredentials();
    
    console.log('🔐 User credentials stored for:', userId);
    
    // Check if user already exists in Circle
    console.log('🔍 Checking if user already exists in Circle...');
    try {
      const existingUserResponse = await axios.get(
        `${CIRCLE_API_BASE}/users/${userId}`,
        { headers: getCircleHeaders() }
      );
      
      if (existingUserResponse.data.data) {
        const existingUser = existingUserResponse.data.data;
        console.log('✅ User already exists in Circle:', existingUser);
        
        res.json({
          success: true,
          message: 'User exists - continuing signup',
          user: {
            id: userId,
            email: email,
            status: 'exists_continue',
            circleUserId: existingUser.id,
            pinStatus: existingUser.pinStatus
          },
          requiresWalletCreation: true
        });
        return;
      }
    } catch (existingUserError) {
      if (existingUserError.response?.status === 404) {
        console.log('✅ User does not exist in Circle - creating new user');
        // User doesn't exist, continue with creation
      } else {
        console.log('⚠️ Error checking existing user, continuing with creation:', existingUserError.response?.data);
        // If we can't check, continue with creation
      }
    }
    
    // Create user in Circle API
    console.log('🔄 Step 1: Creating user...');
    
    const requestBody = { userId };
    console.log('📤 Request body being sent to Circle:', requestBody);
    
    const userResponse = await axios.post(
      `${CIRCLE_API_BASE}/users`,
      requestBody,
      { headers: getCircleHeaders() }
    );
    
    console.log('✅ User created successfully:', userResponse.data);
    
    res.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: userId,
        email: email,
        status: 'created',
        circleUserId: userResponse.data.data.id,
        pinStatus: userResponse.data.data.pinStatus
      },
      requiresWalletCreation: true
    });
    
  } catch (error) {
    console.error('❌ User creation failed:', error.response?.data || error.message);
    
    // Check if this is a "user already exists" error from Circle
    if (error.response?.data?.code === 155101) {
      console.log('🔄 Circle says user exists - checking if we can continue signup');
      
      try {
        // Try to get the existing user to see if we can continue
        const existingUserResponse = await axios.get(
          `${CIRCLE_API_BASE}/users/${userId}`,
          { headers: getCircleHeaders() }
        );
        
        if (existingUserResponse.data.data) {
          const existingUser = existingUserResponse.data.data;
          console.log('✅ Found existing user:', existingUser);
          
          // Allow user to continue signup if they don't have wallets
          console.log('🔄 User exists - allowing to continue signup process');
          
          res.json({
            success: true,
            message: 'User exists - continuing signup',
            user: {
              id: userId,
              email: email,
              status: 'exists_continue',
              circleUserId: existingUser.id,
              pinStatus: existingUser.pinStatus
            },
            requiresWalletCreation: true
          });
          return;
        }
      } catch (checkError) {
        console.log('⚠️ Could not check existing user:', checkError.response?.data);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// 2. Login User
app.post('/api/circle/users/login', async (req, res) => {
  try {
    const { userId, email, password } = req.body;
    
    // Use email as primary identifier if userId is not provided
    const userIdentifier = email || userId;
    
    console.log('User login attempt:', { userId, email, userIdentifier });
    
    if (!userIdentifier) {
      console.log('❌ No user identifier provided');
      return res.status(400).json({ 
        success: false, 
        error: 'Email or userId is required' 
      });
    }
    
    // Check if user exists and verify password
    if (!userCredentials.has(userIdentifier)) {
      console.log('❌ User not found:', userIdentifier);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    const storedPassword = userCredentials.get(userIdentifier);
    const isValidPassword = (password === storedPassword);
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed for user:', userIdentifier);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    console.log('✅ Password verified for user:', userIdentifier);
    
    // Return user info and a simple token
    const user = {
      userId: userIdentifier,
      email: email || userIdentifier
    };
    
    // Generate a simple token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    res.json({
      success: true,
      user: user,
      token: token
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// 3. Get User Token (platform-level auth)
app.post('/api/circle/users/token', async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log('Getting userToken for user:', userId);
    
    const tokenResponse = await axios.post(
      `${CIRCLE_API_BASE}/users/token`,
      { userId },
      { headers: getCircleHeaders() }
    );

    if (!tokenResponse.data.data?.userToken) {
      throw new Error('Failed to get userToken from Circle');
    }

    const userToken = tokenResponse.data.data.userToken;
    const encryptionKey = tokenResponse.data.data.encryptionKey;
    console.log('✅ UserToken acquired:', userToken.substring(0, 20) + '...');

    res.json({
      success: true,
      data: {
        userToken: userToken,
        encryptionKey: encryptionKey,
        userId: userId
      }
    });
  } catch (error) {
    console.error('Failed to get userToken:', error.response?.data);
    res.status(error.response?.status || 500).json(
      handleCircleApiError(error, 'get userToken')
    );
  }
});

// 4. Create Wallet
app.post('/api/circle/wallets', async (req, res) => {
  try {
    const { userId, description, blockchain = 'APTOS' } = req.body;
    
    console.log('Creating wallet for user:', { userId, description, blockchain });

    // Get fresh userToken for wallet creation
    console.log('🔄 Getting fresh userToken for wallet creation...');
    let freshUserToken;
    try {
      const tokenResponse = await axios.post(
        `${CIRCLE_API_BASE}/users/token`,
        { userId },
        { headers: getCircleHeaders() }
      );
      
      if (!tokenResponse.data.data?.userToken) {
        throw new Error('Failed to get fresh userToken from Circle');
      }
      
      freshUserToken = tokenResponse.data.data.userToken;
      console.log('✅ Fresh userToken acquired:', freshUserToken.substring(0, 20) + '...');
    } catch (error) {
      console.error('Failed to get fresh userToken:', error.response?.data);
      return res.status(500).json({
        success: false,
        error: 'Failed to get fresh userToken for wallet creation'
      });
    }
    
    // Create headers with the fresh userToken
    const headersWithUserToken = {
      ...getCircleHeaders(),
      'X-User-Token': freshUserToken
    };
    
    // Convert blockchain to the correct format for Circle API
    let circleBlockchain = blockchain;
    if (blockchain === 'APTOS') {
      circleBlockchain = 'APTOS-TESTNET'; // Use testnet for TEST_API_KEY
    }
    
    // Try to create wallet directly first
    console.log('🔄 Attempting to create wallet...');
    try {
      const response = await axios.post(
        `${CIRCLE_API_BASE}/user/wallets`,
        {
          userId: userId,
          blockchains: [circleBlockchain],
          count: 1,
          walletSetId: `wallet-set-${userId}-${Date.now()}`,
          idempotencyKey: uuidv4()
        },
        { 
          headers: headersWithUserToken,
          timeout: 5000
        }
      );
      
      console.log('✅ Wallet created successfully:', response.data);
      
      // Check if this is a real wallet creation or just a challengeId
      if (response.data.data?.wallets && response.data.data.wallets.length > 0) {
        // Real wallet was created - return wallet details
        const wallet = response.data.data.wallets[0];
        res.json({
          success: true,
          data: {
            id: wallet.id,
            address: wallet.address || '',
            type: 'USER_CONTROLLED',
            blockchain: circleBlockchain,
            description: description || `Wallet for ${userId}`,
            createDate: new Date().toISOString()
          },
          message: 'Wallet created successfully'
        });
      } else if (response.data.data?.challengeId) {
        // PIN setup required - return challenge
        res.json({
          success: true,
          data: {
            challengeId: response.data.data.challengeId,
            requiresPinSetup: true
          },
          message: 'PIN setup required before wallet creation'
        });
      } else {
        // Unknown response format
        res.json({
          success: true,
          data: response.data.data,
          message: 'Wallet creation response received'
        });
      }
    } catch (walletError) {
      console.log('Wallet creation failed, checking if PIN setup is required:', walletError.response?.data);
      
      // If wallet creation fails with "User has not set up a PIN yet", 
      // then we need to initialize the user for PIN setup
      if (walletError.response?.data?.code === 155110) {
        console.log('🔄 PIN setup required, initializing user...');
        try {
          const initResponse = await axios.post(
            `${CIRCLE_API_BASE}/user/initialize`,
            {
              accountType: "EOA",
              blockchains: [circleBlockchain],
              idempotencyKey: uuidv4()
            },
            { 
              headers: headersWithUserToken,
              timeout: 3000
            }
          );
          
          if (initResponse.data.data?.challengeId) {
            console.log('✅ User initialization returned PIN setup challenge');
            // Return the challenge ID for PIN setup
            return res.json({
              success: true,
              message: 'PIN setup required before wallet creation',
              challengeId: initResponse.data.data.challengeId,
              requiresPinSetup: true
            });
          }
        } catch (initError) {
          console.error('Failed to initialize user for PIN setup:', initError.response?.data);
        }
      }
      
      // If we get here, return the original wallet creation error
      res.status(walletError.response?.status || 500).json({
        success: false,
        error: walletError.response?.data?.message || 'Failed to create wallet',
        code: walletError.response?.status || 500,
        details: walletError.response?.data
      });
    }
  } catch (error) {
    console.error('Failed to create wallet:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Circle API returned an error response
      res.status(error.response.status).json({
        success: false,
        error: error.response.data?.message || error.response.data?.error || 'Circle API error',
        code: error.response.status,
        details: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received
      res.status(500).json({
        success: false,
        error: 'No response from Circle API',
        code: 500
      });
    } else {
      // Something else happened
      res.status(500).json({
        success: false,
        error: error.message || 'Unknown error occurred',
        code: 500
      });
    }
  }
});

// 5. Get User's Wallets
app.get('/api/circle/users/:userId/wallets', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Getting wallets for user:', userId);
    
    // Get fresh userToken
    let freshUserToken;
    try {
      const tokenResponse = await axios.post(
        `${CIRCLE_API_BASE}/users/token`,
        { userId },
        { headers: getCircleHeaders() }
      );
      
      if (!tokenResponse.data.data?.userToken) {
        throw new Error('Failed to get userToken');
      }
      
      freshUserToken = tokenResponse.data.data.userToken;
    } catch (error) {
      console.error('Failed to get userToken:', error.response?.data);
      return res.status(500).json({
        success: false,
        error: 'Failed to get userToken'
      });
    }
    
    // Get user's wallets
    const headersWithUserToken = {
      ...getCircleHeaders(),
      'X-User-Token': freshUserToken
    };
    
    try {
      // Try the user-specific endpoint first
      let fullUrl = `${CIRCLE_API_BASE}/users/${userId}/wallets`;
      console.log('🔍 Trying user-specific endpoint:', fullUrl);
      
      let walletsResponse;
      try {
        walletsResponse = await axios.get(fullUrl, { headers: headersWithUserToken });
        console.log('✅ User-specific endpoint succeeded');
      } catch (error) {
        console.log('⚠️ User-specific endpoint failed, trying general wallets endpoint');
        
        // Fallback to general wallets endpoint
        fullUrl = `${CIRCLE_API_BASE}/wallets`;
        console.log('🔍 Trying general wallets endpoint:', fullUrl);
        
        walletsResponse = await axios.get(fullUrl, { headers: headersWithUserToken });
        console.log('✅ General wallets endpoint succeeded');
      }
      
      console.log('Wallets response:', walletsResponse.data);
      
      if (walletsResponse.data.data?.wallets && walletsResponse.data.data.wallets.length > 0) {
        const wallets = walletsResponse.data.data.wallets.map((wallet) => ({
          id: wallet.id,
          address: wallet.address || '',
          type: 'USER_CONTROLLED',
          blockchain: wallet.blockchain || 'APTOS-TESTNET',
          description: wallet.name || `Wallet for ${userId}`,
          createDate: wallet.createDate || new Date().toISOString()
        }));
        
        res.json({
          success: true,
          wallets: wallets,
          message: 'User wallets retrieved successfully'
        });
      } else {
        res.json({
          success: true,
          wallets: [],
          message: 'No wallets found for user'
        });
      }
    } catch (error) {
      console.error('Failed to get user wallets:', error.response?.data);
      res.status(500).json({
        success: false,
        error: 'Failed to get user wallets'
      });
    }
  } catch (error) {
    console.error('Failed to get user wallets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user wallets'
    });
  }
});

// 6. Get Wallet Balances
app.get('/api/circle/wallets/:walletId/balances', async (req, res) => {
  try {
    const { walletId } = req.params;
    const { userId } = req.query; // Get userId from query params
    
    console.log('Getting balances for wallet:', walletId, 'for user:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required to get wallet balances'
      });
    }
    
    // Get fresh userToken for this user
    let freshUserToken;
    try {
      const tokenResponse = await axios.post(
        `${CIRCLE_API_BASE}/users/token`,
        { userId },
        { headers: getCircleHeaders() }
      );
      
      if (!tokenResponse.data.data?.userToken) {
        throw new Error('Failed to get userToken');
      }
      
      freshUserToken = tokenResponse.data.data.userToken;
    } catch (error) {
      console.error('Failed to get userToken for balances:', error.response?.data);
      return res.status(500).json({
        success: false,
        error: 'Failed to get userToken'
      });
    }
    
    // Get wallet balances with userToken
    const headersWithUserToken = {
      ...getCircleHeaders(),
      'X-User-Token': freshUserToken
    };
    
    const response = await axios.get(
      `${CIRCLE_API_BASE}/wallets/${walletId}/balances`,
      { headers: headersWithUserToken }
    );

    console.log('Wallet balances retrieved:', response.data);
    
    // Ensure we return an array even if no balances
    const rawBalances = response.data.data?.tokenBalances || [];
    console.log('Raw token balances from Circle:', rawBalances);
    
    // Transform and calculate USD values for balances
    const balances = rawBalances.map((balance, index) => {
      console.log(`Processing balance ${index}:`, balance);
      
      const tokenSymbol = balance.token?.symbol || 'UNKNOWN';
      const amount = parseFloat(balance.amount) || 0;
      
      console.log(`Token: ${tokenSymbol}, Amount: ${amount}, Raw amount: ${balance.amount}`);
      
      // Calculate USD value based on token type
      let usdValue = 0;
      if (amount > 0) {
        if (tokenSymbol === 'USDC') {
          // 1 USDC ≈ 1 USD (stablecoin)
          usdValue = amount;
        } else if (tokenSymbol === 'APT') {
          // For APT, we'd need real-time price, but for now use a placeholder
          // In production, you'd fetch this from a price API
          usdValue = amount * 10; // Placeholder: 1 APT = $10
        } else {
          // For other tokens, assume 1:1 ratio for now
          usdValue = amount;
        }
      }
      
      const processedBalance = {
        asset: tokenSymbol,
        balance: balance.amount || '0',
        decimals: balance.decimals || 0,
        symbol: tokenSymbol,
        usdValue: usdValue.toFixed(2),
        token: balance.token
      };
      
      console.log(`Processed balance:`, processedBalance);
      return processedBalance;
    });
    
    console.log('Final processed balances with USD values:', balances);
    
    res.json({
      success: true,
      data: balances,
      balances: balances,
    });
  } catch (error) {
    console.error('Failed to get wallet balances:', error.response?.data);
    res.status(error.response?.status || 500).json(
      handleCircleApiError(error, 'get wallet balances')
    );
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Circle Wallet Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Circle API Base: ${CIRCLE_API_BASE}`);
  console.log(`🔑 Circle App ID: ${CIRCLE_APP_ID ? 'Configured' : 'Missing'}`);
  console.log(`🔐 Circle API Key: ${CIRCLE_API_KEY ? 'Configured' : 'Missing'}`);
  
  // Debug: Show first few characters of API key
  if (CIRCLE_API_KEY) {
    console.log(`🔍 API Key Preview: ${CIRCLE_API_KEY.substring(0, 20)}...`);
  }
});








