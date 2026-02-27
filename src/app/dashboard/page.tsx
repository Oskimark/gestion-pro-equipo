"use client";

import {
    Users,
    CreditCard,
    Calendar,
    Trophy
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

export default function DashboardPage() {
    const { profile, loading } = useProfile();

    const stats = [
        { name: "Total Jugadores", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { name: "Pagos Pendientes", value: "8", icon: CreditCard, color: "text-red-600", bg: "bg-red-100" },
        { name: "Próximo Partido", value: "Dom 15:00", icon: Calendar, color: "text-green-600", bg: "bg-green-100" },
        { name: "Goles del Mes", value: "12", icon: Trophy, color: "text-amber-600", bg: "bg-amber-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Bienvenido de nuevo, <span className="text-accent underline decoration-secondary decoration-4 underline-offset-4">
                        {loading ? "..." : (profile?.full_name || "Usuario")}
                    </span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Aquí tienes un resumen rápido de la situación actual del equipo.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-border/40 hover:border-secondary/50 transition-all hover:translate-y-[-4px] group relative overflow-hidden">
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
                        Últimos Resultados
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-border/20">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold py-1 px-2 bg-green-100 text-green-700 rounded-md">Victoria</span>
                                    <span className="font-semibold">vs Rival {i}</span>
                                </div>
                                <span className="font-mono font-bold text-lg">3 - 1</span>
                            </div>
                        ))}
                    </div>
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
