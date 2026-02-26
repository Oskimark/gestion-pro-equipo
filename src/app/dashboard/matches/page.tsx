"use client";

import {
    Calendar,
    MapPin,
    Trophy,
    ChevronRight,
    Clock,
    Plus
} from "lucide-react";

const matches = [
    { id: "1", rival: "Club Atlético Fénix", date: "2026-03-05", time: "16:00", venue: "Cancha Local", status: "Próximo" },
    { id: "2", rival: "Peñarol Baby", date: "2026-02-24", time: "15:30", venue: "Estadio Visitante", status: "Finalizado", score: "3 - 1" },
    { id: "3", rival: "Danubio Junior", date: "2026-02-18", time: "17:00", venue: "Cancha Local", status: "Finalizado", score: "2 - 2" },
];

export default function MatchesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">Partidos y Resultados</h1>
                    <p className="text-muted-foreground">Calendario de competición y estadísticas.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Cargar Partido
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Next Match Highlight */}
                <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Trophy className="h-40 w-40" />
                    </div>

                    <div className="relative z-10">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-secondary text-primary uppercase tracking-widest">Próximo Partido</span>
                        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl font-extrabold mb-2 text-white">vs Club Atlético Fénix</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300">
                                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> 5 de Marzo, 2026</span>
                                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 16:00 HS</span>
                                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Cancha Local</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold">PE</div>
                                <span className="text-2xl font-bold text-secondary">VS</span>
                                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold text-slate-400">CAF</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar / List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground">Historial Reciente</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {matches.map((match) => (
                            <div key={match.id} className="glass-morphism rounded-2xl p-6 border border-border/40 flex items-center justify-between group hover:border-secondary/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-slate-100 dark:bg-white/5 border border-border/20">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(match.date).toLocaleString('es', { month: 'short' })}</span>
                                        <span className="text-xl font-extrabold text-foreground">{new Date(match.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-lg text-foreground group-hover:text-accent transition-colors">vs {match.rival}</h4>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 min-w-0">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {match.venue}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    {match.status === "Finalizado" ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-mono font-black text-foreground">{match.score}</span>
                                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Victoria</span>
                                        </div>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-accent/10 text-accent uppercase tracking-widest border border-accent/20">Pendiente</span>
                                    )}
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
