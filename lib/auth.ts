import { supabase } from './supabaseClient'
import type { SignUpFormData } from './types'

export async function signUpFull(dataForm: SignUpFormData) {
  const { email, password, name, role, district } = dataForm

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error || !data.user) return { error }

  const userId = data.user.id

  await supabase.from('profiles').insert({
    id: userId,
    name,
    role,
    district,
  })

  if (role === 'worker') {
    const isServer = typeof window === 'undefined'
    const baseUrl = isServer ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') : ''

    try {
      const res = await fetch(`${baseUrl}/api/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          service_id: dataForm.serviceId,
          description: dataForm.description,
          district_id: district,
          phone: dataForm.phone,
        }),
      })

      if (!res.ok) {
        const result = await res.json()
        if (!isServer) alert(result.error)
        else console.error('Error en Seed Worker:', result.error)
      }
    } catch (fetchError) {
      console.error('Error crítico en fetch:', fetchError)
    }
  }

  return { data }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}
