"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, BellRing, Loader2, CheckCircle2, MessageCircle, Link2, Type } from "lucide-react";
import { settingsService } from "@/services/settingsService";
import { ClubSettings } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();
    const [settings, setSettings] = useState<ClubSettings>({ id_card_alert_days: 30, health_card_alert_days: 30 });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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
    }, [profile, profileLoading, router]);

    useEffect(() => {
        loadSettings();
    }, []);

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
                <h1 className="text-3xl font-extrabold text-foreground">Configuración</h1>
                <p className="text-muted-foreground">Ajustes del sistema y control de alertas.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-3xl border border-border/40 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/10">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                            <BellRing className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Alertas de Documentación</h2>
                            <p className="text-sm text-muted-foreground">Configura con cuántos días de anticipación deseas que el sistema te avise sobre el vencimiento de los documentos.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cédula */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">
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
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 text-lg font-medium pl-4 pr-16"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
                                        días
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Los jugadores con Cédula que venza en {settings.id_card_alert_days} días o menos aparecerán en el Dashboard como "Por vencer".
                            </p>
                        </div>

                        {/* Ficha Médica */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-foreground">
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
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 text-lg font-medium pl-4 pr-16"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
                                        días
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Los jugadores con Ficha Médica que venza en {settings.health_card_alert_days} días o menos aparecerán en el Dashboard como "Por vencer".
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-3 mb-6 pb-6 border-b border-border/10">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Notificaciones WhatsApp</h2>
                            <p className="text-sm text-muted-foreground">Personaliza los mensajes que se envían a los padres.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Send Form Link Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-border/20">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-border/10">
                                    <Link2 className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Enviar link de formulario</h3>
                                    <p className="text-xs text-muted-foreground">Incluye automáticamente el enlace de autogestión para que los padres suban los documentos.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.wa_send_form_link}
                                    onChange={(e) => setSettings({ ...settings, wa_send_form_link: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        {/* Custom Text Toggle */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-border/10">
                                    <Type className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Contenido del Mensaje</h3>
                                    <p className="text-xs text-muted-foreground">Elige si usar el texto predeterminado del sistema o uno propio.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, wa_custom_text_enabled: false })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${!settings.wa_custom_text_enabled ? 'border-secondary bg-secondary/5' : 'border-border/40 hover:border-border'}`}
                                >
                                    <p className="font-bold text-sm mb-1">Predeterminado</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black">Sistema</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, wa_custom_text_enabled: true })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${settings.wa_custom_text_enabled ? 'border-secondary bg-secondary/5' : 'border-border/40 hover:border-border'}`}
                                >
                                    <p className="font-bold text-sm mb-1">Personalizado</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black">Manual</p>
                                </button>
                            </div>

                            {/* Textarea is always visible now */}
                            <div className="animate-in slide-in-from-top-2 duration-300 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-300">
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
                                            ? 'bg-slate-50 dark:bg-white/5 border-border focus:ring-2 focus:ring-secondary/50 text-foreground dark:text-white'
                                            : 'bg-slate-100 dark:bg-white/10 border-transparent text-muted-foreground dark:text-slate-300 cursor-not-allowed italic'
                                        }`}
                                />
                                {settings.wa_custom_text_enabled && (
                                    <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <BellRing className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-blue-700 dark:text-slate-200 font-medium leading-relaxed">
                                            Variables disponibles: <span className="font-bold">$jugador</span>, <span className="font-bold">$documento</span>, <span className="font-bold">$estado</span>. El sistema las reemplazará automáticamente al enviar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/10 flex items-center justify-end gap-4">
                        {saved && (
                            <span className="text-green-600 dark:text-green-500 flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-right-4">
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
        </div>
    );
}
