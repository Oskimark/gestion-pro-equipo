"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, BellRing, Loader2, CheckCircle2, MessageCircle, Link2, Type, Banknote, Clock, X, Trash2, Trash } from "lucide-react";
import { settingsService } from "@/services/settingsService";
import { ClubSettings, NotificationLog } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();
    const [settings, setSettings] = useState<ClubSettings>({
        id_card_alert_days: 30,
        health_card_alert_days: 30,
        monthly_fee: 1000,
        annual_fee: 10000,
        annual_discount_percent: 15,
        gear_price: 5000,
        cron_hour: '09:00',
        cron_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [logs, setLogs] = useState<NotificationLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            const { data, error } = await supabase
                .from('notification_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleDeleteLog = async (id: string) => {
        if (!confirm("¿Deseas eliminar este registro del historial?")) return;
        try {
            const { error } = await supabase.from('notification_logs').delete().eq('id', id);
            if (error) throw error;
            setLogs(logs.filter(log => log.id !== id));
        } catch (err) {
            console.error("Error deleting log:", err);
            alert("Error al eliminar el registro.");
        }
    };

    const handleDeleteAllLogs = async () => {
        if (!confirm("¿ESTÁS SEGURO? Se borrará TODO el historial de notificaciones permanentemente.")) return;
        try {
            const { error } = await supabase.from('notification_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            if (error) throw error;
            setLogs([]);
        } catch (err) {
            console.error("Error clearing logs:", err);
            alert("Error al vaciar el historial.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setSaved(false);
            const newSettings = await settingsService.updateSettings(settings);
            if (newSettings) setSettings(newSettings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Error al guardar la configuración.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!profileLoading && profile?.role === "visitante") {
            router.push("/dashboard");
        }
        loadSettings();
        fetchLogs();
    }, [profile, profileLoading, router]);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        const calculatedAnnual = Math.round(settings.monthly_fee * 12 * (1 - settings.annual_discount_percent / 100));
        if (calculatedAnnual !== settings.annual_fee) {
            setSettings(prev => ({ ...prev, annual_fee: calculatedAnnual }));
        }
    }, [settings.monthly_fee, settings.annual_discount_percent]);

    if (profileLoading || profile?.role === "visitante") {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                <p className="font-semibold text-lg">Verificando acceso...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center text-muted-foreground gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    <span>Cargando configuración...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground ">Configuración</h1>
                <p className="text-muted-foreground ">Ajustes del sistema y control de alertas.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white  p-6 md:p-8 rounded-3xl border border-border/40 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/10">
                        <div className="p-3 bg-amber-100  text-amber-600  rounded-xl">
                            <BellRing className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground ">Alertas de Documentación</h2>
                            <p className="text-sm text-muted-foreground ">Configura con cuántos días de anticipación deseas que el sistema te avise sobre el vencimiento de los documentos.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cédula */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground ">
                                Ventana de aviso para Cédula de Identidad
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        required
                                        value={settings.id_card_alert_days}
                                        onChange={(e) => setSettings({ ...settings, id_card_alert_days: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50  border border-border rounded-xl p-3 text-lg font-medium pl-4 pr-16 text-foreground "
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground  text-sm font-medium pointer-events-none">
                                        días
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground ">
                                Los jugadores con Cédula que venza en {settings.id_card_alert_days} días o menos aparecerán en el Dashboard como "Por vencer".
                            </p>
                        </div>

                        {/* Ficha Médica */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground ">
                                Ventana de aviso para Ficha Médica
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        required
                                        value={settings.health_card_alert_days}
                                        onChange={(e) => setSettings({ ...settings, health_card_alert_days: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50  border border-border rounded-xl p-3 text-lg font-medium pl-4 pr-16 text-foreground "
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground  text-sm font-medium pointer-events-none">
                                        días
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground ">
                                Los jugadores con Ficha Médica que venza en {settings.health_card_alert_days} días o menos aparecerán en el Dashboard como "Por vencer".
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-3 mb-6 pb-6 border-b border-border/10">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Banknote className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Pagos y Cuotas</h2>
                            <p className="text-sm text-muted-foreground">Define los valores de las cuotas sociales y el costo de la indumentaria.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">Cuota Mensual ($)</label>
                            <input
                                type="number"
                                required
                                value={settings.monthly_fee}
                                onChange={(e) => setSettings({ ...settings, monthly_fee: parseInt(e.target.value) })}
                                className="w-full bg-slate-50 border border-border rounded-xl p-3 text-lg font-medium text-foreground"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">Costo Indumentaria ($)</label>
                            <input
                                type="number"
                                required
                                value={settings.gear_price}
                                onChange={(e) => setSettings({ ...settings, gear_price: parseInt(e.target.value) })}
                                className="w-full bg-slate-50 border border-border rounded-xl p-3 text-lg font-medium text-foreground"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">Cuota Anual ($)</label>
                            <input
                                type="number"
                                required
                                value={settings.annual_fee}
                                onChange={(e) => setSettings({ ...settings, annual_fee: parseInt(e.target.value) })}
                                className="w-full bg-slate-50 border border-border rounded-xl p-3 text-lg font-medium text-foreground"
                            />
                            <p className="text-xs text-muted-foreground italic">Precio sugerido para pago único anual.</p>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">Descuento Pago Anual (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    value={settings.annual_discount_percent}
                                    onChange={(e) => setSettings({ ...settings, annual_discount_percent: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-border rounded-xl p-3 text-lg font-medium pr-12 text-foreground"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-3 mb-6 pb-6 border-b border-border/10">
                        <div className="p-3 bg-green-100  text-green-600  rounded-xl">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground ">Configuración de Mensajes WhatsApp</h2>
                            <p className="text-sm text-muted-foreground ">Gestiona el contenido de los avisos enviados por el sistema.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Send Form Link Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50  rounded-2xl border border-border/20">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white  rounded-lg shadow-sm border border-border/10">
                                    <Link2 className="h-5 w-5 text-muted-foreground " />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground ">Enviar link de formulario</h3>
                                    <p className="text-xs text-muted-foreground ">Incluye automáticamente el enlace de autogestión para que los padres suban los documentos.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.wa_send_form_link}
                                    onChange={(e) => setSettings({ ...settings, wa_send_form_link: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        {/* Custom Text Toggle */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-white  rounded-lg shadow-sm border border-border/10">
                                    <Type className="h-5 w-5 text-muted-foreground " />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground ">Mensajes MANUALES (Vía Botón)</h3>
                                    <p className="text-xs text-muted-foreground ">Personaliza el texto que se envía al presionar el botón de WhatsApp en la ficha del jugador.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, wa_custom_text_enabled: false })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${!settings.wa_custom_text_enabled ? 'border-secondary bg-secondary/5' : 'border-border/40 hover:border-border'}`}
                                >
                                    <p className="font-bold text-sm mb-1 ">Predeterminado</p>
                                    <p className="text-[10px] text-muted-foreground  uppercase font-black">Sistema</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, wa_custom_text_enabled: true })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${settings.wa_custom_text_enabled ? 'border-secondary bg-secondary/5' : 'border-border/40 hover:border-border'}`}
                                >
                                    <p className="font-bold text-sm mb-1 ">Personalizado</p>
                                    <p className="text-[10px] text-muted-foreground  uppercase font-black">Manual</p>
                                </button>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 mt-4">
                                <BellRing className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs text-amber-800 font-bold mb-1">Nota sobre Mensajes Automáticos</p>
                                    <p className="text-[10px] text-amber-700 leading-relaxed">
                                        El mensaje automático (Revisiones de sistema) no se puede cambiar desde aquí por requerimientos de Twilio.
                                        Contacte con el administrador para modificarlo.
                                        <br />
                                        <span className="font-mono mt-1 block italic bg-amber-100/50 p-1 rounded">
                                            "Hola! Te escribimos de CLUB 33. Te avisamos que la documentación de $jugador requiere atención: $documento ($estado). Puedes subir los documentos aquí: $enlace"
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Textarea is always visible now */}
                            <div className="animate-in slide-in-from-top-2 duration-300 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ">
                                    {settings.wa_custom_text_enabled ? 'Plantilla Editable' : 'Ejemplo de Mensaje Actual'}
                                </label>
                                <textarea
                                    value={settings.wa_custom_text_enabled
                                        ? settings.wa_custom_text
                                        : "Hola! Te escribimos de CLUB 33. Te avisamos que la Ficha Médica de GONZALO CAETANO DÍAZ está vencida."
                                    }
                                    onChange={(e) => {
                                        if (settings.wa_custom_text_enabled) {
                                            setSettings({ ...settings, wa_custom_text: e.target.value });
                                        }
                                    }}
                                    readOnly={!settings.wa_custom_text_enabled}
                                    placeholder={settings.wa_custom_text_enabled ? "Hola! Te escribimos de CLUB 33. Te avisamos que la $documento de $jugador está $estado." : ""}
                                    rows={4}
                                    className={`w-full border rounded-2xl p-4 text-sm font-medium outline-none transition-all ${settings.wa_custom_text_enabled
                                        ? 'bg-slate-50 border-border focus:ring-2 focus:ring-secondary/50 text-foreground'
                                        : 'bg-slate-100 border-transparent text-muted-foreground cursor-not-allowed italic'
                                        }`}
                                />
                                {settings.wa_custom_text_enabled && (
                                    <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50  rounded-xl border border-blue-100 ">
                                        <BellRing className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-blue-700  font-medium leading-relaxed">
                                            Variables disponibles: <span className="font-bold">$jugador</span>, <span className="font-bold">$documento</span>, <span className="font-bold">$estado</span>. El sistema las reemplazará automáticamente al enviar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Automation Section */}
                    <div className="mt-12 flex items-center gap-3 mb-6 pb-6 border-b border-border/10">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Automatización</h2>
                            <p className="text-sm text-muted-foreground">Gestiona la ejecución automática de alertas de vencimiento.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-border/20 space-y-6">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-border/10">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-foreground">Programación Semanal</h3>
                                    <p className="text-xs text-muted-foreground max-w-md">
                                        Define qué días y a qué hora (Uruguay) se ejecutará el envío automático de alertas.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-border/40 shadow-sm">
                                    <Clock className="h-5 w-5 text-indigo-500" />
                                    <input
                                        type="time"
                                        value={settings.cron_hour || '09:00'}
                                        onChange={(e) => setSettings({ ...settings, cron_hour: e.target.value })}
                                        className="font-bold text-lg bg-transparent outline-none text-foreground"
                                    />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-2 border-l">UY Time</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                    const dayNames: Record<string, string> = {
                                        Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié', Thursday: 'Jue',
                                        Friday: 'Vie', Saturday: 'Sáb', Sunday: 'Dom'
                                    };
                                    const isActive = settings.cron_days?.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => {
                                                const currentDays = settings.cron_days || [];
                                                const newDays = isActive
                                                    ? currentDays.filter(d => d !== day)
                                                    : [...currentDays, day];
                                                setSettings({ ...settings, cron_days: newDays });
                                            }}
                                            className={`py-3 rounded-xl font-bold text-xs transition-all border-2 ${isActive
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'bg-white border-border/40 text-muted-foreground hover:border-indigo-400'
                                                }`}
                                        >
                                            {dayNames[day]}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-sm italic">
                                    * La hora configurada es aproximada y depende del despachador de tareas de Vercel Cron.
                                </p>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!confirm("¿Deseas ejecutar la revisión de vencimientos manualmente ahora? Se enviarán mensajes a los jugadores correspondientes.")) return;
                                        try {
                                            setSaving(true);
                                            const res = await fetch('/api/cron/check-vencimientos?manual=true', {
                                                headers: {
                                                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'development_secret'}`
                                                }
                                            });

                                            if (res.status === 401) {
                                                alert("Error de Autorización (401): No se pudo verificar el CRON_SECRET. Revisa las variables de entorno NEXT_PUBLIC_CRON_SECRET.");
                                                return;
                                            }

                                            const data = await res.json();
                                            if (data.success) {
                                                alert(`Revisión completada.\nProcesados: ${data.processed}\nNotificaciones enviadas: ${data.notifications_sent}`);
                                                fetchLogs();
                                            } else {
                                                alert(`Error del Servidor: ${data.error}`);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert("Error al ejecutar la revisión manual.");
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={saving}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 shrink-0"
                                >
                                    <BellRing className="h-4 w-4" />
                                    Ejecutar Revisión Manual
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* WA Payment Notification Template */}
                    <div className="p-8 border-t border-border/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-foreground uppercase tracking-tighter italic text-lg">WhatsApp – Estado de Pago</h3>
                                <p className="text-xs text-muted-foreground font-medium">Plantilla del mensaje de notificación de estado de cuota a jugadores.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mensaje de Estado de Cuota</label>
                            <textarea
                                rows={3}
                                value={settings.wa_payment_text || ''}
                                onChange={(e) => setSettings({ ...settings, wa_payment_text: e.target.value })}
                                placeholder="Hola, te recordamos desde el club 33 que la cuota social de {nombre} esta {estado}. contacta con el administrador para conocer detalles. Gracias!"
                                className="w-full border border-border/40 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none bg-white "
                            />
                            <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <BellRing className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                                    Variables: <span className="font-bold">{"{nombre}"}</span> nombre del jugador, <span className="font-bold">{"{estado}"}</span> estado de cuota.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/10 flex items-center justify-end gap-4">
                        {saved && (
                            <span className="text-green-600  flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-right-4">
                                <CheckCircle2 className="h-4 w-4" />
                                Guardado correctamente
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md ${saving ? 'bg-secondary/70 cursor-not-allowed' : 'bg-secondary hover:bg-secondary/90 hover:shadow-lg hover:-translate-y-0.5'}`}
                        >
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Notification History Section */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-border/40 relative overflow-hidden mt-8">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Historial de Notificaciones</h2>
                            <p className="text-sm text-muted-foreground">Últimos mensajes enviados automáticamente por el sistema.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {logs.length > 0 && (
                            <button
                                onClick={handleDeleteAllLogs}
                                className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                title="Vaciar historial"
                            >
                                <Trash className="h-4 w-4" />
                                Borrar Todo
                            </button>
                        )}
                        <button
                            onClick={fetchLogs}
                            disabled={loadingLogs}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Actualizar historial"
                        >
                            <Loader2 className={`h-5 w-5 ${loadingLogs ? 'animate-spin' : ''} text-muted-foreground`} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/5">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jugador</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teléfono</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground italic">
                                        No hay registros de notificaciones aún.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 whitespace-nowrap">
                                            <span className="text-xs font-medium text-foreground">
                                                {new Date(log.created_at).toLocaleString("es-UY", {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs font-bold text-foreground block">
                                                {log.player_name || 'Desconocido'}
                                            </span>
                                            {log.variables?.["2"] && (
                                                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
                                                    {log.variables["2"]} ({log.variables["3"]})
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs font-medium text-slate-500">{log.phone}</span>
                                        </td>
                                        <td className="py-4">
                                            {log.status === 'sent' ? (
                                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Enviado
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 inline-flex items-center gap-1 w-fit">
                                                        <X className="h-3 w-3" /> Error
                                                    </span>
                                                    {log.error_message && (
                                                        <span className="text-[9px] text-red-500 max-w-[150px] truncate" title={log.error_message}>
                                                            {log.error_message}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Eliminar del historial"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
