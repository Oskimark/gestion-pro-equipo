import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-primary overflow-hidden relative">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img src="/images/stadium-bg.png" alt="stadium" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/80 to-primary"></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 group-hover:scale-110 transition-transform shadow-lg shadow-black/30">
            <img src="/images/33.png" alt="Logo 33" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Club <span className="text-secondary">33 Churrinches gen 2017</span>
          </span>
        </div>
        <Link href="/login" className="btn-secondary px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all">
          Acceder al Panel
        </Link>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <div className="p-1 px-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-6 animate-bounce-slow">
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-secondary">Temporada 2026</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.9] uppercase">
          La Excelencia <br />
          <span className="text-secondary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">En Tu Equipo</span>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-slate-300 max-w-2xl font-medium leading-relaxed">
          Gestión profesional de jugadores, indumentaria y finanzas diseñada para <span className="text-white font-bold">Churrinches gen 2017</span>.
        </p>

        <div className="mt-12">
          <Link href="/contact" className="btn-secondary px-8 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-secondary/20 hover:scale-110 active:scale-95 transition-all inline-block hover:bg-white hover:text-primary">
            Saber Más / Contacto
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-secondary/40 transition-all group relative overflow-hidden text-left border-l-4 border-l-secondary">
            <h3 className="text-xl font-bold mb-2 text-primary dark:text-white group-hover:text-secondary transition-colors">Gestión de Jugadores</h3>
            <p className="text-muted-foreground font-medium text-sm">Centraliza toda la información deportiva, médica y de contacto.</p>
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden text-left border-l-4 border-l-accent">
            <h3 className="text-xl font-bold mb-2 text-primary dark:text-white group-hover:text-accent transition-colors">Control de Pagos</h3>
            <p className="text-muted-foreground font-medium text-sm">Visualiza estados de cuenta con nuestro sistema de semáforos inteligente.</p>
          </div>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-white/40 transition-all group relative overflow-hidden text-left border-l-4 border-l-white/50">
            <h3 className="text-xl font-bold mb-2 text-primary dark:text-white transition-colors">Competición</h3>
            <p className="text-muted-foreground font-medium text-sm">Calendario de partidos, resultados y goleadores en un solo lugar.</p>
          </div>
        </div>
      </main>

      Desarrollado por OSKIMARK© 2026 Gestión Pro Equipo -v1.15 Potenciando el futuro del deporte.
    </div>
  );
}
