'use client'

export const dynamic = 'force-dynamic'

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-600">Entra para poder buscar trabajadores en tu distrito.</p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
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
          <Link href="/register" className="font-semibold text-sky-700 hover:text-sky-800">
            Regístrate aquí
          </Link>
        </p>
      </section>
    </main>
  )
}
