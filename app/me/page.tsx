'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { signOut } from '@/lib/auth'
import type { Profile } from '@/lib/types'

interface WorkerInfo {
  id: string
}

export default function MyProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [worker, setWorker] = useState<WorkerInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMyProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session?.user?.id) {
        router.push('/login?next=/me')
        setLoading(false)
        return
      }

      const userId = sessionData.session.user.id

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, role, district')
        .eq('id', userId)
        .single()

      setProfile((profileData as Profile) || null)

      const { data: workerData } = await supabase
        .from('workers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      setWorker((workerData as WorkerInfo) || null)
      setLoading(false)
    }

    loadMyProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!currentSession?.user?.id) {
        router.push('/login?next=/me')
        setProfile(null)
        setWorker(null)
        setLoading(false)
      }
    })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadMyProfile()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-950 p-8 text-white">Cargando perfil...</main>
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold">Mi perfil</h1>
        <p className="mt-2 text-slate-300">Aquí puedes ver tus datos y gestionar tu sesión.</p>

        {profile ? (
          <section className="mt-6 space-y-2 rounded-xl border border-white/10 bg-slate-900/30 p-4">
            <p><span className="font-semibold">Nombre:</span> {profile.name}</p>
            <p><span className="font-semibold">Rol:</span> {profile.role}</p>
            <p><span className="font-semibold">Distrito:</span> {profile.district}</p>
          </section>
        ) : (
          <p className="mt-6 text-slate-300">No se encontró tu perfil.</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {worker && (
            <Link href={`/workers/${worker.id}`} className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600">
              Ver mi perfil público
            </Link>
          )}

          <Link href="/chat" className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10">
            Volver al buscador
          </Link>

          <button
            onClick={handleSignOut}
            className="rounded-lg border border-rose-300/50 px-4 py-2 text-rose-300 hover:bg-rose-400/10"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </main>
  )
}
