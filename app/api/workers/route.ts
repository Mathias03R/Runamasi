import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)

// 🟢 GET → listar workers
export async function GET() {
  const { data, error } = await supabase
    .from('workers')
    .select(`
      *,
      profiles(name),
      services(name)
    `)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

// 🔵 POST → crear worker
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      user_id,
      service_id,
      description,
      district,
      phone,
    } = body

    // 🔐 VALIDACIONES
    if (!user_id || !service_id) {
      return Response.json(
        { error: 'user_id y service_id son obligatorios' },
        { status: 400 }
      )
    }

    if (!phone || phone.length < 6) {
      return Response.json(
        { error: 'Teléfono inválido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('workers')
      .insert({
        user_id,
        service_id,
        description,
        district,
        phone,
      })
      .select()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
  } catch {
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}