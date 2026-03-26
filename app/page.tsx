'use client'

import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSearch = async () => {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, district })
    })

    const data = await res.json()
    setResult(data)
  }

  return (
    <>
      <input
        placeholder="¿Qué problema tienes?"
        onChange={(e) => setQuery(e.target.value)}
      />

      <input
        placeholder="Distrito"
        onChange={(e) => setDistrict(e.target.value)}
      />

      <button onClick={handleSearch}>
        Buscar
      </button>

      {result && (
        <div>
          <h2>Detectado: {result.detectedService}</h2>

          <h3>Mejor opción:</h3>
          <p>{result.best?.profiles?.name}</p>
        </div>
      )}
    </>
  )
}