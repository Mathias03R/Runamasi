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
    <Link href={`/workers/${worker.id}`} className="block">
      <article
        className={`rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          highlight ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'
        }`}
      >
        <h3 className="text-lg font-semibold text-slate-900">{worker.profiles?.name}</h3>
        <p className="text-sm font-medium text-slate-600">{worker.services?.name}</p>
        <p className="mt-2 text-sm text-slate-700">📍 {worker.districts?.name || 'Sin distrito'}</p>
        <p className="mt-2 text-sm text-slate-700">{worker.description}</p>

        <p className="mt-3 text-sm text-slate-800">
          {renderStars(rating)} ({rating.toFixed(1)})
        </p>

        <p className="text-xs text-slate-500">{reviewsCount} reseñas</p>
        <p className="mt-2 text-sm text-slate-700">📞 {worker.phone}</p>

        {highlight && <span className="mt-2 inline-block text-sm font-semibold text-emerald-700">🟢 Mejor opción</span>}
      </article>
    </Link>
  )
}
