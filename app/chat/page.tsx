'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { signOut } from '@/lib/auth'
import WorkerCard from '@/components/WorkerCard'
import type { District, MatchResponse, Profile } from '@/lib/types'

const SEARCH_STATE_KEY = 'runamasi:chat-search-state'

export default function ChatPage() {
  const router = useRouter()
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  const initial = useMemo(() => {
    const letter = profile?.name?.trim()?.charAt(0) || session?.user?.email?.charAt(0) || 'U'
    return letter.toUpperCase()
  }, [profile?.name, session?.user?.email])

  useEffect(() => {
    const savedStateRaw = sessionStorage.getItem(SEARCH_STATE_KEY)
    if (savedStateRaw) {
      try {
        const savedState = JSON.parse(savedStateRaw) as {
          query?: string
          district?: string
          result?: MatchResponse | null
        }

        if (savedState.query) setQuery(savedState.query)
        if (savedState.district) setDistrict(savedState.district)
        if (savedState.result) setResult(savedState.result)
      } catch {
        sessionStorage.removeItem(SEARCH_STATE_KEY)
      }
    }

    const loadSessionAndProfile = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)

      if (!data.session?.user?.id) {
        setProfile(null)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, role, district')
        .eq('id', data.session.user.id)
        .single()

      setProfile((profileData as Profile) || null)
    }

    const loadDistricts = async () => {
      const { data } = await supabase.from('districts').select('id, name')
      setDistricts((data as District[]) || [])
    }

    loadSessionAndProfile()
    loadDistricts()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
    })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSessionAndProfile()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(
      SEARCH_STATE_KEY,
      JSON.stringify({
        query,
        district,
        result,
      }),
    )
  }, [district, query, result])

  const handleSearch = async () => {
    if (!session) {
      router.push('/login?next=/chat')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, district }),
      })

      const data: MatchResponse = await res.json()

      if (!res.ok) {
        setResult({ error: data.error || 'No se pudo completar la búsqueda' })
        return
      }

      setResult(data)
    } catch {
      setResult({ error: 'Error de red. Intenta nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Buscador Runamasi</h1>
            <p className="text-sm text-slate-300">Describe tu problema y encuentra trabajadores cerca de ti.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link href="/chat" className="rounded-lg border border-white/20 px-3 py-1 hover:bg-white/10">
                Buscador
              </Link>
              {session && (
                <Link href="/me" className="rounded-lg border border-white/20 px-3 py-1 hover:bg-white/10">
                  Mi perfil
                </Link>
              )}
            </div>
          </div>

          {!session ? (
            <div className="flex gap-3">
              <Link href="/login?next=/chat" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Iniciar sesión</Link>
              <Link href="/register" className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Registrarse</Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-900"
                aria-label="Abrir menú de perfil"
              >
                {initial}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-lg">
                  <Link
                    href="/me"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    Ver mi perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-400/10"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {!session && (
          <p className="mb-4 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
            Debes iniciar sesión antes de realizar una búsqueda.
          </p>
        )}

        <section className="rounded-2xl border border-white/10 bg-white p-4 text-slate-900 shadow-xl md:p-6">
          <label className="mb-2 block text-sm font-medium">¿Qué necesitas?</label>
          <textarea
            className="mb-4 min-h-28 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500"
            placeholder="Ej: Se malogró mi terma y no calienta el agua"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <label className="mb-2 block text-sm font-medium">Distrito</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="mb-4 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500"
          >
            <option value="">Selecciona distrito</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            disabled={loading || !query.trim() || !district}
            className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Buscando...' : 'Buscar trabajadores'}
          </button>
        </section>

        {result && !result.error && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Servicio detectado: {result.detectedService}</h2>

            {result.best && (
              <div className="mt-4">
                <h3 className="mb-2 text-lg font-medium">Mejor opción</h3>
                <WorkerCard worker={result.best} highlight />
              </div>
            )}

            <h3 className="mt-6 text-lg font-medium">Otras opciones ({result.alternatives?.length || 0})</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {result.alternatives?.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          </section>
        )}

        {result?.error && (
          <p className="mt-6 rounded-lg border border-rose-400/40 bg-rose-300/10 px-4 py-3 text-rose-200">
            {result.error}
          </p>
        )}
      </div>
    </main>
  )
}
