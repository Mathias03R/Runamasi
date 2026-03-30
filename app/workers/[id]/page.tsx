'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Worker, WorkerReview } from '@/lib/types'

interface WorkerDetailResponse {
  worker?: Worker
  reviews?: WorkerReview[]
  error?: string
}

export default function WorkerDetailPage() {
  const params = useParams<{ id: string }>()
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [reviews, setReviews] = useState<WorkerReview[]>([])
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const isOwner = useMemo(() => {
    return !!worker && !!sessionUserId && worker.user_id === sessionUserId
  }, [worker, sessionUserId])

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSessionUserId(data.session?.user?.id || null)
    }

    const loadWorker = async () => {
      const res = await fetch(`/api/workers/${params.id}`)
      const data: WorkerDetailResponse = await res.json()

      if (!res.ok || !data.worker) {
        setMessage(data.error || 'No se pudo cargar el trabajador')
        setLoading(false)
        return
      }

      setWorker(data.worker)
      setDescription(data.worker.description || '')
      setPhone(data.worker.phone || '')
      setReviews(data.reviews || [])
      setLoading(false)
    }

    loadSession()
    loadWorker()
  }, [params.id])

  const handleSave = async () => {
    if (!worker || !sessionUserId) return

    setSaving(true)
    setMessage('')

    const res = await fetch(`/api/workers/${worker.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        phone,
        user_id: sessionUserId,
      }),
    })

    const data: WorkerDetailResponse = await res.json()

    if (!res.ok || !data.worker) {
      setMessage(data.error || 'No se pudo actualizar el perfil')
      setSaving(false)
      return
    }

    setWorker(data.worker)
    setMessage('Perfil actualizado correctamente')
    setSaving(false)
  }

  if (loading) {
    return <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 p-8 text-slate-800">Cargando perfil...</main>
  }

  if (!worker) {
    return <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 p-8 text-slate-800">{message || 'Trabajador no encontrado'}</main>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-6 py-8 text-slate-800">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <Link href="/chat" className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50">
            ← Volver al buscador
          </Link>
          {sessionUserId && (
            <Link href="/me" className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50">
              Mi perfil
            </Link>
          )}
        </div>

        <h1 className="text-3xl font-bold">{worker.profiles?.name}</h1>
        <p className="mt-1 text-slate-600">{worker.services?.name}</p>
        <p className="mt-1 text-slate-600">📍 {worker.districts?.name || 'Sin distrito'}</p>

        {isOwner ? (
          <section className="mt-6 space-y-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
            <h2 className="font-semibold text-sky-700">Editar mi perfil</h2>
            <textarea
              className="min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700 disabled:bg-slate-400"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </section>
        ) : (
          <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="font-semibold">Sobre este trabajador</h2>
            <p className="mt-2 text-slate-600">{worker.description || 'Sin descripción'}</p>
            <p className="mt-2 text-slate-600">📞 {worker.phone || 'Sin teléfono'}</p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-2 text-slate-600">Este trabajador todavía no tiene reseñas.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold">⭐ {review.rating}/5</p>
                  <p className="mt-1 text-slate-600">{review.comment || 'Sin comentario.'}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(review.created_at).toLocaleDateString('es-PE')}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {message && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
