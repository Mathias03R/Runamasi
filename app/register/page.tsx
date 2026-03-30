'use client'

import { Suspense } from 'react'
import RegisterContent from './RegisterContent'

export const dynamic = 'force-dynamic'

export default function Register() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegisterContent />
    </Suspense>
  )
}