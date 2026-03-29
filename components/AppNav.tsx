'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinkStyle = (active: boolean) => ({
  fontWeight: active ? 'bold' as const : 'normal' as const,
  textDecoration: active ? 'underline' : 'none',
})

export default function AppNav() {
  const pathname = usePathname()

  return (
    <nav style={{ display: 'flex', gap: 12, marginTop: 10 }}>
      <Link href="/" style={navLinkStyle(pathname === '/')}>Inicio</Link>
      <Link href="/chat" style={navLinkStyle(pathname.startsWith('/chat'))}>Chat</Link>
      <Link href="/profile" style={navLinkStyle(pathname.startsWith('/profile'))}>Mi perfil</Link>
    </nav>
  )
}
