import { supabase } from './supabaseClient'

export async function createProfile(
  userId: string,
  name: string,
  role: 'client' | 'worker',
  district: string
) {
  return await supabase.from('profiles').insert({
    id: userId,
    name,
    role,
    district,
  })
}