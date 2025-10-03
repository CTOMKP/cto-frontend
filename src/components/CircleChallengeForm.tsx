"use client"

import { useCallback, useEffect, useState } from "react"
import { useGoogleLogin } from '@react-oauth/google'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCircleAuth } from "@/hooks/useCircleAuth"
import { useCircleWallet } from "@/hooks/useCircleWallet"
import { GOOGLE_CONFIG } from "@/core/circle-constants"
import axios from 'axios'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { MoonLoader } from 'react-spinners'


interface CircleChallengeFormProps {
  isLoginMode: boolean
  onClose?: () => void
}

export function CircleChallengeForm({ isLoginMode, onClose }: CircleChallengeFormProps) {
  const { user, login, register, isAuthenticated } = useCircleAuth()
  const { createWallet, isCreatingWallet } = useCircleWallet(user?.id)
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleOAuthInProgress, setIsGoogleOAuthInProgress] = useState(false)

  // Check if Google OAuth is available
  const isGoogleOAuthAvailable = () => {
    return !!GOOGLE_CONFIG.clientId
  }


  // Auto-redirect to profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Close the dialog first
      if (onClose) {
        onClose()
      }
      // Then redirect to profile
      router.push('/profile')
    }
  }, [isAuthenticated, user, router, onClose])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isLoginMode) {
        // For login, use email as userId since backend expects userId
        await login(email, password)
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        await register("", email, password)
        
        // After successful signup, create wallet
        if (user?.email) {
          await createWallet(user.email, user.email, `Wallet for ${user.email}`)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isLoginMode, email, password, confirmPassword, login, register, user, createWallet])

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Set OAuth in progress to hide the form
        setIsGoogleOAuthInProgress(true)
        
        // Get user info from Google immediately
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }).then(res => res.json())
        
        if (userInfo.email) {
          const backendUrl = 'https://cto-backend-production-28e3.up.railway.app'
          
          try {
            const walletsResponse = await axios.get(`${backendUrl}/api/circle/users/${userInfo.email}/wallets`)
            
            if (walletsResponse.data.wallets && walletsResponse.data.wallets.length > 0) {
              // User exists and has wallets - IMMEDIATE redirect to profile
              // Store user info in localStorage using CTO-CircleWallet pattern
              if (typeof window !== 'undefined') {
                const userData = {
                  id: userInfo.id,
                  email: userInfo.email,
                  status: 'active',
                  circleUserId: walletsResponse.data.wallets[0]?.id
                }
                const token = `google_token_${Date.now()}`
                
                // Use CTO-CircleWallet pattern
                localStorage.setItem('cto_user_email', userInfo.email)
                localStorage.setItem('cto_auth_token', token)
                
                // Also store in circle_user format for compatibility
                localStorage.setItem('circle_user', JSON.stringify(userData))
                localStorage.setItem('circle_token', token)
              }
              
              // Close dialog and redirect
              if (onClose) {
                onClose()
              }
              window.location.replace('/profile')
              return
            } else {
              // User exists but no wallet - redirect to signup
              // Store user info for wallet creation using CTO-CircleWallet pattern
              if (typeof window !== 'undefined') {
                const userData = {
                  id: userInfo.id,
                  email: userInfo.email,
                  status: 'active'
                }
                const token = `google_token_${Date.now()}`
                
                // Use CTO-CircleWallet pattern
                localStorage.setItem('cto_user_email', userInfo.email)
                localStorage.setItem('cto_auth_token', token)
                
                // Also store in circle_user format for compatibility
                localStorage.setItem('circle_user', JSON.stringify(userData))
                localStorage.setItem('circle_token', token)
              }
              
              // Close dialog and redirect to signup
              if (onClose) {
                onClose()
              }
              window.location.replace('/signup')
              return
            }
          } catch {
            // User doesn't exist - create account and redirect to signup
            try {
              const signupResponse = await axios.post(`${backendUrl}/api/circle/users`, {
                userId: userInfo.id, // Use Google user ID
                email: userInfo.email,
                password: 'google_oauth_user'
              })
              
              if (signupResponse.data.success) {
                // Store user info using CTO-CircleWallet pattern
                if (typeof window !== 'undefined') {
                  const userData = {
                    id: userInfo.id,
                    email: userInfo.email,
                    status: 'active'
                  }
                  const token = `google_token_${Date.now()}`
                  
                  // Use CTO-CircleWallet pattern
                  localStorage.setItem('cto_user_email', userInfo.email)
                  localStorage.setItem('cto_auth_token', token)
                  
                  // Also store in circle_user format for compatibility
                  localStorage.setItem('circle_user', JSON.stringify(userData))
                  localStorage.setItem('circle_token', token)
                }
                
                // Close dialog and redirect to signup
                if (onClose) {
                  onClose()
                }
                window.location.replace('/signup')
                return
              } else {
                throw new Error('Failed to create user account')
              }
            } catch {
              setIsGoogleOAuthInProgress(false)
              setError('Failed to create account. Please try again.')
            }
          }
        } else {
          setIsGoogleOAuthInProgress(false)
          setError('Failed to get user information from Google')
        }
      } catch {
        setIsGoogleOAuthInProgress(false)
        setError('Google sign-in failed. Please try again.')
      }
    },
    onError: () => {
      setError('Google sign-in failed. Please try again.')
    }
  })

  // Show loading state during Google OAuth
  if (isGoogleOAuthInProgress) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <MoonLoader color="#ffffff" size={50} />
      </div>
    )
  }

  // If user is authenticated, show success message

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="space-y-2 py-3 flex flex-col justify-center border-[0.2px] border-[#FFFFFF]/20 h-[70px] rounded-lg
             focus-within:border-white focus-within:ring-2 focus-within:ring-white"
        >
          <Label className="px-3" htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full placeholder:text-[#FFFFFF]/20 border-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 focus-visible:border-transparent"
          />
        </div>

        <div className="space-y-2 py-3 flex flex-col justify-center border-[0.2px] border-[#FFFFFF]/20 h-[70px] rounded-lg
             focus-within:border-white focus-within:ring-2 focus-within:ring-white">
          <Label className="px-3" htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full placeholder:text-[#FFFFFF]/20 border-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 focus-visible:border-transparent"
          />
        </div>

        {!isLoginMode && (
          <div className="space-y-2 py-3 flex flex-col justify-center border-[0.2px] border-[#FFFFFF]/20 h-[70px] rounded-lg
          focus-within:border-white focus-within:ring-2 focus-within:ring-white">
            <Label className="px-3" htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full placeholder:text-[#FFFFFF]/20 border-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 focus-visible:border-transparent"
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full cta-gradient"
          disabled={isLoading || isCreatingWallet}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>
                {isLoginMode ? "Signing in..." : "Creating account..."}
              </span>
            </div>
          ) : isCreatingWallet ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating wallet...</span>
            </div>
          ) : isLoginMode ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Separator */}
        <div className="flex justify-center text-sm">
          <span className="text-[#FFFFFF]/50 text-xs">or</span>
        </div>

      {/* Google OAuth Button */}
      {isGoogleOAuthAvailable() && (
        <Button
          onClick={() => handleGoogleSignIn()}
          className="w-full h-10 flex items-center justify-center space-x-2 border border-[#FFFFFF]/10 rounded-lg  transition-colors duration-200"
        >
            <Image src="/google-icon.png" alt="Google Logo" width={20} height={20} />
          <span className="font-medium">Login with Google</span>
        </Button>
      )}

    </div>
  );
}