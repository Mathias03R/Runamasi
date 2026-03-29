'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AppNav from '@/components/AppNav'
import type { Worker } from '@/lib/types'

export default function WorkerProfilePage() {
  const { workerId } = useParams<{ workerId: string }>()
  const [worker, setWorker] = useState<Worker | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWorker = async () => {
      try {
        const res = await fetch(`/api/workers/${workerId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'No se encontró el trabajador')
          return
        }

        setWorker(data as Worker)
      } catch {
        setError('Error al cargar perfil de worker')
      }
    }

    loadWorker()
  }, [workerId])

  return (
    <main style={{ padding: 20 }}>
      <h1>Perfil del worker</h1>
      <AppNav />

      {error && <p style={{ marginTop: 20 }}>{error}</p>}

      {worker && (
        <section style={{ marginTop: 20 }}>
          <h2>{worker.profiles?.name}</h2>
          <p><strong>Servicio:</strong> {worker.services?.name}</p>
          <p><strong>Distrito:</strong> {worker.districts?.name || 'Sin distrito'}</p>
          <p><strong>Descripción:</strong> {worker.description || 'Sin descripción'}</p>
          <p><strong>Teléfono:</strong> {worker.phone || 'No disponible'}</p>
          <p><strong>Rating:</strong> {worker.rating ?? 0}</p>
          <p>
            <Link href={`/chat?workerId=${worker.id}`}>Ir al chat con este worker</Link>
          </p>
        </section>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/">← Volver al buscador</Link>
      </p>
    </main>
  )
}
