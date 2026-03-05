"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { playerService } from "@/services/playerService";
import { settingsService } from "@/services/settingsService";
import { Player } from "@/types";
import {
    AlertTriangle,
    MessageCircle,
    ChevronRight,
    User,
    Search,
    Filter,
    CheckCircle2,
    Calendar,
    FileText,
    Shield
} from "lucide-react";
import { getDocStatus, generateWhatsAppLink } from "@/utils/playerUtils";
import Link from "next/link";

interface DocAlert {
    id: string;
    name: string;
    type: 'Cédula' | 'Ficha Médica';
    status: string;
    phone?: string;
    photo_url?: string;
    count: number;
    token?: string;
    expiryDate?: string;
}

export default function AlertsPage() {
    const { profile } = useProfile();
    const [alerts, setAlerts] = useState<DocAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<'all' | 'Cédula' | 'Ficha Médica'>('all');

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const [players, settings] = await Promise.all([
                playerService.getAll(),
                settingsService.getSettings()
            ]);

            const docAlerts: DocAlert[] = [];
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
                        token: p.access_token,
                        expiryDate: p.id_card_expiry
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
                        token: p.access_token,
                        expiryDate: p.health_card_expiry
                    });
                }
            });
            setAlerts(docAlerts);
        } catch (error) {
            console.error("Error loading alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppNotify = async (e: React.MouseEvent, docAlert: DocAlert) => {
        e.preventDefault();
        if (profile?.role === 'visitante') {
            alert("Como visitante no tienes permisos para enviar notificaciones.");
            return;
        }

        const baseUrl = window.location.origin;
        const settings = await settingsService.getSettings();

        let message = '';
        if (settings.wa_custom_text_enabled && settings.wa_custom_text) {
            message = settings.wa_custom_text;
        } else {
            message = `Hola! Te escribimos de CLUB 33. Te avisamos que la ${docAlert.type} de ${docAlert.name} está ${docAlert.status === 'Vencido' ? 'vencida' : 'faltante'}.`;
        }

        if (settings.wa_send_form_link && docAlert.token) {
            message += `\n\nPuedes subirla tú mismo aquí: ${baseUrl}/public/docs/${docAlert.token}`;
        }

        try {
            const field = docAlert.type === 'Cédula' ? 'id_card_notified_count' : 'health_card_notified_count';
            await playerService.update(docAlert.id, {
                [field]: (docAlert.count || 0) + 1
            });

            setAlerts(prev => prev.map(a =>
                (a.id === docAlert.id && a.type === docAlert.type)
                    ? { ...a, count: (a.count || 0) + 1 }
                    : a
            ));

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

    const filteredAlerts = alerts.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || a.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                        Centro de Alertas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona toda la documentación vencida o faltante de los jugadores.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-4 py-2 rounded-2xl bg-red-100 text-red-700 font-black text-sm uppercase">
                        {alerts.length} Pendientes
                    </span>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-[2rem] border border-border/40 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar jugador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-border/20 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-bold"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${typeFilter === 'all' ? 'bg-secondary text-primary shadow-lg shadow-secondary/20' : 'bg-slate-50 dark:bg-white/5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setTypeFilter('Cédula')}
                        className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${typeFilter === 'Cédula' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-white/5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                        <FileText className="h-4 w-4" />
                        Cédulas
                    </button>
                    <button
                        onClick={() => setTypeFilter('Ficha Médica')}
                        className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${typeFilter === 'Ficha Médica' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-50 dark:bg-white/5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                        <Shield className="h-4 w-4" />
                        Fichas Médicas
                    </button>
                </div>
            </div>

            {/* Alerts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-950 h-48 rounded-[2rem] border border-border/40 animate-pulse"></div>
                    ))
                ) : filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                        <div key={`${alert.id}-${alert.type}`} className="bg-white dark:bg-slate-950 p-6 rounded-[2.5rem] border border-border/40 hover:border-red-500/30 transition-all group relative overflow-hidden flex flex-col justify-between shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {alert.photo_url ? (
                                            <img src={alert.photo_url} alt={alert.name} className="h-14 w-14 rounded-2xl object-cover border-2 border-border" />
                                        ) : (
                                            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-border text-slate-400">
                                                <User className="h-8 w-8" />
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-white dark:border-slate-950 ${alert.type === 'Cédula' ? 'bg-blue-500' : 'bg-green-600'} text-white`}>
                                            {alert.type === 'Cédula' ? <FileText className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-foreground leading-tight">{alert.name}</h3>
                                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-tighter text-slate-500">
                                                {alert.type}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${alert.status === 'Vencido' ? 'bg-red-100 text-red-600' :
                                                alert.status === 'Por vencer' ? 'bg-amber-100 text-amber-600' :
                                                    alert.status === 'En revisión' ? 'bg-blue-100 text-blue-600' : 'bg-red-50 text-red-400'
                                                }`}>
                                                {alert.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex -space-x-1">
                                        {[...Array(alert.count)].map((_, i) => (
                                            <span key={i} className="text-green-500 font-black text-xs drop-shadow-sm">✓</span>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{alert.count} avisos</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-border/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-tight">Vencimiento:</span>
                                    </div>
                                    <span className="text-sm font-black text-foreground">{alert.expiryDate ? new Date(alert.expiryDate).toLocaleDateString('es-ES') : 'Faltante'}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => handleWhatsAppNotify(e, alert)}
                                        disabled={profile?.role === 'visitante'}
                                        className="flex-1 h-14 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 text-green-700 dark:text-green-500 rounded-2xl flex items-center justify-center gap-2 transition-all font-black uppercase text-xs tracking-widest disabled:opacity-50"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        Avisar
                                    </button>
                                    <Link
                                        href={`/dashboard/players/detail/${alert.id}?tab=docs`}
                                        className="w-14 h-14 bg-slate-100 dark:bg-white/5 hover:bg-secondary hover:text-primary rounded-2xl flex items-center justify-center transition-all"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white dark:bg-slate-950 rounded-[3rem] border border-dashed border-border flex flex-col items-center justify-center text-center">
                        <div className="p-6 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 mb-6 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">¡Todo al día!</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto font-medium">No se han encontrado alertas pendientes para los criterios seleccionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
