"use client"

import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CONFIG } from '@/core/circle-constants'

interface GoogleProviderProps {
  children: React.ReactNode
}

export function GoogleOAuthProviderWrapper({ children }: GoogleProviderProps) {
  const clientId = GOOGLE_CONFIG.clientId

  if (!clientId) {
    console.warn('Google OAuth not configured - NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing')
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}

