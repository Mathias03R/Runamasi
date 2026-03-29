'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import WorkerCard from '@/components/WorkerCard'
import type { District, MatchResponse } from '@/lib/types'

export default function ChatPage() {
  const router = useRouter()
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null>(null)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }

    const loadDistricts = async () => {
      const { data } = await supabase.from('districts').select('id, name')
      setDistricts((data as District[]) || [])
    }

    loadSession()
    loadDistricts()
  }, [])

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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Buscador Runamasi</h1>
            <p className="text-sm text-slate-300">Describe tu problema y encuentra trabajadores cerca de ti.</p>
          </div>

          {!session ? (
            <div className="flex gap-3">
              <Link href="/login?next=/chat" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Iniciar sesión</Link>
              <Link href="/register" className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Registrarse</Link>
            </div>
          ) : (
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm text-emerald-300">Sesión iniciada</span>
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
