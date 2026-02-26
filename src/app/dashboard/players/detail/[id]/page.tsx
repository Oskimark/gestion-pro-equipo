"use client";

import { useState, use } from "react";
import {
    ArrowLeft,
    User,
    Shield,
    Shirt,
    Phone,
    HeartPulse,
    Save
} from "lucide-react";
import Link from "next/link";

const tabs = [
    { id: "sports", name: "Deportivo", icon: Shield },
    { id: "gear", name: "Indumentaria", icon: Shirt },
    { id: "contact", name: "Contacto", icon: Phone },
    { id: "health", name: "Salud", icon: HeartPulse },
];

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [activeTab, setActiveTab] = useState("sports");

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/players" className="p-2 rounded-full hover:bg-white dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all shadow-sm">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">Perfil del Jugador</h1>
                    <p className="text-sm text-muted-foreground">ID: {resolvedParams.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary Card */}
                <div className="lg:col-span-1">
                    <div className="glass-morphism rounded-3xl border border-border/40 p-8 text-center sticky top-8">
                        <div className="relative mx-auto w-32 h-32 mb-6">
                            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden group">
                                <User className="h-16 w-16 text-slate-300" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-xs font-bold text-white uppercase">Cambiar</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-extrabold text-primary border-4 border-white dark:border-slate-900">
                                10
                            </div>
                        </div>

                        <h2 className="text-2xl font-extrabold text-foreground">Juan Pérez</h2>
                        <p className="font-bold text-secondary uppercase tracking-widest text-xs mt-1">Delantero</p>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-border/20 text-left">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Edad</p>
                                <p className="text-lg font-extrabold text-foreground">12 años</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-border/20 text-left">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Estado</p>
                                <p className="text-lg font-extrabold text-green-500">Activo</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Information Tabs */}
                <div className="lg:col-span-2">
                    <div className="glass-morphism rounded-3xl border border-border/40 overflow-hidden flex flex-col h-full">
                        <div className="flex border-b border-border/40 bg-slate-50/50 dark:bg-white/5 overflow-x-auto no-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id
                                        ? "text-accent"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-accent" : "text-muted-foreground"}`} />
                                    {tab.name}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-accent rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 flex-1">
                            {activeTab === "sports" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border/20 pb-2">Información Deportiva</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Número de Camiseta</label>
                                            <input type="number" defaultValue="10" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Posición Principal</label>
                                            <select defaultValue="Delantero" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium">
                                                <option>Portero</option>
                                                <option>Defensa</option>
                                                <option>Mediocampista</option>
                                                <option>Delantero</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Fecha de Nacimiento</label>
                                            <input type="date" defaultValue="2012-05-15" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "gear" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border/20 pb-2">Datos de Indumentaria</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Talle Camiseta</label>
                                            <input type="text" defaultValue="12" placeholder="Ej: 12, S, M" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Talle Short</label>
                                            <input type="text" defaultValue="12" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Talle Medias</label>
                                            <input type="text" defaultValue="34-36" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "contact" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border/20 pb-2">Información de Contacto</h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nombres de los Padres</label>
                                            <input type="text" defaultValue="Maria Garcia & Alberto Perez" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Teléfonos de Urgencia</label>
                                            <input type="text" defaultValue="099 123 456 / 098 765 432" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dirección</label>
                                            <input type="text" defaultValue="Calle Deportes 123, Montevideo" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "health" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border/20 pb-2">Ficha de Salud</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Carnet Deportista Vencimiento</label>
                                            <input type="date" defaultValue="2026-12-30" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mutualista / Seguro</label>
                                            <input type="text" defaultValue="CASMU" className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Alergias o Observaciones</label>
                                            <textarea rows={3} defaultValue="Ninguna alergia conocida." className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-border/40 bg-slate-50/30 dark:bg-black/10 flex justify-end">
                            <button className="btn-primary flex items-center gap-2">
                                <Save className="h-5 w-5" />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
