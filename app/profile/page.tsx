'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import AppNav from '@/components/AppNav'
import { useAuthSession } from '@/lib/useAuthSession'
import type { Role } from '@/lib/types'

interface ProfileData {
  id: string
  name: string
  role: Role
  district: string | null
}

export default function ProfilePage() {
  const { session, loadingSession } = useAuthSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) {
        setProfile(null)
        return
      }

      setLoadingProfile(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, name, role, district')
        .eq('id', session.user.id)
        .single()

      setProfile((data as ProfileData) || null)
      setLoadingProfile(false)
    }

    loadProfile()
  }, [session?.user?.id])

  return (
    <main style={{ padding: 20 }}>
      <h1>Mi perfil</h1>
      <AppNav />

      {loadingSession || loadingProfile ? (
        <p style={{ marginTop: 20 }}>Cargando perfil...</p>
      ) : !session ? (
        <div style={{ marginTop: 20 }}>
          <p>No hay sesión activa.</p>
          <Link href="/login">Inicia sesión</Link> o <Link href="/register">regístrate</Link>
        </div>
      ) : (
        <section style={{ marginTop: 20 }}>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Nombre:</strong> {profile?.name || 'Sin nombre'}</p>
          <p><strong>Rol:</strong> {profile?.role || 'Sin rol'}</p>
          <p><strong>Distrito:</strong> {profile?.district || 'Sin distrito'}</p>
        </section>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/">← Volver al buscador</Link>
      </p>
    </main>
  )
}
