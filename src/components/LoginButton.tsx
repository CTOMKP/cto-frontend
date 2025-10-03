"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
// Commented out Aptos authentication imports
// import { GOOGLE_CLIENT_ID } from "../core/constants";
// import useEphemeralKeyPair from "../core/useEphemeralKeyPair";
// import GoogleLogo from "@/components/GoogleLogo";
// import {
//   useWallet,
//   groupAndSortWallets,
// } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";
// import Image from "next/image";
import { CircleChallengeForm } from "./CircleChallengeForm";
import { useCircleAuth } from "@/hooks/useCircleAuth";

export default function LoginButton() {
  // Commented out Aptos authentication logic
  // const ephemeralKeyPair = useEphemeralKeyPair();
  const { user, isAuthenticated, logout } = useCircleAuth();
  const [login, setLogin] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Commented out Aptos wallet connection logic
  // const { wallets = [], notDetectedWallets = [], connect, account } = useWallet();

  // const handleConnect = async (walletName : string) => {
  //   try {
  //     connect(walletName); 
  //     console.log('Connected to wallet:', account);
  //   } catch (error) {
  //     console.error('Failed to connect to wallet:', error);
  //   }
  // };

  // const { availableWallets, installableWallets } =
  //   groupAndSortWallets([...wallets, ...notDetectedWallets]);

  // Commented out Google OAuth redirect URL setup
  // const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  // const searchParams = new URLSearchParams({
  //   client_id: GOOGLE_CLIENT_ID,
  //   redirect_uri: `${window.location.origin}/callback`,
  //   response_type: "id_token",
  //   scope: "openid email profile",
  //   nonce: ephemeralKeyPair.nonce,
  // });
  // redirectUrl.search = searchParams.toString();

  // If user is authenticated, show user menu
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4 mr-5 ml-9">
        <Link href="/profile">
          <Button className="h-10 px-4 rounded-4xl cta-gradient text-base text-white">
            Profile
          </Button>
        </Link>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="h-10 px-4 rounded-4xl border-white text-white hover:bg-white hover:text-black"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger 
        onClick={() => setDialogOpen(true)}
        className="mr-5 ml-9 h-10 w-20 rounded-4xl cta-gradient text-base text-white"
      >
        Login
      </DialogTrigger>
      <DialogContent className="bg-black overflow-auto border-[2px] p-6 border-[#86868630] text-white max-w-5xl rounded-xl">
        <DialogHeader className="flex !flex-row justify-between items-center pb-2 border-b-[0.5px] border-[#FFFFFF20]">
          <div>
            <DialogTitle className="font-bold text-base">{login ? "Login" : "Signup"}</DialogTitle>
            <DialogDescription className="text-xs font-normal">
              {login ? "Don't have an account? " : "Already have an account? "}
              <Button onClick={() => setLogin(!login)} className="h-fit w-fit p-0 bg-transparent">
                <span 
                  className="text-transparent bg-clip-text"
                  style={{ background: 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {login ? "Sign up" : "Sign in"}
                </span>
              </Button>
            </DialogDescription>
          </div>
          <DialogClose>
            <X />
          </DialogClose>
        </DialogHeader>

        {/* Commented out Aptos wallet authentication UI */}
        {/* <Link
          href={redirectUrl.toString()}
          className="flex justify-center items-center rounded-lg px-8 py-2 mt-2 mb-2 hover:shadow-sm active:bg-gray-50 active:scale-95 border-[0.5px] border-[#FFFFFF20] transition-all"
        >
          <GoogleLogo />
          Sign in with Google
        </Link>

        <div className="text-center text-xs text-[#FFFFFF50]">or</div>

        <div className="text-white">
          <div className="space-y-2 mb-2">
              {availableWallets.map((wallet) => (
              <button onClick={() => handleConnect(wallet.name)} className="bg-[#FFFFFF14] hover:cursor-pointer text-base w-full justify-start rounded-lg flex gap-2 items-center p-2.5" key={wallet.name}>
                <Image className="size-5" src={wallet.icon} alt={wallet.name} width={20} height={20} /> <span className="text-[#FFFFFFB2]">Signup with {wallet.name}</span>
              </button>
              ))}
          </div>

          <div className="space-y-2">
              {installableWallets.map((wallet) => (
            <Link target="blank" href={wallet.url} className="bg-[#FFFFFF14] rounded-lg flex gap-2 items-center justify-between p-2.5" key={wallet.name}>
              <div className="flex gap-2 items-center">
                  <Image className="size-5" src={wallet.icon} alt={wallet.name} width={20} height={20} /> <span className="text-[#FFFFFFB2]">Signup with {wallet.name}</span>
              </div>
              <span className="text-xs text-[#FFFFFFB2]">Not installed</span>
            </Link>
        ))}
          </div>
        </div> */}
        <CircleChallengeForm 
          isLoginMode={login} 
          onClose={() => setDialogOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
