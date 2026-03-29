'use client'

import Link from 'next/link'
import type { Worker } from '@/lib/types'

interface WorkerCardProps {
  worker: Worker
  highlight?: boolean
}

function renderStars(rating = 0) {
  const fullStars = Math.round(rating)
  return '⭐'.repeat(fullStars) + '☆'.repeat(5 - fullStars)
}

export default function WorkerCard({ worker, highlight = false }: WorkerCardProps) {
  const rating = worker.rating || 0
  const reviewsCount = worker.reviews?.[0]?.count || 0

  return (
    <div
      style={{
        border: highlight ? '2px solid green' : '1px solid #ccc',
        padding: 15,
        borderRadius: 12,
        background: highlight ? '#f0fff0' : '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <h3>{worker.profiles?.name}</h3>

      <p><strong>{worker.services?.name}</strong></p>

      <p>📍 {worker.districts?.name || 'Sin distrito'}</p>

      <p>{worker.description}</p>

      <p>
        {renderStars(rating)} ({rating.toFixed(1)})
      </p>

      <p style={{ fontSize: 12, color: '#666' }}>
        {reviewsCount} reseñas
      </p>

      <p>📞 {worker.phone}</p>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Link href={`/workers/${worker.id}`}>Ver perfil</Link>
        <Link href={`/chat?workerId=${worker.id}`}>Ir al chat</Link>
      </div>

      {highlight && (
        <span style={{ color: 'green', fontWeight: 'bold' }}>
          🟢 Mejor opción
        </span>
      )}
    </div>
  )
}
