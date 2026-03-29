'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import WorkerCard from '@/components/WorkerCard'
import type { District, MatchResponse } from '@/lib/types'

export default function Home() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null>(null)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setSession(null)
        return
      }
      setSession(data.session)
    }

    loadSession()
  }, [])

  useEffect(() => {
    const loadDistricts = async () => {
      const { data, error } = await supabase
        .from('districts')
        .select('id, name')

      if (error) {
        setDistricts([])
        return
      }

      setDistricts((data as District[]) || [])
    }

    loadDistricts()
  }, [])

  const handleSearch = async () => {
    setLoading(true)

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
    <main style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Runamasi 🛠️</h1>

        {!session ? (
          <div>
            <Link href="/login">Login</Link>{' '}
            <Link href="/register">Register</Link>
          </div>
        ) : (
          <p>Sesión iniciada ✅</p>
        )}
      </header>

      <section style={{ marginTop: 30 }}>
        <h2>¿Qué necesitas?</h2>

        <input
          placeholder="Ej: se rompió mi caño"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">Selecciona distrito</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <button onClick={handleSearch} disabled={loading}>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 15,
            marginTop: 15,
          }}>
            {result.alternatives?.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </section>
      )}

      {result?.error && <p>{result.error}</p>}
    </main>
  )
}
