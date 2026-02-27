"use client";

import {
    Users,
    CreditCard,
    Calendar,
    Trophy
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

import { useState, useEffect } from "react";
import { playerService } from "@/services/playerService";
import { matchService } from "@/services/matchService";
import { Player, Match } from "@/types";

export default function DashboardPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [counts, setCounts] = useState({ players: 0, payments: 0, goals: 0 });
    const [nextMatch, setNextMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [players, matches] = await Promise.all([
                playerService.getAll(),
                matchService.getAll()
            ]);

            setCounts({
                players: players.length,
                payments: 8, // Placeholder for now until service is expanded
                goals: 12    // Placeholder
            });

            const upcoming = matches.find(m => m.status === "Próximo");
            setNextMatch(upcoming || null);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { name: "Total Jugadores", value: counts.players.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { name: "Pagos Pendientes", value: counts.payments.toString(), icon: CreditCard, color: "text-red-600", bg: "bg-red-100" },
        {
            name: "Próximo Partido",
            value: nextMatch
                ? new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
                : "TBD",
            icon: Calendar,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        { name: "Goles del Mes", value: counts.goals.toString(), icon: Trophy, color: "text-amber-600", bg: "bg-amber-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Bienvenido de nuevo, <span className="text-accent underline decoration-secondary decoration-4 underline-offset-4">
                        {profileLoading ? "..." : (profile?.full_name || "Usuario")}
                    </span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Aquí tienes un resumen rápido de la situación actual del equipo.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-secondary/50 transition-all hover:translate-y-[-4px] group relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resumen</span>
                        </div>
                        <div className="mt-6">
                            <p className="text-small font-medium text-muted-foreground">{stat.name}</p>
                            <p className="text-3xl font-extrabold text-foreground mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Placeholder for Recent Activity/Notices */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-secondary" />
                        Próximo Encuentro
                    </h3>
                    {nextMatch ? (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-border/20">
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-foreground">vs {nextMatch.rival}</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-xl text-primary dark:text-secondary">
                                    {new Date(nextMatch.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{nextMatch.venue}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground italic">
                            No hay partidos próximos programados.
                        </div>
                    )}
                </div>

                {/* Placeholder for Financial Summary */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-accent" />
                        Resumen de Cobros
                    </h3>
                    <div className="h-48 flex items-center justify-center border-2 border-dashed border-border rounded-xl text-muted-foreground font-medium italic">
                        Gráfico de recaudación mensual (Proximamente)
                    </div>
                </div>
            </div>
        </div>
    );
}
