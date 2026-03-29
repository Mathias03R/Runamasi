'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type AuthSession = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (mounted) {
        setSession(data.session)
        setLoadingSession(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return
      setSession(currentSession)
      setLoadingSession(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { session, loadingSession }
}
