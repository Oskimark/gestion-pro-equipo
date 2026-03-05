"use client";

import {
    Users,
    CreditCard,
    Calendar,
    Trophy,
    User
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import Image from "next/image";

import { useState, useEffect } from "react";
import { playerService } from "@/services/playerService";
import { matchService } from "@/services/matchService";
import { settingsService } from "@/services/settingsService";
import { Player, Match } from "@/types";

import { AlertTriangle, ChevronRight, Check, MessageCircle } from "lucide-react";
import { getDocStatus, generateWhatsAppLink } from "@/utils/playerUtils";
import Link from "next/link";

export default function DashboardPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [counts, setCounts] = useState({ players: 0, payments: 0, goals: 0 });
    const [nextMatch, setNextMatch] = useState<Match | null>(null);
    const [alerts, setAlerts] = useState<{ id: string; name: string; type: string; status: string; phone?: string; photo_url?: string; count: number; token?: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [players, matches, settings] = await Promise.all([
                playerService.getAll(),
                matchService.getAll(),
                settingsService.getSettings()
            ]);

            setCounts({
                players: players.length,
                payments: 8,
                goals: 12
            });

            // Calculate Alerts
            const docAlerts: { id: string; name: string; type: string; status: string; phone?: string; photo_url?: string; count: number; token?: string }[] = [];
            players.forEach(p => {
                const idStatus = getDocStatus(p.id_card_expiry, settings.id_card_alert_days, p.id_card_rev_status);
                const healthStatus = getDocStatus(p.health_card_expiry, settings.health_card_alert_days, p.health_card_rev_status);
                const phone = p.mother_phone || p.father_phone || p.referent_phone;

                if (idStatus.label !== 'Al día') {
                    docAlerts.push({
                        id: p.id,
                        name: p.full_name,
                        type: 'Cédula',
                        status: idStatus.label,
                        phone,
                        photo_url: p.photo_url,
                        count: p.id_card_notified_count || 0,
                        token: p.access_token
                    });
                }
                if (healthStatus.label !== 'Al día') {
                    docAlerts.push({
                        id: p.id,
                        name: p.full_name,
                        type: 'Ficha Médica',
                        status: healthStatus.label,
                        phone,
                        photo_url: p.photo_url,
                        count: p.health_card_notified_count || 0,
                        token: p.access_token
                    });
                }
            });
            setAlerts(docAlerts);

            const upcoming = matches.find(m => m.status === "Próximo");
            setNextMatch(upcoming || null);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppNotify = async (e: React.MouseEvent, docAlert: any) => {
        e.preventDefault();
        if (profile?.role === 'visitante') {
            alert("Como visitante no tienes permisos para enviar notificaciones.");
            return;
        }

        const baseUrl = window.location.origin;
        const settings = await settingsService.getSettings();

        let message = '';
        if (settings.wa_custom_text_enabled && settings.wa_custom_text) {
            message = settings.wa_custom_text
                .replace(/\$jugador/g, docAlert.name)
                .replace(/\$documento/g, docAlert.type)
                .replace(/\$estado/g, docAlert.status === 'Vencido' ? 'vencida' : 'faltante');
        } else {
            message = `Hola! Te escribimos de CLUB 33. Te avisamos que la ${docAlert.type} de ${docAlert.name} está ${docAlert.status === 'Vencido' ? 'vencida' : 'faltante'}.`;
        }

        if (settings.wa_send_form_link && docAlert.token) {
            message += `\n\nPuedes subirla tú mismo aquí: ${baseUrl}/public/docs/${docAlert.token}`;
        }

        try {
            // Increment in DB
            const field = docAlert.type === 'Cédula' ? 'id_card_notified_count' : 'health_card_notified_count';
            await playerService.update(docAlert.id, {
                [field]: (docAlert.count || 0) + 1
            });

            // Update local state
            setAlerts(prev => prev.map(a =>
                (a.id === docAlert.id && a.type === docAlert.type)
                    ? { ...a, count: (a.count || 0) + 1 }
                    : a
            ));

            // Open WhatsApp
            if (docAlert.phone) {
                const link = generateWhatsAppLink(docAlert.phone, message);
                if (link) {
                    window.open(link, '_blank');
                    return;
                }
            }
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        } catch (error) {
            console.error("Error updating notification count:", error);
        }
    };

    const stats = [
        { name: "Total Jugadores", value: counts.players.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100", href: "/dashboard/players" },
        { name: "Alertas Docs", value: alerts.length.toString(), icon: AlertTriangle, color: alerts.length > 0 ? "text-red-600" : "text-green-600", bg: alerts.length > 0 ? "bg-red-100" : "bg-green-100", href: "/dashboard/alerts" },
        {
            name: "Próximo Partido",
            value: nextMatch
                ? new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
                : "TBD",
            icon: Calendar,
            color: "text-green-600",
            bg: "bg-green-100",
            href: "/dashboard/matches"
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
                    {profile?.role === 'visitante' && ", visitante"}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    {profile?.role === 'visitante'
                        ? "Como visitante solo puedes ver algunos datos limitados. Contacta al administrador para ver los módulos de pagos, usuarios y configuración."
                        : "Aquí tienes un resumen rápido de la situación actual del equipo."}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const CardContent = (
                        <div className="bg-white  h-full p-6 rounded-3xl border border-border/40 hover:border-secondary/50 transition-all hover:translate-y-[-4px] group relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resumen</span>
                            </div>
                            <div className="mt-6">
                                <p className="text-small font-medium text-muted-foreground">{stat.name}</p>
                                <p className="text-3xl font-extrabold text-foreground  mt-1">{stat.value}</p>
                            </div>
                        </div>
                    );

                    return stat.href ? (
                        <Link key={stat.name} href={stat.href}>
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={stat.name}>
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Alerts Section */}
                <div className="bg-white  p-6 rounded-3xl border border-border/40 hover:border-red-400/40 transition-all group relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-red-600 ">
                            <AlertTriangle className="h-5 w-5" />
                            Alertas de Documentación
                        </h3>
                        {alerts.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase">Crítico</span>
                        )}
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2">
                        {alerts.length > 0 ? (
                            alerts.map((docAlert, idx) => (
                                <Link
                                    key={`${docAlert.id}-${idx}`}
                                    href={`/dashboard/players/detail/${docAlert.id}?tab=docs`}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50  border border-border/20 hover:border-red-500/30 transition-all group/item"
                                >
                                    <div className="flex items-center gap-3">
                                        {docAlert.photo_url ? (
                                            <Image
                                                src={docAlert.photo_url}
                                                alt={docAlert.name}
                                                width={40}
                                                height={40}
                                                className="h-10 w-10 rounded-full object-cover shrink-0 border border-border"
                                                priority={idx < 5}
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-slate-100  flex items-center justify-center border border-border text-slate-400 shrink-0">
                                                <User className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground">{docAlert.name}</span>
                                            <span className="text-[10px] text-muted-foreground  flex items-center gap-1">
                                                <span className="font-black uppercase tracking-tighter px-1 rounded bg-slate-100 ">{docAlert.type}</span>
                                                <span>•</span>
                                                <span className={docAlert.status === 'Vencido' ? 'text-red-500 font-bold' : docAlert.status === 'Por vencer' ? 'text-amber-500 font-bold' : 'text-red-400 font-bold'}>{docAlert.status}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 group/wa">
                                            {docAlert.count > 0 && (
                                                <div className="flex -space-x-1 animate-in zoom-in-50 duration-300">
                                                    {[...Array(docAlert.count)].map((_, i) => (
                                                        <span key={i} className="text-green-500 font-black text-xs drop-shadow-sm select-none">✓</span>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => handleWhatsAppNotify(e, docAlert)}
                                                className={`p-2 rounded-full transition-all flex items-center justify-center shrink-0 group/btn relative ${profile?.role === 'visitante'
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-green-100  hover:bg-green-200  text-green-700  hover:scale-105 active:scale-95'}`}
                                                title={profile?.role === 'visitante' ? 'Sin permisos' : `Avisar por WhatsApp (${docAlert.count} enviados)`}
                                            >
                                                <MessageCircle className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/item:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-8 text-center bg-slate-50/50  rounded-2xl border border-dashed border-border">
                                <Check className="h-8 w-8 text-green-500 mb-2 opacity-50" />
                                <p className="text-sm text-muted-foreground font-medium italic">Todo al día. No hay alertas pendientes.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Match Highlight */}
                <div className="bg-white  p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-secondary" />
                        Próximo Encuentro
                    </h3>
                    {nextMatch ? (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-border/20">
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-foreground ">vs {nextMatch.rival}</span>
                                <span className="text-sm text-muted-foreground ">
                                    {new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-xl text-primary">
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
                <div className="bg-white  p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden">
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
