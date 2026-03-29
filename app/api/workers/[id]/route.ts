import { createClient } from '@supabase/supabase-js'

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

  const { data: reviews , error: reviewsError } = await supabase
    .from('reviews')
    .select('id, worker_id, user_id, rating, comment, created_at, updated_at')
    .eq('worker_id', id)
    .order('created_at', { ascending: false })

  if (reviewsError) {
    return Response.json({ error: `No se pudieron cargar las reseñas: ${reviewsError.message}` }, { status: 500 })
  }

  return Response.json({
    worker,
    reviews: reviews || [],
  })
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
