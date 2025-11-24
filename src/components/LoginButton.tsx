"use client";

import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";

export default function LoginButton() {
  const { user, isAuthenticated, logout, login } = usePrivyAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
    <Button 
      onClick={handleLogin}
      className="mr-5 ml-9 h-10 w-20 rounded-4xl cta-gradient text-base text-white"
    >
      Login
    </Button>
  );
}
