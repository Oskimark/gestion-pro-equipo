import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-primary text-white">
      {/* Background Graphic elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/30 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Placeholder for Escudo/Logo */}
        <div className="mb-12 transition-transform hover:scale-110 duration-500 cursor-pointer">
          <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl relative">
            {/* Escudo del club (Placeholder Image) */}
            <div className="text-4xl font-bold text-secondary">LOGO</div>
            <div className="absolute inset-0 rounded-full border-2 border-secondary animate-pulse opacity-50"></div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white drop-shadow-md">
          GESTIÓN <span className="text-secondary">PRO EQUIPO</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mb-12 font-medium">
          La plataforma definitiva para el control deportivo, administrativo y financiero de tu equipo.
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <Link href="/login" className="btn-primary flex items-center gap-2 group">
            Acceso Administración
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <button className="btn-secondary">
            Saber Más
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="glass-morphism p-6 rounded-2xl text-left border-l-4 border-secondary">
            <h3 className="text-xl font-bold mb-2">Gestión de Jugadores</h3>
            <p className="text-slate-400 text-sm">Centraliza toda la información deportiva, médica y de contacto.</p>
          </div>
          <div className="glass-morphism p-6 rounded-2xl text-left border-l-4 border-accent">
            <h3 className="text-xl font-bold mb-2">Control de Pagos</h3>
            <p className="text-slate-400 text-sm">Visualiza estados de cuenta con nuestro sistema de semáforos inteligente.</p>
          </div>
          <div className="glass-morphism p-6 rounded-2xl text-left border-l-4 border-white/50">
            <h3 className="text-xl font-bold mb-2">Competición</h3>
            <p className="text-slate-400 text-sm">Calendario de partidos, resultados y goleadores en un solo lugar.</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-auto py-8 text-slate-500 text-sm text-center">
        Desarrollado por OSKIMARK© 2026 Gestión Pro Equipo -v1.07 Potenciando el futuro del deporte.
      </footer>
    </div>
  );
}


