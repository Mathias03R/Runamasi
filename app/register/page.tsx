'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUpFull } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import type { District, Role, Service } from '@/lib/types'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [district, setDistrict] = useState('')
  const [role, setRole] = useState<Role>('client')

  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [districts, setDistricts] = useState<District[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: servicesData }, { data: districtsData }] = await Promise.all([
        supabase.from('services').select('id, name'),
        supabase.from('districts').select('id, name'),
      ])

      setServices((servicesData as Service[]) || [])
      setDistricts((districtsData as District[]) || [])
    }

    fetchData()
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setErrorMsg('')

    const { error } = await signUpFull({
      email,
      password,
      name,
      role,
      district,
      serviceId,
      description,
      phone,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    router.push('/login?next=/chat')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-600">Regístrate para poder contactar trabajadores y recibir recomendaciones.</p>

        <div className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="Nombre" onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500">
            <option value="">Selecciona distrito</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500">
            <option value="client">Cliente</option>
            <option value="worker">Trabajador</option>
          </select>

          {role === 'worker' && (
            <div className="space-y-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
              <select onChange={(e) => setServiceId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500">
                <option value="">Servicio</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="Descripción" onChange={(e) => setDescription(e.target.value)} />
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="Teléfono" onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password || !name || !district}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          {errorMsg && (
            <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMsg}
            </p>
          )}
        </div>

        <p className="mt-6 text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800">
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  )
}
