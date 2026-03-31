import { createClient } from '@supabase/supabase-js'
import { SupabaseReviewResponse, WorkerReview } from '@/lib/types'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, context: Params) {
  const { id } = await context.params

  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select(`
      *,
      profiles(name),
      services(name),
      districts(name)
    `)
    .eq('id', id)
    .single()

  if (workerError || !worker) {
    return Response.json({ error: 'Trabajador no encontrado' }, { status: 404 })
  }

  const { data, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, user_id, rating, comment, created_at, profiles(name)')
    .eq('worker_id', id)
    .order('created_at', { ascending: false })

  // Forzamos el tipo de los datos recuperados de forma segura
  const reviews = data as SupabaseReviewResponse[] | null

  if (reviewsError) {
    return Response.json({ error: reviewsError.message }, { status: 500 })
  }
  
  const formattedReviews: WorkerReview[] = (reviews || []).map((review) => ({
    id: review.id,
    user_id: review.user_id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    reviewer_name: Array.isArray(review.profiles)
      ? review.profiles[0]?.name
      : review.profiles?.name || "Usuario anónimo",
  }))

  return Response.json({ worker, reviews: formattedReviews })
}

export async function PATCH(req: Request, context: Params) {
  const { id } = await context.params
  const { description, phone, user_id } = await req.json()

  const { data: currentWorker } = await supabase
    .from('workers')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!currentWorker) {
    return Response.json({ error: 'Trabajador no encontrado' }, { status: 404 })
  }

  if (!user_id || currentWorker.user_id !== user_id) {
    return Response.json({ error: 'No autorizado para editar este perfil' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('workers')
    .update({ description, phone })
    .eq('id', id)
    .select(`
      *,
      profiles(name),
      services(name),
      districts(name)
    `)
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ worker: data })
}

export async function POST(req: Request, context: Params) {
  const { id } = await context.params
  const { user_id, rating, comment } = await req.json()

  if (!user_id) {
    return Response.json({ error: 'Debes iniciar sesión para dejar una reseña' }, { status: 401 })
  }

  const numericRating = Number(rating)

  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return Response.json({ error: 'La calificación debe ser un número entre 1 y 5' }, { status: 400 })
  }

  const { data: reviewerProfile, error: reviewerError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user_id)
    .single()

  if (reviewerError || !reviewerProfile) {
    return Response.json({ error: 'Usuario no válido' }, { status: 403 })
  }

  if (reviewerProfile.role !== 'client' && reviewerProfile.role !== 'worker') {
    return Response.json({ error: 'Solo clientes o trabajadores pueden dejar reseñas' }, { status: 403 })
  }

  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (workerError || !worker) {
    return Response.json({ error: 'Trabajador no encontrado' }, { status: 404 })
  }

  if (worker.user_id === user_id) {
    return Response.json({ error: 'No puedes dejar una reseña en tu propio perfil' }, { status: 403 })
  }

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('worker_id', id)
    .eq('user_id', user_id)
    .maybeSingle()

  if (existingReview) {
    return Response.json({ error: 'Ya dejaste una reseña para este trabajador' }, { status: 409 })
  }

  const { data: review, error: insertError } = await supabase
    .from('reviews')
    .insert({
      worker_id: id,
      user_id,
      rating: Math.round(numericRating),
      comment: comment?.trim() ? comment.trim() : null,
    })
    .select('id, user_id, rating, comment, created_at, profiles(name)')
    .single()

  if (insertError || !review) {
    return Response.json({ error: insertError?.message || 'No se pudo guardar la reseña' }, { status: 500 })
  }

  const insertedReview = review as SupabaseReviewResponse

  const formattedReview: WorkerReview = {
    id: insertedReview.id,
    user_id: insertedReview.user_id,
    rating: insertedReview.rating,
    comment: insertedReview.comment,
    created_at: insertedReview.created_at,
    reviewer_name: Array.isArray(insertedReview.profiles)
      ? insertedReview.profiles[0]?.name
      : insertedReview.profiles?.name || 'Usuario anónimo',
  }

  return Response.json({ review: formattedReview }, { status: 201 })
}