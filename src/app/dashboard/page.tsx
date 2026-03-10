"use client";

import {
    Users,
    CreditCard,
    Calendar,
    Trophy,
    User,
    Loader2
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import Image from "next/image";

import { useState, useEffect } from "react";
import { playerService } from "@/services/playerService";
import { matchService } from "@/services/matchService";
import { settingsService } from "@/services/settingsService";
import { Player, Match, MatchResponse } from "@/types";

import { AlertTriangle, ChevronRight, Check, MessageCircle } from "lucide-react";
import { getDocStatus, generateWhatsAppLink } from "@/utils/playerUtils";
import Link from "next/link";

export default function DashboardPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [players, setPlayers] = useState<Player[]>([]);
    const [counts, setCounts] = useState({ players: 0, enabled: 0, available: 0, payments: 0, goals: 0 });
    const [nextMatch, setNextMatch] = useState<Match | null>(null);
    const [matchResponses, setMatchResponses] = useState<MatchResponse[]>([]);
    const [alerts, setAlerts] = useState<{ id: string; name: string; type: string; status: string; phone?: string; photo_url?: string; count: number; token?: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLaunching, setIsLaunching] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [playersData, matches, settings] = await Promise.all([
                playerService.getAll(),
                matchService.getAll(),
                settingsService.getSettings()
            ]);

            setPlayers(playersData);

            const upcoming = matches.find(m => m.status === "Próximo");
            setNextMatch(upcoming || null);

            let responses: MatchResponse[] = [];
            if (upcoming) {
                responses = await matchService.getMatchResponses(upcoming.id);
                setMatchResponses(responses);
            }

            // Calculate Enabled Players
            const enabledCount = playersData.filter(p => {
                const idStatus = getDocStatus(p.id_card_expiry, settings.id_card_alert_days, p.id_card_rev_status);
                const healthStatus = getDocStatus(p.health_card_expiry, settings.health_card_alert_days, p.health_card_rev_status);
                return idStatus.label === 'Al día' && healthStatus.label === 'Al día';
            }).length;

            // Calculate Available (Those who confirmed attendance)
            const availableCount = responses.filter(r => r.status === 'asiste').length;

            setCounts({
                players: playersData.length,
                enabled: enabledCount,
                available: availableCount,
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

    const calculateAge = (birthDate?: string): string => {
        if (!birthDate) return "N/A";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age.toString();
    };

    const printGoodFaithList = async (e: React.MouseEvent, type: 'habilitados' | 'disponibles' = 'habilitados') => {
        e.preventDefault();
        e.stopPropagation();

        const settings = await settingsService.getSettings();
        const playersToPrint = players.filter(p => {
            const idStatus = getDocStatus(p.id_card_expiry, settings.id_card_alert_days, p.id_card_rev_status);
            const healthStatus = getDocStatus(p.health_card_expiry, settings.health_card_alert_days, p.health_card_rev_status);
            const isEnabled = idStatus.label === 'Al día' && healthStatus.label === 'Al día';

            if (type === 'disponibles') {
                const response = matchResponses.find(r => r.player_id === p.id);
                return isEnabled && response?.status === 'asiste';
            }
            return isEnabled;
        }).sort((a, b) => (a.shirt_number || 99) - (b.shirt_number || 99));

        const rows = playersToPrint.map((p, i) => {
            const age = calculateAge(p.birth_date);
            const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
            return `
                <tr style="background:${bg}">
                    <td style="padding:10px;border:1px solid #e2e8f0;font-weight:700;text-align:center">${p.shirt_number || '-'}</td>
                    <td style="padding:10px;border:1px solid #e2e8f0">${p.full_name}</td>
                    <td style="padding:10px;border:1px solid #e2e8f0">${p.position || '-'}</td>
                    <td style="padding:10px;border:1px solid #e2e8f0;text-align:center">${age}</td>
                </tr>`;
        }).join('');

        const html = `
            <html>
            <head>
                <title>Lista de Buena Fe (${type}) - Club 33</title>
                <style>
                    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 50px; color: #1e293b; background: white; }
                    .header { border-bottom: 5px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                    h1 { text-transform: uppercase; letter-spacing: -1px; margin: 0; font-weight: 900; font-size: 32px; font-style: italic; }
                    .subtitle { color: #64748b; font-size: 14px; font-weight: 600; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #1e293b; color: white; text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
                    td { font-size: 14px; border: 1px solid #e2e8f0; }
                    .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    @media print { .no-print { display: none; } body { padding: 20px; } }
                    .btn-print { padding: 12px 24px; background: #1e293b; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; transition: all 0.2s; }
                    .btn-print:hover { background: #334155; transform: translateY(-2px); }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>Lista de Buena Fe</h1>
                        <div class="subtitle">CLUB 33 – Temporada 2026 – ${type.toUpperCase()}</div>
                    </div>
                    <div style="text-align: right">
                        <div class="subtitle">Emisión: ${new Date().toLocaleDateString('es-UY')}</div>
                        <div class="subtitle">Total: ${playersToPrint.length}</div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:60px;text-align:center">Dorsal</th>
                            <th>Nombre del Jugador</th>
                            <th>Posición</th>
                            <th style="width:60px;text-align:center">Edad</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <div class="footer">
                    Documento generado automáticamente por Sistema de Gestión Club 33.
                </div>
                <div style="margin-top:40px; display: flex; justify-content: center;" class="no-print">
                    <button onclick="window.print()" class="btn-print">Imprimir Documento</button>
                </div>
            </body>
            </html>`;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(html);
            win.document.close();
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

    const handleStartConvocatoria = async () => {
        if (!nextMatch) return;
        if (!confirm(`¿Estás seguro de iniciar la convocatoria para el partido vs ${nextMatch.rival}? Se enviarán enlaces de confirmación.`)) return;

        try {
            setIsLaunching(true);
            const settings = await settingsService.getSettings();

            // 1. Filter enabled players
            const enabledPlayers = players.filter(p => {
                const idStatus = getDocStatus(p.id_card_expiry, settings.id_card_alert_days, p.id_card_rev_status);
                const healthStatus = getDocStatus(p.health_card_expiry, settings.health_card_alert_days, p.health_card_rev_status);
                return idStatus.label === 'Al día' && healthStatus.label === 'Al día';
            });

            // 2. Initialize responses in DB
            await matchService.initializeMatchResponses(nextMatch.id, enabledPlayers.map(p => p.id));

            // 3. Generate batch message logic (Simulated for now, would open WhatsApp for each or use API)
            alert(`Convocatoria iniciada para ${enabledPlayers.length} jugadores. En una versión real, esto dispararía notificaciones automáticas vía Twilio/WhatsApp.`);

            // Reload to show current status
            loadDashboardData();
        } catch (error) {
            console.error("Error starting convocatoria:", error);
            alert("Error al iniciar la convocatoria.");
        } finally {
            setIsLaunching(false);
        }
    };

    const stats = [
        {
            name: "Total Jugadores",
            value: `${counts.players} / ${counts.enabled}`,
            icon: Users,
            color: counts.enabled === counts.players ? "text-blue-600" : "text-red-600",
            bg: counts.enabled === counts.players ? "bg-blue-100" : "bg-red-100",
            href: "/dashboard/players"
        },
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
                                <div className="flex items-baseline gap-2 mt-1">
                                    {stat.name === "Total Jugadores" ? (
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-3xl font-extrabold text-foreground">{counts.players}</p>
                                            <span className="text-xl text-muted-foreground font-light">/</span>
                                            <button
                                                onClick={printGoodFaithList}
                                                className={`text-3xl font-extrabold transition-all hover:scale-110 active:scale-95 ${stat.color} hover:underline cursor-pointer`}
                                                title="Imprimir Lista de Buena Fe"
                                            >
                                                {counts.enabled}
                                            </button>
                                            <span className="ml-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Habilitados</span>
                                        </div>
                                    ) : (
                                        <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                                    )}
                                </div>
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
                        <div className="space-y-4">
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

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={(e) => printGoodFaithList(e, 'habilitados')}
                                    className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-100 flex flex-col items-center justify-center hover:bg-blue-100 transition-all group/btn cursor-pointer"
                                    title="Imprimir Lista de Buena Fe (Habilitados)"
                                >
                                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest group-hover/btn:scale-105 transition-transform">Habilitados</span>
                                    <span className="text-2xl font-black text-blue-700">{counts.enabled}</span>
                                </button>
                                <button
                                    onClick={(e) => printGoodFaithList(e, 'disponibles')}
                                    className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex flex-col items-center justify-center hover:bg-indigo-100 transition-all group/btn cursor-pointer"
                                    title="Imprimir Lista de Buena Fe (Disponibles)"
                                >
                                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest group-hover/btn:scale-105 transition-transform">Disponibles</span>
                                    <span className="text-2xl font-black text-indigo-700">{counts.available || counts.enabled}</span>
                                </button>
                            </div>

                            {!isVisitor && (
                                <button
                                    onClick={handleStartConvocatoria}
                                    disabled={isLaunching}
                                    className="w-full mt-4 btn-primary py-3 flex items-center justify-center gap-2 group/conv"
                                >
                                    {isLaunching ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <MessageCircle className="h-5 w-5 group-hover/conv:scale-110 transition-transform" />
                                    )}
                                    Iniciar Convocatoria
                                </button>
                            )}
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
