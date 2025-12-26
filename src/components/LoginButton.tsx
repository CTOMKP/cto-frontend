"use client";

import React from "react";
import { Button } from "./ui/button";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const { login } = usePrivyAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login();
      // Redirect to profile page after successful login
      router.push('/profile');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="p-2 mx-3 rounded-[55px] inline-block border-[0.2px] border-white/20">
      <Button 
      onClick={handleLogin}
      className="h-10 w-20 rounded-4xl cta-gradient text-base text-white"
    >
      Login
    </Button>
    </div>
  );
}
