'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import AppNav from '@/components/AppNav'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await signIn(email, password)

    if (error) alert(error.message)
    else {
      alert('Login exitoso 🚀')
      router.push('/profile')
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Login</h1>
      <AppNav />

      <div style={{ marginTop: 20, display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleLogin}>Ingresar</button>
      </div>
    </main>
  )
}
