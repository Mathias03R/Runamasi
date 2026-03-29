import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const { workerId } = await params

  const { data, error } = await supabase
    .from('workers')
    .select(`
      *,
      profiles(name),
      services(name),
      districts(name),
      reviews(count)
    `)
    .eq('id', workerId)
    .single()

  if (error || !data) {
    return Response.json({ error: 'Worker no encontrado' }, { status: 404 })
  }

  return Response.json(data)
}
