'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LandingView } from './LandingView'
import { ChatView } from './ChatView'
import type { ExecProfile } from '../types'

type AuthState = 'loading' | 'seller' | 'exec' | 'none'
type View = 'landing' | 'chat'

interface Props {
  profile: ExecProfile
}

export function PublicProfileClient({ profile }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const autostart = searchParams.get('autostart') === 'true'

  const [view, setView] = useState<View>('landing')
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setAuthState('none')
        return
      }

      setUserId(user.id)

      const { data: userRow } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single()

      const userType = userRow?.user_type ?? 'none'
      setAuthState(userType === 'seller' ? 'seller' : 'exec')

      if (autostart && userType === 'seller') {
        setView('chat')
      }
    }

    checkAuth()
  }, [autostart])

  function handleStartChat() {
    if (authState === 'seller') {
      setView('chat')
      return
    }
    // Not logged in — redirect to seller register with redirect back
    router.push(`/auth/seller/register?redirect=${encodeURIComponent(profile.username)}`)
  }

  if (view === 'chat') {
    return (
      <ChatView
        profile={profile}
        userId={userId}
        onBack={() => setView('landing')}
      />
    )
  }

  return (
    <LandingView
      profile={profile}
      authState={authState}
      onStartChat={handleStartChat}
    />
  )
}
