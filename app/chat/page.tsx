'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import AppNav from '@/components/AppNav'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const workerId = searchParams.get('workerId')

  return (
    <main style={{ padding: 20 }}>
      <h1>Chat</h1>
      <AppNav />

      {!workerId ? (
        <p style={{ marginTop: 20 }}>Selecciona un trabajador desde la búsqueda para abrir un chat.</p>
      ) : (
        <section style={{ marginTop: 20 }}>
          <p>Estás iniciando un chat con el worker: <strong>{workerId}</strong></p>
          <p>Este módulo puede conectarse después con tu sistema real de mensajería.</p>
        </section>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/">← Volver al buscador</Link>
      </p>
    </main>
  )
}
