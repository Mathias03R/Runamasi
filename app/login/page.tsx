'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const { error } = await signIn(email, password)

    if (error) alert(error.message)
    else alert('Login exitoso 🚀')
  }

  return (
    <div>
      <h1>Login</h1>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleLogin}>Ingresar</button>
    </div>
  )
}