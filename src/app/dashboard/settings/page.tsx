"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, BellRing, Loader2, CheckCircle2 } from "lucide-react";
import { settingsService } from "@/services/settingsService";
import { ClubSettings } from "@/types";

export default function SettingsPage() {
    const [settings, setSettings] = useState<ClubSettings>({ id_card_alert_days: 30, health_card_alert_days: 30 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

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
