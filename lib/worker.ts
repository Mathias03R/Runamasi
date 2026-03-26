import { supabase } from './supabaseClient'

export async function createWorker(
  userId: string,
  serviceId: string,
  description: string,
  district: string,
  phone: string
) {
  return await supabase.from('workers').insert({
    user_id: userId,
    service_id: serviceId,
    description,
    district,
    phone,
  })
}