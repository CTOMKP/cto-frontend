"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getMovementWallet } from '@/lib/movement-wallet';
import axios from 'axios';
import Image from 'next/image';
import { BackendWallet, PrivyWalletAccount, PrivyUser } from '@/types/privy';
import { Button } from '@/components/ui/button';
import CustomPieChart from '@/components/CustomPieChart';
import {Eye, EyeOff, Edit, LogOut, Link, Wallet, ChevronDown, ChevronUp, MoveDown, MoveUp, ArrowUpDown, SquareArrowOutUpRight, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FallbackImage from '@/components/FallbackImage';
import { getCloudFrontUrl } from '@/lib/image-url-helper';

// Helper function to get wallet chain info
// function getWalletChainInfo(wallet: BackendWallet | PrivyWalletAccount) {
//   const chainType = 'chainType' in wallet ? wallet.chainType : undefined;
//   const blockchain = 'blockchain' in wallet ? wallet.blockchain : undefined;
//   return { chainType, blockchain };
// }

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
  const { user, authenticated, ready, logout } = usePrivy();
  const [allWallets, setAllWallets] = useState<BackendWallet[]>([]);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url');
    }
    return null;
  });

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const walletsLoadedRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (authenticated && user && ready) {
      const userId = user.id;
      if (walletsLoadedRef.current !== userId) {
        loadWallets();
        walletsLoadedRef.current = userId;
      }
    }
  }, [authenticated, user, ready]);

  // Listen for avatar updates from PFP flow
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for custom event (dispatched by pfpService)
    const handleAvatarUpdate = () => {
      const rawUrl = localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url');
      if (rawUrl) {
        const newAvatarUrl = getCloudFrontUrl(rawUrl);
        if (newAvatarUrl !== avatarUrl) {
        setAvatarUrl(newAvatarUrl);
          // No toast here - toast is shown in CardReveal component
        }
      }
    };

    // Listen for localStorage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'cto_user_avatar_url' || e.key === 'profile_avatar_url') && e.newValue) {
        const cloudfrontUrl = getCloudFrontUrl(e.newValue);
        setAvatarUrl(cloudfrontUrl);
        // Only show toast for cross-tab updates (different session), not same-tab updates
        if (e.newValue !== e.oldValue) {
          toast.success('Profile picture updated');
        }
      }
    };

    // Check localStorage periodically (same-tab updates)
    const checkAvatar = () => {
      const rawUrl = localStorage.getItem('cto_user_avatar_url') || localStorage.getItem('profile_avatar_url');
      if (rawUrl) {
        const cloudfrontUrl = getCloudFrontUrl(rawUrl);
        if (cloudfrontUrl !== avatarUrl) {
          setAvatarUrl(cloudfrontUrl);
        }
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(checkAvatar, 1000);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [avatarUrl]);

  const loadWallets = async () => {
    try {
      const walletsJson = localStorage.getItem('cto_user_wallets');
      if (walletsJson) {
        try {
          const wallets = JSON.parse(walletsJson);
          setAllWallets(wallets);
          return;
        } catch (parseError) {
          console.error('Failed to parse wallets from localStorage:', parseError);
        }
      }

      const token = localStorage.getItem('cto_auth_token');
      const userId = localStorage.getItem('cto_user_id');
      
      if (!token || !userId) {
        return;
      }

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
        setAllWallets(wallets);
        localStorage.setItem('cto_user_wallets', JSON.stringify(wallets));
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  };

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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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

  const privyWallets = user?.linkedAccounts?.filter(
    (account) => account.type === 'wallet'
  ) as PrivyWalletAccount[] || [];
  const displayWallets = allWallets.length > 0 ? allWallets : privyWallets;
  
  const uniqueWallets = displayWallets.filter((wallet, index, self) => 
    index === self.findIndex((w) => w.address.toLowerCase() === wallet.address.toLowerCase())
  );
  
  const email = user?.email?.address || user?.wallet?.address || 'Privy User';
  const movementWallet = getMovementWallet(user as PrivyUser);

  // Get primary wallet address for display
  const primaryWalletAddress = uniqueWallets.length > 0 
    ? uniqueWallets[0].address 
    : movementWallet?.address || '';

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

  // Mock data
  const walletBalance = 2000000;

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
            <div className="flex items-start justify-between mb-4 border-[0.5px] border-white/20 py-5 px-3 rounded-lg bg-[#FFFFFF]/3">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  {avatarUrl ? (
                    <FallbackImage
                      src={avatarUrl}
                      alt="Profile"
                      fill
                      className="object-cover size-15 rounded-full border-[0.6px] border-white"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                      {email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
            <div>
                  <div className="">
                    <h1 className="text-white/70 font-semibold mb-2">
                      Username
                    </h1>
                    <div className="flex items-center gap-1">
                      <h2 className="font-bold text-[32px] ">User234353hgfk</h2>
                      <Edit size={14} />
                    </div>
                    {/* <h2 className="text-2xl font-bold text-white">
                        {email.split('@')[0] || 'User'}
                      </h2> */}
            </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-white/70 font-semibold">
                      Smart wallet{" "}
                      <span className="bg-white/20 rounded-[25px] p-1 font-normal">
                        {primaryWalletAddress.slice(0, 8)}...
                        {primaryWalletAddress.slice(-8)}
                      </span>
                    </p>
            <button
                      onClick={() => copyAddress(primaryWalletAddress)}
                      className="text-white/70 hover:text-white transition-colors bg-white/20 rounded-[25px] p-1"
                    >
                      {copiedAddress ? (
                        <Check size={14} className="text-[#16C784]" />
                      ) : (
                        <Image
                          src="/copy.svg"
                          alt="copy"
                          width={14}
                          height={14}
                        />
                      )}
            </button>
          </div>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end self-stretch">
                <Button className="p-2 w-fit bg-none ronded-lg border-[0.2px] border-white/20" onClick={handleLogout}>
                  <LogOut size={32} />
                </Button>
                <Button className="text-[#9F9FA9] p-2 ronded-lg border-[0.2px] border-white/20">
                  View wallets
                </Button>
              </div>
            </div>

            {/* Level and XP Progress */}
            <div className="mb-4 rounded-lg border-[0.5px] border-white/20 py-[13px] px-3">
              <div className=" mb-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-1">
                    <Image
                      alt="badge"
                      src={"/badge.svg"}
                      width={15}
                      height={15}
                    />
                    <span className="font-bold">
                      Level {level} - Senior Sapling
                    </span>
                  </div>
                  <Button className="text-[#9F9FA9] p-2 ronded-lg border-[0.2px] border-white/20">
                    View more
                  </Button>
                </div>
                {/* <span className="text-sm text-gray-400">
                  {currentXP} / {nextLevelXP} XP
                </span> */}
              </div>

              {/* mission stats */}
              <div className="mb-4">
                <h3 className="text-[10.5px] text-[#E4E4E7] mb-4">
                  Mission Stats
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-[#71717B] text-[9px] leading-[12px] mb-1">
                      Completed Missions
                    </h4>
                    <div className="text-[#71717B] text-[9px] leading-[12px]">
                      <span className="text-white text-[13.5px] leading-5">
                        6
                      </span>{" "}
                      / 7
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#71717B] text-[9px] leading-[12px] mb-1">
                      Total XP
                    </h4>
                    <div className="text-[#71717B] text-[9px] leading-[12px]">
                      <span className="text-white text-[13.5px] leading-5">
                        35
                      </span>{" "}
                      / 135
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#71717B] text-[9px] leading-[12px] mb-1">
                      Total XP
                    </h4>
                    <div className="text-[#71717B] text-[9px] leading-[12px]">
                      <span className="text-white text-[13.5px] leading-5">
                        35
                      </span>{" "}
                      / 135
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[#71717B] text-[9px] leading-[12px] mb-1">
                    Completion Rate
                  </h4>
                  <div className="text-[#71717B] text-[13.5px] leading-5">
                    86%
                  </div>
                </div>
              </div>
              {/* progress */}
              <div className="w-full h-1 bg-[#27272A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] transition-all duration-300"
                  style={{ width: `${xpProgress}%` }}
                />
        </div>
      </div>

            <div className="flex gap-4">
              {/* referral */}
              <div className="rounded-lg border-[0.5px] border-white/20 p-3 w-full">
                <h3 className="text-white/70 mb-4 font-semibold">
                  Invite friends
                </h3>
                <p className="mb-6">
                  Share your code and get 20% Rebates anytime a referred friend
                  completes a trade
                </p>

                <div className="flex items-center justify-between py-3 px-2 rounded-lg border-[0.2px] border-white/20">
                  <p className="text-white/50 ">
                    https://CTOmarketplace.com/referal.98hydv
                  </p>
                  <Button className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] py-2 px-1 rounded-lg">
                    Invite friends
                  </Button>
                </div>
            </div>

              {/* Connect social account */}
              <div className="min-w-[190px] rounded-lg space-y-2.5 border-[0.5px] border-white/20 p-3">
                <h3 className="text-[#FFFFFF]/70 font-semibold mb-4">
                  Social accounts
                </h3>

                <div className="flex items-center justify-between">
                  <span className="size-1 rounded-full bg-[#006FC9]"></span>{" "}
                  <span className="text-sm">Telegram</span>
                  <Button className="p-2 w-fit bg-none rounded-lg border-[0.2px] border-white/20">
                    <LogOut size={30} />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="size-1 rounded-full bg-[#006FC9]"></span>{" "}
                  <span className="text-sm">Telegram</span>
                  <Button className="p-2 w-fit bg-none rounded-lg border-[0.2px] border-white/20">
                    <LogOut size={30} />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="size-1 rounded-full bg-[#C71624]"></span>{" "}
                  <span className="text-sm">Discord</span>
                  <Button className="p-2 w-fit bg-none rounded-lg border-[0.2px] border-white/20">
                    <Link size={14} />
                  </Button>
                </div>
              </div>
            </div>
                      </div>

          {/* Right Column - My Assets */}
          <div className='h-full flex flex-col'>
            <div className="rounded-lg border-[0.5px] border-white/20 p-5">
              {/* Wallet Balance Header */}
              <div className="bg-white/6 rounded-lg py-3 px-2.5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-[#A1A1AA] flex items-center gap-2.5">
                      <Wallet size={18} /> Wallet Balance:
                      </div>
                    </div>
                    <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                <div className="flex w-full justify-center mb-4">
                  <Button className="border-[0.5px] border-[#27272A] rounded-lg py-2 px-1 text-white/50">
                    USDC <ChevronDown size={18} />
                  </Button>
                </div>

                {/* Balance Display */}
                <div className="mb-6">
                  {balanceVisible ? (
                    <div className="flex justify-center gap-2">
                      <span className="text-[58px] font-semibold text-white">
                        ${walletBalance.toLocaleString()}
                      </span>
            </div>
                  ) : (
                    <div className="text-4xl font-bold text-white text-center">
                      ••••••
            </div>
          )}
        </div>

                <div className="flex justify-center items-center">
                  <span
                    className={`flex font-medium items-center text-xs text-[#16C784]`}
                  >
                    <ChevronUp
                      size={16}
                      stroke="false"
                      className="border-none p-0 -mb-0.5"
                      fill="#16C784"
                    />
                    <span className="font-medium">6.00%</span>

                    <span className="text-xs text-[#16C784]">
                      ($1,5960,324)
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Button className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] flex-1 h-12 py-3.5 px-6 rounded-full">
                  {" "}
                  <MoveDown /> Deposit
                </Button>
                <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-full flex-1">
                  <Button className="bg-[#010101] h-12 w-full py-3.5 px-6 rounded-full text-white border-none">
                    {" "}
                    <MoveUp /> Withdraw
                  </Button>
                </div>
                <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-full">
                  <Button className="bg-[#010101] size-12 rounded-full text-white border-none">
                    {" "}
                    <ArrowUpDown />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="flex gap-3 mb-6">
                <Button className="flex-1 cta-gradient text-white">
                  Deposit
                </Button>
                <Button className="flex-1 cta-gradient text-white">
                  Withdraw
                </Button>
                <Button className="flex-1 cta-gradient text-white">
                  Transfer
                </Button>
              </div> */}

              {/* Asset Breakdown */}
              {/* <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400">Assets</h3>
                {assets.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8">
                        <Image
                          src={asset.logo}
                          alt={asset.name}
                          fill
                          className="object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-white font-medium">
                        {asset.name}
                      </span>
                    </div>
                    <span className="text-white font-semibold">
                      ${asset.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div> */}
            </div>

            <div className="rounded-lg border-[0.5px] border-white/20 py-3 px-5 mt-5 flex-1 flex flex-col justify-between">
              <h3 className='font-bold leading-6'>Portfolio</h3>
              <div className="flex items-center justify-start flex-shrink-0 mt-4">
                <CustomPieChart
                  data={achievementData}
                  height={100}
                  innerRadius={15}
                  outerRadius={35}
                  paddingAngle={2}
                />
              </div>
              
              {/* Stats Section */}
              <div className='flex items-center flex-shrink-0 mt-4'>
                <div className="flex-1">
                  <div className="text-xs font-medium mb-2">Volume traded</div>
                  <div className="text-xl font-medium">$124,560,986</div>
                </div>
                <div className="w-px h-12 bg-white/20 mx-4"></div>
                <div className="flex-1">
                  <div className="text-xs font-medium mb-2">Position value</div>
                  <div className="text-xl font-medium">$1,000</div>
                </div>
                <div className="w-px h-12 bg-white/20 mx-4"></div>
                <div className="flex-1">
                  <div className="text-xs font-medium mb-2">Pnl</div>
                  <div className="text-[#16C784] text-xl font-medium">+$13,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="mt-10">
          <Tabs defaultValue="tx-history" className="w-full">
            <TabsList className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF]/20 rounded-lg items-center px-1 w-fit bg-transparent">
              <TabsTrigger
                value="holdings"
                className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
              >
                Holdings
              </TabsTrigger>
              <TabsTrigger
                value="tx-history"
                className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
              >
                Tx history
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg data-[state=active]:bg-[#17171C] data-[state=active]:text-white text-[#A1A1AA]"
              >
                Orders
              </TabsTrigger>
            </TabsList>
            <div className="border-t-[0.5px] border-white/20 mt-4"></div>
            
            <TabsContent value="tx-history">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-left">
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Timestamp</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Value (USDC)</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Amount</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Type</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-4">Address</th>
                      <th className="text-xs font-bold text-white/50 py-2 pr-0 text-right">Hash ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { timestamp: "07/07/2025, 10:09:06", value: "$100.61", amount: "1.78M", type: "deposit", address: "7RET3F...YGS5", hash: "#" },
                      { timestamp: "07/07/2025, 09:45:23", value: "$250.00", amount: "4.50M", type: "withdraw", address: "7RET3F...YGS5", hash: "#" },
                      { timestamp: "07/07/2025, 08:30:15", value: "$500.00", amount: "9.00M", type: "deposit", address: "7RET3F...YGS5", hash: "#" },
                      { timestamp: "07/06/2025, 15:20:42", value: "$75.25", amount: "1.35M", type: "withdraw", address: "7RET3F...YGS5", hash: "#" },
                    ].map((row, idx) => (
                      <tr key={idx} className="bg-white/2">
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.timestamp}</td>
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.value}</td>
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.amount}</td>
                        <td className="text-xs font-medium py-3 pr-4 whitespace-nowrap">
                          <span className={row.type === "deposit" ? "text-[#16C784]" : "text-[#C71624]"}>
                            {row.type === "deposit" ? "Deposit" : "Withdraw"}
                          </span>
                        </td>
                        <td className="text-xs font-medium text-white py-3 pr-4 whitespace-nowrap">{row.address}</td>
                        <td className="text-xs font-medium text-white py-3 pr-0 whitespace-nowrap text-right">
                          <a href={row.hash} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/80 hover:text-white">
                            <SquareArrowOutUpRight size={16} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="holdings">
              <div></div>
            </TabsContent>
            
            <TabsContent value="orders">
              <div></div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
