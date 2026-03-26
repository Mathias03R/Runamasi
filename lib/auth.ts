import { supabase } from './supabaseClient'

export async function signUpFull(dataForm: any) {
  const { email, password, name, role, district } = dataForm

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error || !data.user) return { error }

  const userId = data.user.id

  // profile (puede seguir directo o también mover a API luego)
  await supabase.from('profiles').insert({
    id: userId,
    name,
    role,
    district,
  })

  // worker via API
  if (role === 'worker') {
    const res = await fetch('/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        service_id: dataForm.serviceId,
        description: dataForm.description,
        district,
        phone: dataForm.phone,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      alert(result.error)
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