'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import WorkerCard from '@/components/WorkerCard'
import type { District, MatchResponse } from '@/lib/types'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/lib/useAuthSession'
import AppNav from '@/components/AppNav'

const LAST_SEARCH_KEY = 'runamasi:last-search'

export default function Home() {
  const { session, loadingSession } = useAuthSession()
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const paramsQuery = useMemo(() => searchParams.get('q') || '', [searchParams])
  const paramsDistrict = useMemo(() => searchParams.get('district') || '', [searchParams])

  useEffect(() => {
    const loadDistricts = async () => {
      const { data, error } = await supabase.from('districts').select('id, name')

      if (error) {
        setDistricts([])
        return
      }

      setDistricts((data as District[]) || [])
    }

    loadDistricts()
  }, [])

  useEffect(() => {
    setQuery(paramsQuery)
    setDistrict(paramsDistrict)

    const raw = sessionStorage.getItem(LAST_SEARCH_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as {
        query: string
        district: string
        result: MatchResponse | null
      }

      if (parsed.query === paramsQuery && parsed.district === paramsDistrict) {
        setResult(parsed.result)
      }
    } catch {
      sessionStorage.removeItem(LAST_SEARCH_KEY)
    }
  }, [paramsDistrict, paramsQuery])

  const handleSearch = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, district }),
      })

      const data: MatchResponse = await res.json()
      const newResult = res.ok ? data : { error: data.error || 'No se pudo completar la búsqueda' }
      setResult(newResult)

      const queryParams = new URLSearchParams()
      if (query) queryParams.set('q', query)
      if (district) queryParams.set('district', district)
      router.replace(`/?${queryParams.toString()}`)

      sessionStorage.setItem(
        LAST_SEARCH_KEY,
        JSON.stringify({ query, district, result: newResult })
      )
    } catch {
      setResult({ error: 'Error de red. Intenta nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Runamasi 🛠️</h1>

        {!session ? (
          <div>
            <Link href="/login">Login</Link>{' '}
            <Link href="/register">Register</Link>
          </div>
        ) : (
          <p>{loadingSession ? 'Verificando sesión...' : `Sesión iniciada: ${session.user.email}`}</p>
        )}
      </header>

      <AppNav />

      <section style={{ marginTop: 30, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <h2 style={{ width: '100%' }}>¿Qué necesitas?</h2>

        <input
          placeholder="Ej: se rompió mi caño"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">Selecciona distrito</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <button onClick={handleSearch} disabled={loading || !query || !district}>
          Buscar
        </button>
      </section>

      {loading && <p>Buscando trabajadores...</p>}

      {result && !result.error && (
        <section style={{ marginTop: 30 }}>
          <h2>Servicio detectado: {result.detectedService}</h2>

          {result.best && (
            <>
              <h3>Mejor opción</h3>
              <WorkerCard worker={result.best} highlight />
            </>
          )}

          <h3>Otras opciones ({result.alternatives?.length || 0})</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 15,
              marginTop: 15,
            }}
          >
            {result.alternatives?.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </section>
      )}

      {result?.message && <p>{result.message}</p>}
      {result?.error && <p>{result.error}</p>}
    </main>
  )
}
