'use client'

import { useState, useEffect } from 'react'
import { signUpFull } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import type { District, Role, Service } from '@/lib/types'

export default function Register() {
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

    if (error) alert(error.message)
    else alert('Registrado 🚀')
  }

  return (
    <div>
      <h1>Registro</h1>

      <input placeholder="Nombre" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

      <select
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
      >
        <option value="">Selecciona distrito</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
        <option value="client">Cliente</option>
        <option value="worker">Trabajador</option>
      </select>

      {role === 'worker' && (
        <>
          <select onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Servicio</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input placeholder="Descripción" onChange={(e) => setDescription(e.target.value)} />
          <input placeholder="Teléfono" onChange={(e) => setPhone(e.target.value)} />
        </>
      )}

      <button onClick={handleSubmit}>Registrarse</button>
    </div>
  )
}
