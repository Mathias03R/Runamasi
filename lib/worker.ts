import { supabase } from './supabaseClient'

export async function createWorker(
  userId: string,
  serviceId: string,
  description: string,
  districtId: string,
  phone: string
) {
  return await supabase.from('workers').insert({
    user_id: userId,
    service_id: serviceId,
    description,
    district_id: districtId,
    phone,
  })
}