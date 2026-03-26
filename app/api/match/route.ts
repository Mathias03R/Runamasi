import { createClient } from '@supabase/supabase-js'
import { detectServiceAI } from '@/lib/detectServiceAI'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)

export async function POST(req: Request) {
  try {
    const { query, district } = await req.json()

    if (!query) {
      return Response.json({ error: 'Consulta requerida' }, { status: 400 })
    }

    // 🧠 detectar servicio automáticamente
    const detectedService = await detectServiceAI(query)

    if (!detectedService) {
      return Response.json({
        error: 'No se pudo identificar el servicio'
      })
    }

    // 🔎 buscar en DB
    const { data: serviceData } = await supabase
      .from('services')
      .select('*')
      .ilike('name', `%${detectedService}%`)
      .single()

    if (!serviceData) {
      return Response.json({ error: 'Servicio no encontrado' })
    }

    let queryBuilder = supabase
      .from('workers')
      .select(`
        *,
        profiles(name),
        services(name)
      `)
      .eq('service_id', serviceData.id)

    if (district) {
      queryBuilder = queryBuilder.eq('district', district)
    }

    const { data: workers } = await queryBuilder

    if (!workers || workers.length === 0) {
      return Response.json({
        message: 'No hay trabajadores disponibles'
      })
    }

    return Response.json({
      detectedService,
      best: workers[0],
      alternatives: workers.slice(1, 3)
    })

  } catch {
    return Response.json(
      { error: 'Error interno' },
      { status: 500 }
    )
  }
}