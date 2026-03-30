import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-6 py-12 text-slate-800">
      <div className="mx-auto w-full max-w-6xl">
        <section className="rounded-3xl border border-sky-100 bg-white/90 p-8 shadow-sm md:p-12">
          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-sm font-medium text-sky-700">
            Runamasi · Servicios para el hogar
          </span>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Te conectamos con la persona que necesitas, cuando la necesitas.
          </h1>

          <p className="mt-5 max-w-3xl text-base text-slate-600 md:text-lg">
            Encuentra trabajadores confiables en tu zona para resolver problemas del hogar de forma rápida y simple.
            Describe lo que te pasa, elige tu distrito y recibe opciones recomendadas.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {['Electricistas', 'Gasfiteros', 'Carpinteros', 'Técnicos de línea blanca', 'Pintores', 'Cerrajeros'].map((service) => (
              <span key={service} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                {service}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
            >
              Buscar trabajadores
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-6 py-3 font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              Crear cuenta
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Coincidencias más precisas',
              description: 'Analizamos tu necesidad para mostrarte perfiles compatibles por servicio y ubicación.',
            },
            {
              title: 'Perfiles claros y útiles',
              description: 'Revisa descripción, teléfono, reseñas y experiencia antes de contactar.',
            },
            {
              title: 'Todo desde una sola plataforma',
              description: 'Navega entre buscador, tu perfil y perfiles públicos sin perder tu contexto.',
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
