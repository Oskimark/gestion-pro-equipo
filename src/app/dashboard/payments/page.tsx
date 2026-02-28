"use client";

import { useState } from "react";
import {
    CreditCard,
    Search,
    Filter,
    Download,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    Loader2
} from "lucide-react";

import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Mock Data for Payments
const mockPayments = [
    { id: "1", player: "Juan Pérez", category: "Cuota Social", amount: 1500, status: "Pagado", due_date: "2026-02-10" },
    { id: "2", player: "Mateo García", category: "Indumentaria", amount: 4500, status: "Pendiente", due_date: "2026-02-15" },
    { id: "3", player: "Thiago Silva", category: "Cuota Social", amount: 1500, status: "Pagado", due_date: "2026-02-10" },
    { id: "4", player: "Lucas Martínez", category: "Recaudación", amount: 500, status: "Pendiente", due_date: "2026-02-28" },
    { id: "5", player: "Bautista Rodríguez", category: "Cuota Social", amount: 1500, status: "Pagado", due_date: "2026-02-10" },
];

export default function PaymentsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();
    const [filter, setFilter] = useState("Todos");

    useEffect(() => {
        if (!profileLoading && profile?.role === "visitante") {
            router.push("/dashboard");
        }
    }, [profile, profileLoading, router]);

    if (profileLoading || profile?.role === "visitante") {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                <p className="font-semibold text-lg">Verificando acceso...</p>
            </div>
        );
    }

    const totalPending = mockPayments
        .filter(p => p.status === "Pendiente")
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">Control de Pagos</h1>
                    <p className="text-muted-foreground">Seguimiento financiero y recaudación del equipo.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Reporte
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Registrar Pago
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Pendiente</p>
                    <p className="text-3xl font-extrabold text-red-500">${totalPending}</p>
                </div>
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Recaudación Mes</p>
                    <p className="text-3xl font-extrabold text-green-500">$5000</p>
                </div>
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Pagos al Día</p>
                    <p className="text-3xl font-extrabold text-accent">65%</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por jugador..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {["Todos", "Pagado", "Pendiente"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === s
                                ? "bg-secondary text-primary"
                                : "bg-white/50 dark:bg-white/5 text-muted-foreground hover:text-foreground border border-border/20"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-border/40 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/40 bg-slate-50/50 dark:bg-white/5">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Jugador</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoría</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Monto</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Vencimiento</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {mockPayments.filter(p => filter === "Todos" || p.status === filter).map((payment) => (
                                <tr key={payment.id} className="group hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                                        {payment.player}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {payment.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-foreground">
                                        ${payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {payment.due_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {payment.status === "Pagado" ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Pagado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    Pendiente
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
