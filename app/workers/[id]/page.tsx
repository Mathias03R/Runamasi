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
  const [sessionUserRole, setSessionUserRole] = useState<string | null>(null)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [reviews, setReviews] = useState<WorkerReview[]>([])
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [message, setMessage] = useState('')
  const whatsappLink = worker?.phone
    ? (() => {
        const normalizedPhone = worker.phone.replace(/[^\d+]/g, '').replace(/^\+/, '')
        if (!normalizedPhone) return null
        return `https://wa.me/+51${normalizedPhone}`
      })()
    : null

  const isOwner = useMemo(() => {
    return !!worker && !!sessionUserId && worker.user_id === sessionUserId
  }, [worker, sessionUserId])

  const canAccessOwnProfile = sessionUserRole === 'worker'
  const canLeaveReview = !!sessionUserId && !isOwner
  const hasReviewed = !!sessionUserId && reviews.some((review) => review.user_id === sessionUserId)

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user?.id || null
      setSessionUserId(userId)

      if (!userId) {
        setSessionUserRole(null)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      setSessionUserRole(profileData?.role || null)
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

  const handleCreateReview = async () => {
    if (!worker || !sessionUserId || hasReviewed) return

    setSubmittingReview(true)
    setMessage('')

    const res = await fetch(`/api/workers/${worker.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: sessionUserId,
        rating: reviewRating,
        comment: reviewComment,
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.review) {
      setMessage(data.error || 'No se pudo guardar la reseña')
      setSubmittingReview(false)
      return
    }

    setReviews((prev) => [data.review, ...prev])
    setReviewRating(5)
    setReviewComment('')
    setMessage('¡Gracias! Tu reseña fue registrada.')
    setSubmittingReview(false)
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
          {sessionUserId && canAccessOwnProfile && (
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
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Escribir por WhatsApp
              </a>
            )}
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Reviews</h2>
          {!sessionUserId ? (
            <p className="mt-2 text-sm text-slate-600">Inicia sesión para dejar una reseña.</p>
          ) : canLeaveReview ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">Deja tu reseña</h3>
              {hasReviewed ? (
                <p className="mt-2 text-sm text-slate-600">Ya dejaste una reseña para este trabajador.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Calificación
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} estrella{value > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Comentario
                    <textarea
                      className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 bg-white p-3"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Comparte tu experiencia (opcional)"
                    />
                  </label>
                  <button
                    onClick={handleCreateReview}
                    disabled={submittingReview}
                    className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700 disabled:bg-slate-400"
                  >
                    {submittingReview ? 'Enviando...' : 'Publicar reseña'}
                  </button>
                </div>
              )}
            </div>
          ) : null}
          {reviews.length === 0 ? (
            <p className="mt-2 text-slate-600">Este trabajador todavía no tiene reseñas.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold">{review.reviewer_name || 'Usuario anónimo'} ⭐ {review.rating}/5</p>
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
