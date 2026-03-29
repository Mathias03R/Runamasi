'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import WorkerCard from '@/components/WorkerCard'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [districts, setDistricts] = useState<any[]>([])

  // 🔐 detectar sesión
  useEffect(() => {
    console.log('Iniciando useEffect de sesión')
    supabase.auth.getSession()
      .then(({ data, error }) => {
        console.log('Sesión detectada:', data.session)
        if (error) console.error('Error al obtener sesión:', error)
        setSession(data.session)
      })
  }, [])

  useEffect(() => {
    console.log('Iniciando useEffect de distritos')
    supabase
      .from('districts')
      .select('*')
      .then(({ data, error }) => {
        console.log('Distritos obtenidos de Supabase:', data)
        if (error) console.error('Error al obtener distritos:', error)
        setDistricts(data || [])
      })
      
  }, [])
  const handleSearch = async () => {
    setLoading(true)
    console.log('Iniciando búsqueda con query:', query, 'y distrito:', district)

    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, district }),
    })

    const data = await res.json()
    setResult(data)

    setLoading(false)
  }

  return (
    <main style={{ padding: 20 }}>
      {/* 🔝 HEADER */}
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

      {/* 🔍 BUSCADOR */}
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

        <button onClick={handleSearch}>
          Buscar
        </button>
      </section>

      {/* ⏳ LOADING */}
      {loading && <p>Buscando trabajadores...</p>}

      {/* 🎯 RESULTADOS */}
      {result && !result.error && (
        <section style={{ marginTop: 30 }}>
          <h2>Servicio detectado: {result.detectedService}</h2>

          {/* 🏆 MEJOR */}
          {result.best && (
            <>
              <h3>Mejor opción</h3>
              <WorkerCard worker={result.best} highlight />
            </>
          )}

          {/* 🔁 ALTERNATIVAS */}
          <h3>Otras opciones ({result.alternatives?.length || 0})</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 15,
            marginTop: 15
          }}>
            {result.alternatives?.map((w: any) => (
              <WorkerCard key={w.id} worker={w} />
            ))}
          </div>
        </section>
      )}

      {/* ❌ ERROR */}
      {result?.error && <p>{result.error}</p>}
    </main>
  )
}