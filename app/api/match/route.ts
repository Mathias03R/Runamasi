import { createClient } from '@supabase/supabase-js'
import { detectServiceAI } from '@/lib/detectServiceAI'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)

export async function POST(req: Request) {
  try {
    const { query, district } = await req.json()

    if (!query || !district) {
      return Response.json(
        { error: 'query y district son requeridos' },
        { status: 400 }
      )
    }
    // 🧠 1. Detectar servicio con IA
    const detectedService = await detectServiceAI(query)

    if (!detectedService) {
      return Response.json({
        error: 'No se pudo detectar el servicio',
      })
    }

    // 🔎 2. Buscar service_id
    const { data: serviceData, error: serviceError } =
      await supabase
        .from('services')
        .select('*')
        .ilike('name', `%${detectedService}%`)
        .single()

    if (serviceError || !serviceData) {
      return Response.json({
        error: 'Servicio no encontrado',
      })
    }

    // 📍 3. Obtener distrito
    const { data: districtData } = await supabase
      .from('districts')
      .select('*')
      .eq('id', district)
      .single()

    if (!districtData) {
      return Response.json({
        error: 'Distrito no encontrado',
      })
    }

    // 🟢 4. Buscar workers en distrito exacto
    const { data: exactWorkers } = await supabase
      .from('workers')
      .select(`
        *,
        profiles(name),
        services(name),
        districts(name),
        reviews(count)
      `)
      .eq('service_id', serviceData.id)
      .eq('district_id', districtData.id)

    let workers = exactWorkers || []

    // 🟡 5. Si hay pocos → buscar vecinos
    if (workers.length < 5) {
      const { data: neighbors } = await supabase
        .from('district_neighbors')
        .select('neighbor_id')
        .eq('district_id', districtData.id)

      const neighborIds = neighbors?.map(n => n.neighbor_id) || []

      const { data: neighborWorkers } = await supabase
        .from('workers')
        .select(`
          *,
          profiles(name),
          services(name),
          districts(name),
          reviews(count)
        `)
        .eq('service_id', serviceData.id)
        .in('district_id', neighborIds)

      // 🔥 IMPORTANTE: combinar, no reemplazar
      workers = [...workers, ...(neighborWorkers || [])]
    }
    

    if (workers.length === 0) {
      return Response.json({
        detectedService,
        message: 'No hay trabajadores disponibles',
      })
    }

    // 🏆 6. Ranking (rating primero)
    const sorted = workers.sort((a, b) => {
      return (b.rating || 0) - (a.rating || 0)
    })

    const best = sorted[0]

    return Response.json({
      detectedService,
      best,
      alternatives: sorted.slice(1, 10),
      total: sorted.length,
    })

  } catch {
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}