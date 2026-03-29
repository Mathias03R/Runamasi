import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <span className="mb-4 rounded-full border border-white/20 px-4 py-1 text-sm text-slate-200">
          Runamasi · Hackathon Build
        </span>

        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          Encuentra al trabajador ideal para resolver problemas de tu hogar
        </h1>

        <p className="mt-6 max-w-2xl text-base text-slate-300 md:text-lg">
          Describe lo que necesitas, selecciona tu distrito de Lima y te mostraremos los mejores perfiles
          según servicio, cercanía y rating.
        </p>

        <div className="mt-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
          <p className="mb-3 text-sm text-slate-300">¿Listo para empezar?</p>
          <Link
            href="/chat"
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Ir al buscador
          </Link>
        </div>
      </div>
    </main>
  )
}
