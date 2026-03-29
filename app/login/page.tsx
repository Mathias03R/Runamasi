'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const nextPath = useMemo(() => searchParams.get('next') || '/chat', [searchParams])

  const handleLogin = async () => {
    setLoading(true)
    setErrorMsg('')

    const { error } = await signIn(email, password)

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    router.push(nextPath)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-600">Entra para poder buscar trabajadores en tu distrito.</p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          {errorMsg && (
            <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMsg}
            </p>
          )}
        </div>

        <p className="mt-6 text-sm text-slate-600">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Regístrate aquí
          </Link>
        </p>
      </section>
    </main>
  )
}
