"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BackendWallet, PrivyWalletAccount, PrivyUser } from '@/types/privy';

// Helper interface for wallet with Movement/Aptos support
interface WalletWithMovement extends BackendWallet {
  blockchain?: string;
  walletClient?: string;
}

import UserProfileHeader from './features/UserProfileHeader';
import LevelXPProgress from './features/LevelXPProgress';
import ReferralSection from './features/ReferralSection';
import SocialAccounts from './features/SocialAccounts';
import WalletBalance from './features/WalletBalance';
import PortfolioSection from './features/PortfolioSection';
import TransactionHistory from './features/TransactionHistory';
import WalletsDialog from './features/WalletsDialog';

// COMMENTED CODE FOR REFERENCE - DO NOT REMOVE
// "use client";

// import React, { useState, useEffect } from 'react';
// import { usePrivy } from '@privy-io/react-auth';
// import { usePrivyAuth } from '@/hooks/usePrivyAuth';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import { getMovementWallet } from '@/lib/movement-wallet';
// import axios from 'axios';
// import Image from 'next/image';
// import { BackendWallet, PrivyWalletAccount, PrivyUser } from '@/types/privy';

// // Helper function to get wallet chain info
// function getWalletChainInfo(wallet: BackendWallet | PrivyWalletAccount) {
//   const chainType = 'chainType' in wallet ? wallet.chainType : undefined;
//   const blockchain = 'blockchain' in wallet ? wallet.blockchain : undefined;
//   return { chainType, blockchain };
// }

// export default function ProfilePage() {
//   const router = useRouter();
//   const { user, authenticated, ready } = usePrivy();
//   const { logout } = usePrivyAuth();
//   const [allWallets, setAllWallets] = useState<BackendWallet[]>([]);

//   useEffect(() => {
//     if (ready && !authenticated) {
//       router.push('/');
//     }
//   }, [ready, authenticated, router]);

//   const walletsLoadedRef = React.useRef<string | null>(null);

//   useEffect(() => {
//     if (authenticated && user && ready) {
//       const userId = user.id;
//       // Only load wallets once per user, or if user changed
//       if (walletsLoadedRef.current !== userId) {
//         loadWallets();
//         walletsLoadedRef.current = userId;
//       }
//     }
//   }, [authenticated, user, ready]);

//   const loadWallets = async () => {
//     try {
//       // First, try to load from localStorage
//       const walletsJson = localStorage.getItem('cto_user_wallets');
//       if (walletsJson) {
//         try {
//           const wallets = JSON.parse(walletsJson);
//           setAllWallets(wallets);
//           return;
//         } catch (parseError) {
//           console.error('Failed to parse wallets from localStorage:', parseError);
//         }
//       }

//       // Fallback: Fetch from backend
//       const token = localStorage.getItem('cto_auth_token');
//       const userId = localStorage.getItem('cto_user_id');
      
//       if (!token || !userId) {
//         return;
//       }

//       const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
//       const response = await axios.get(
//         `${backendUrl}/api/auth/privy/wallets`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.data.success && response.data.wallets) {
//         const wallets = response.data.wallets;
//         setAllWallets(wallets);
//         localStorage.setItem('cto_user_wallets', JSON.stringify(wallets));
//       }
//     } catch (error) {
//       console.error('Failed to load wallets:', error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       router.push('/');
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   if (!ready) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
//           <p className="mt-4 text-white">Initializing...</p>
//         </div>
//       </div>
//     );
//   }

//   // Don't block on isLoading - show profile even if wallets are still loading
//   // Wallets will load in the background and update when ready

//   if (!authenticated || !user) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-white">Please login to view your profile</p>
//         </div>
//       </div>
//     );
//   }

//   // Combine Privy wallets with backend wallets
//   // Privy's user.linkedAccounts is LinkedAccountWithMetadata[], so we need to filter and cast
//   const privyWallets = user?.linkedAccounts?.filter(
//     (account) => account.type === 'wallet'
//   ) as PrivyWalletAccount[] || [];
//   const displayWallets = allWallets.length > 0 ? allWallets : privyWallets;
  
//   // Deduplicate wallets by address to prevent duplicate display
//   const uniqueWallets = displayWallets.filter((wallet, index, self) => 
//     index === self.findIndex((w) => w.address.toLowerCase() === wallet.address.toLowerCase())
//   );
  
//   const email = user?.email?.address || user?.wallet?.address || 'Privy User';
//   // Cast user to PrivyUser for getMovementWallet
//   const movementWallet = getMovementWallet(user as PrivyUser);
  
//   // Get avatar URL from localStorage (set by sync or PFP save)
//   const avatarUrl = typeof window !== 'undefined' 
//     ? localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url')
//     : null;

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div className="flex items-center gap-4">
//               {avatarUrl && (
//                 <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
//                   <Image 
//                     src={avatarUrl} 
//                     alt="Profile" 
//                     fill
//                     className="object-cover"
//                     unoptimized
//                   />
//                 </div>
//               )}
//               <div>
//                 <h1 className="text-3xl font-bold text-white">Profile</h1>
//                 <p className="text-gray-400">Welcome back, {email}</p>
//                 <p className="text-sm text-gray-500 mt-1">Privy ID: {user?.id}</p>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Wallets Section */}
//         <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
//           <h2 className="text-2xl font-bold text-white mb-4">💼 Your Wallets</h2>
          
//           {uniqueWallets.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-gray-400 mb-4">No wallets found</p>
//               <p className="text-sm text-gray-500">Wallets should be created automatically on login</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {uniqueWallets.map((wallet: BackendWallet | PrivyWalletAccount, index: number) => {
//                 const { chainType, blockchain } = getWalletChainInfo(wallet);
//                 const chain = (chainType || blockchain || '').toLowerCase();
//                 const chainUpper = (chainType || blockchain || '').toUpperCase();
                
//                 return (
//                 <div key={index} className="border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-2xl">
//                           {(chain === 'ethereum' || chainUpper === 'ETHEREUM') && '⟠'}
//                           {(chain === 'solana' || chainUpper === 'SOLANA') && '◎'}
//                           {(chain === 'base' || chainUpper === 'BASE') && '🔵'}
//                           {(chain === 'polygon' || chainUpper === 'POLYGON') && '🟣'}
//                           {(chain === 'aptos' || chainUpper === 'APTOS' || chainUpper === 'MOVEMENT') && '🅰️'}
//                         </span>
//                         <span className="font-semibold text-white capitalize">
//                           {chainUpper === 'MOVEMENT' 
//                             ? 'Movement Wallet' 
//                             : (chain || 'Unknown') + ' Wallet'}
//                         </span>
//                         {index === 0 && (
//                           <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
//                             Primary
//                           </span>
//                         )}
//                       </div>
//                       <div className="font-mono text-sm text-gray-400 break-all">
//                         {wallet.address}
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => {
//                         navigator.clipboard.writeText(wallet.address);
//                         toast.success('Address copied!');
//                       }}
//                       className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm ml-4"
//                     >
//                       📋 Copy
//                     </button>
//                   </div>
//                 </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Movement Wallet Info - Only show if not already in the list */}
//           {movementWallet && !uniqueWallets.some(w => 
//             w.address.toLowerCase() === movementWallet.address.toLowerCase()
//           ) && (
//             <div className="mt-6 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700 rounded-lg">
//               <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
//                 <span className="text-2xl">🅰️</span>
//                 <span>Movement Wallet</span>
//               </h3>
//               <p className="text-sm text-green-300 mb-2">
//                 ✅ Your Movement wallet is ready!
//               </p>
//               <p className="text-xs text-green-400 font-mono break-all bg-black/50 p-2 rounded">
//                 {movementWallet.address}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Info Section */}
//         <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
//           <h3 className="font-semibold text-blue-300 mb-2">💡 About Your Wallets</h3>
//           <ul className="text-sm text-gray-300 space-y-2">
//             <li>✅ All wallets are managed securely by Privy</li>
//             <li>✅ Embedded wallets work across all devices</li>
//             <li>✅ You can also connect external wallets (MetaMask, Phantom, etc.)</li>
//             <li>✅ Private keys are never stored on our servers</li>
//             <li>✅ Multi-chain support: Ethereum, Solana, Base, Polygon, Movement</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function ProfilePage() {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  // Keep allWallets for potential future use (displaying all wallets)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allWallets, setAllWallets] = useState<BackendWallet[]>([]);
  const [movementWalletAddress, setMovementWalletAddress] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletsDialogOpen, setWalletsDialogOpen] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const walletsLoadedRef = React.useRef<string | null>(null);

  // Check Movement wallet from Privy's linkedAccounts (like test frontend)
  // Define this FIRST so it can be used in loadWallets
  const checkMovementWallet = React.useCallback(() => {
    if (!user?.linkedAccounts) return;

    const movementWalletAccount = user.linkedAccounts.find((account) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const acc = account as any;
      return acc.type === 'wallet' && acc.chainType === 'aptos';
    });

    // Access address property (Privy wallet accounts have address)
    if (movementWalletAccount) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const acc = movementWalletAccount as any;
      if (acc.address) {
        setMovementWalletAddress(acc.address);
      }
    }
  }, [user?.linkedAccounts]);

  const loadWallets = React.useCallback(async () => {
    try {
      // First, try to load from localStorage (faster and more reliable)
      const walletsJson = localStorage.getItem('cto_user_wallets');
      if (walletsJson) {
        try {
          const wallets = JSON.parse(walletsJson);
          
          // Find Movement wallet from localStorage wallets
          const movementWallet = wallets.find((w: WalletWithMovement) => 
            w.blockchain === 'MOVEMENT' ||
            w.blockchain === 'APTOS' ||
            w.chainType === 'aptos' ||
            w.walletClient === 'APTOS_EMBEDDED'
          );
          if (movementWallet?.address) {
            setMovementWalletAddress(movementWallet.address);
          }

          setAllWallets(wallets);
          
          // Still check Privy as fallback
          checkMovementWallet();
          return;
        } catch (parseError) {
          console.error('Failed to parse wallets from localStorage:', parseError);
        }
      }
      
      // Fallback: Fetch from backend if localStorage is empty or invalid
      const token = localStorage.getItem('cto_auth_token');
      const userId = localStorage.getItem('cto_user_id');
      
      if (!token || !userId) {
        // If no token, still check Privy
        checkMovementWallet();
        return;
      }

      console.log('🔄 Fetching wallets from backend...');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await axios.get(
        `${backendUrl}/api/v1/auth/privy/wallets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.wallets) {
        const wallets = response.data.wallets;
        
        // Find Movement wallet from backend wallets  
        const movementWalletFromBackend = wallets.find((w: WalletWithMovement) => 
          w.blockchain === 'MOVEMENT' ||
          w.blockchain === 'APTOS' ||
          w.chainType === 'aptos' ||
          w.walletClient === 'APTOS_EMBEDDED'
        );
        if (movementWalletFromBackend?.address) {
          setMovementWalletAddress(movementWalletFromBackend.address);
        }

        setAllWallets(wallets);
        
        // Check if Movement wallet exists (Movement wallets are detected as 'aptos' chainType or 'MOVEMENT' blockchain)
        interface WalletWithMovement {
          blockchain?: string;
          chainType?: string;
          walletClient?: string;
          address?: string;
        }
        
        const movementWallet = wallets.find((w: WalletWithMovement) => 
          w.blockchain === 'MOVEMENT' || 
          w.blockchain === 'APTOS' || 
          w.chainType === 'aptos' || 
          w.walletClient === 'APTOS_EMBEDDED'
        );
        if (movementWallet?.address) {
          setMovementWalletAddress(movementWallet.address);
        }
        
        // Update localStorage with fresh data
        localStorage.setItem('cto_user_wallets', JSON.stringify(wallets));
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
      // If backend fails, Privy wallets will be used via checkMovementWallet()
      checkMovementWallet();
    }
  }, [checkMovementWallet]);

  useEffect(() => {
    if (authenticated && user && ready) {
      const userId = user.id;
      if (walletsLoadedRef.current !== userId) {
        checkMovementWallet();
        loadWallets();
        walletsLoadedRef.current = userId;
      }
    }
  }, [authenticated, user, ready, checkMovementWallet, loadWallets]);

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     router.push('/');
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //   }
  // };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success('Address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  // Use movementWalletAddress state (set from backend wallets or Privy linkedAccounts)
  // This matches the test frontend pattern
  const email = user?.email?.address || user?.wallet?.address || 'Privy User';
  
  const avatarUrl = typeof window !== 'undefined' 
    ? localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url')
    : null;

  // Combine Privy wallets with backend wallets
  // Privy's user.linkedAccounts is LinkedAccountWithMetadata[], so we need to filter and cast
  const privyWallets = user?.linkedAccounts?.filter(
    (account) => account.type === 'wallet'
  ) as PrivyWalletAccount[] || [];
  const displayWallets = allWallets.length > 0 ? allWallets : privyWallets;
  
  // Deduplicate wallets by address to prevent duplicate display
  const uniqueWallets = displayWallets.filter((wallet, index, self) => 
    index === self.findIndex((w) => w.address.toLowerCase() === wallet.address.toLowerCase())
  );

  // Sort wallets to put Movement/Aptos wallet first
  const sortedWallets = [...uniqueWallets].sort((a, b) => {
    const isMovementWallet = (wallet: BackendWallet | PrivyWalletAccount) => {
      const chainType = 'chainType' in wallet ? wallet.chainType : undefined;
      const blockchain = 'blockchain' in wallet ? wallet.blockchain : undefined;
      const chainUpper = ((chainType || blockchain || '').toUpperCase());
      return chainUpper === 'MOVEMENT' || chainUpper === 'APTOS' || chainType === 'aptos';
    };
    
    const isMovementA = isMovementWallet(a);
    const isMovementB = isMovementWallet(b);
    
    // Movement/Aptos wallets come first
    if (isMovementA && !isMovementB) return -1;
    if (!isMovementA && isMovementB) return 1;
    return 0; // Keep original order for non-Movement wallets
  });

  // Primary wallet address for display (Movement wallet only)
  // Prioritize movementWalletAddress state (from backend or Privy check)
  const primaryWalletAddress = movementWalletAddress || '';

  // Calculate wallet stats
  // const cosmosWallets = uniqueWallets.filter(w => {
  //   const { chainType, blockchain } = getWalletChainInfo(w);
  //   const chain = (chainType || blockchain || '').toLowerCase();
  //   return chain === 'cosmos' || chain === 'osmosis' || chain === 'juno';
  // }).length;

  // const evmWallets = uniqueWallets.filter(w => {
  //   const { chainType, blockchain } = getWalletChainInfo(w);
  //   const chain = (chainType || blockchain || '').toLowerCase();
  //   return chain === 'ethereum' || chain === 'base' || chain === 'polygon' || chain === 'arbitrum' || chain === 'optimism';
  // }).length;

  // Achievement task data for donut chart
  const achievementData = [
    { name: 'Memecoins', value: 65, color: '#16C784' },
    { name: 'Stablecoins', value: 25, color: '#6B7280' },
    { name: 'Others', value: 10, color: '#EF4444' },
  ];

  const level = 4;
  const currentXP = 45;
  const nextLevelXP = 150;
  const xpProgress = (currentXP / nextLevelXP) * 100;

  return (
    <div className="pt-[50px]">
      <div className="2xl:mx-25 lg:mx-12 mx-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Left Container - User Profile, Level/XP, Achievement Task, Wallet Stats */}
          <div className="border-none w-full">
            <UserProfileHeader
              avatarUrl={avatarUrl}
              email={email}
              primaryWalletAddress={primaryWalletAddress}
              copiedAddress={copiedAddress}
              onCopyAddress={copyAddress}
              walletsDialogOpen={walletsDialogOpen}
              onWalletsDialogOpenChange={setWalletsDialogOpen}
              walletsDialogContent={
                <WalletsDialog
                  uniqueWallets={sortedWallets}
                  user={user as PrivyUser}
                  primaryWalletAddress={movementWalletAddress}
                />
              }
            />

            <LevelXPProgress
              level={level}
              currentXP={currentXP}
              nextLevelXP={nextLevelXP}
              xpProgress={xpProgress}
            />

            <div className="flex gap-4">
              <ReferralSection />
              <SocialAccounts />
            </div>
          </div>

          {/* Right Column - My Assets */}
          <div className='h-full flex flex-col'>
            <WalletBalance />

            <PortfolioSection achievementData={achievementData} />
          </div>
        </div>

        <TransactionHistory />
      </div>
    </div>
  );
}
