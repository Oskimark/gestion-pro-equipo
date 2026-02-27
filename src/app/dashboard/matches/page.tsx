"use client";

import {
    Calendar,
    MapPin,
    Trophy,
    ChevronRight,
    Clock,
    Loader2,
    Edit2,
    Trash2,
    Plus
} from "lucide-react";
import Link from "next/link";

import { useState, useEffect } from "react";
import { matchService } from "@/services/matchService";
import { Match } from "@/types";

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            setLoading(true);
            const data = await matchService.getAll();
            setMatches(data);
        } catch (error) {
            console.error("Error loading matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, rival: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el partido vs ${rival}?`)) {
            try {
                await matchService.delete(id);
                setMatches(matches.filter(m => m.id !== id));
            } catch (error) {
                alert("Error al eliminar el partido");
            }
        }
    };

    const nextMatch = matches.find(m => m.status === "Próximo");
    const pastMatches = matches.filter(m => m.status === "Finalizado");

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">Partidos y Resultados</h1>
                    <p className="text-muted-foreground">Calendario de competición y estadísticas.</p>
                </div>
                <Link href="/dashboard/matches/new" className="btn-primary flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Cargar Partido
                </Link>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground bg-white dark:bg-slate-950 rounded-3xl border border-border/40">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                    <p className="font-medium">Cargando calendario...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {/* Next Match Highlight */}
                    {nextMatch && (
                        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-white shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Trophy className="h-40 w-40" />
                            </div>

                            <div className="relative z-10">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-secondary text-primary uppercase tracking-widest">Próximo Partido</span>
                                <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        <h2 className="text-4xl font-extrabold mb-2 text-white">vs {nextMatch.rival}</h2>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300">
                                            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(nextMatch.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {new Date(nextMatch.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} HS</span>
                                            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {nextMatch.venue || "Cancha a confirmar"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold">33</div>
                                            <span className="text-2xl font-bold text-secondary">VS</span>
                                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold text-slate-400">
                                                {nextMatch.rival.slice(0, 3).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Link href={`/dashboard/matches/edit/${nextMatch.id}`} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" title="Editar">
                                                <Edit2 className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calendar / List */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground">
                            {pastMatches.length > 0 ? "Historial Reciente" : "Próximos Encuentros"}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {matches.length === 0 ? (
                                <div className="p-12 text-center bg-white dark:bg-slate-950 rounded-3xl border border-border/40 border-dashed">
                                    <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-muted-foreground font-medium">No hay partidos programados en este momento.</p>
                                </div>
                            ) : (
                                matches.map((match) => (
                                    <div key={match.id} className={`p-4 sm:p-6 rounded-3xl border transition-all group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${match.status === "Finalizado"
                                            ? "bg-slate-50/50 dark:bg-white/[0.02] border-border/20 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                            : "bg-white dark:bg-slate-950 border-border/40 hover:border-secondary/40 shadow-sm"
                                        }`}>
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-border/20 shrink-0 ${match.status === "Finalizado" ? "bg-slate-100/50 dark:bg-white/5" : "bg-slate-100 dark:bg-white/5"
                                                }`}>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(match.date).toLocaleString('es', { month: 'short' })}</span>
                                                <span className="text-lg sm:text-xl font-extrabold text-foreground">{new Date(match.date).getDate()}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-accent transition-colors truncate">vs {match.rival}</h4>
                                                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    {match.venue}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-border/10">
                                            <div className="flex items-center gap-4">
                                                {match.status === "Finalizado" ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xl sm:text-2xl font-mono font-black text-foreground">
                                                            {match.score_home} - {match.score_away}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Resultado</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-accent/10 text-accent uppercase tracking-widest border border-accent/20 whitespace-nowrap">Pendiente</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link href={`/dashboard/matches/edit/${match.id}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-green-500 transition-colors" title="Editar">
                                                    <Edit2 className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(match.id, match.rival)}
                                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform hidden sm:block" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
