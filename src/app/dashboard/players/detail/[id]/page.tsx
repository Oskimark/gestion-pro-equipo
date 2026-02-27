"use client";

import { useState, useEffect, use } from "react";
import {
    ArrowLeft,
    User,
    Shield,
    Shirt,
    Phone,
    FileText,
    Save,
    Loader2,
    Edit2,
    X,
    Camera
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { playerService } from "@/services/playerService";
import { uploadService } from "@/services/uploadService";
import { Player } from "@/types";
import { Upload } from "lucide-react";

const tabs = [
    { id: "sports", name: "Deportivo", icon: Shield },
    { id: "gear", name: "Indumentaria", icon: Shirt },
    { id: "contact", name: "Contacto", icon: Phone },
    { id: "docs", name: "Documentos", icon: FileText },
];

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditingParam = searchParams.get("edit") === "true";

    const [activeTab, setActiveTab] = useState("sports");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(isEditingParam);
    const [player, setPlayer] = useState<Player | null>(null);
    const [formData, setFormData] = useState<Partial<Player>>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        loadPlayer();
    }, [resolvedParams.id]);

    useEffect(() => {
        setIsEditing(isEditingParam);
    }, [isEditingParam]);

    const loadPlayer = async () => {
        try {
            setLoading(true);
            const data = await playerService.getById(resolvedParams.id);
            setPlayer(data);
            setFormData(data);
        } catch (error) {
            console.error("Error loading player:", error);
            alert("Error al cargar los datos del jugador");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const updatedData = { ...formData };

            // Upload photo if exists
            if (photoFile) {
                const publicUrl = await uploadService.uploadFile(photoFile);
                updatedData.photo_url = publicUrl;

                // Optional: Delete old photo from storage if it was a supabase URL
                if (player?.photo_url) {
                    await uploadService.deleteFile(player.photo_url);
                }
            }

            // Clean data: remove empty strings or convert to null
            Object.keys(updatedData).forEach(key => {
                const k = key as keyof typeof updatedData;
                if (updatedData[k] === "") {
                    updatedData[k] = null as any; // Use null for updates to clear fields
                }
            });

            if (updatedData.shirt_number) {
                updatedData.shirt_number = parseInt(updatedData.shirt_number as any);
            }

            delete (updatedData as any).id;
            delete (updatedData as any).created_at;

            const updatedPlayer = await playerService.update(resolvedParams.id, updatedData as any);
            setPlayer(updatedPlayer);
            setFormData(updatedPlayer);
            setPhotoFile(null);
            setPhotoPreview(null);
            setIsEditing(false);
            router.replace(`/dashboard/players/detail/${resolvedParams.id}`);
        } catch (error: any) {
            console.error("Error updating player:", error);
            const detail = error?.message || error?.details || "Error desconocido";
            alert(`Error al guardar los cambios: ${detail}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                <p className="font-semibold text-lg">Cargando perfil...</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <User className="h-16 w-16 text-slate-300" />
                <p className="font-semibold text-xl">Jugador no encontrado</p>
                <Link href="/dashboard/players" className="btn-secondary">Volver al listado</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/players" className="p-2 rounded-full hover:bg-white dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all shadow-sm">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">
                            {isEditing ? "Editar Perfil" : "Perfil del Jugador"}
                        </h1>
                        <p className="text-sm text-muted-foreground">ID: {resolvedParams.id}</p>
                    </div>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Edit2 className="h-4 w-4" />
                        Editar Datos
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setFormData(player);
                            router.replace(`/dashboard/players/detail/${resolvedParams.id}`);
                        }}
                        className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-all"
                    >
                        <X className="h-6 w-6" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Summary */}
                <div className="lg:col-span-1">
                    <div className="glass-morphism rounded-3xl border border-border/40 p-10 text-center sticky top-8">
                        <div className="relative mx-auto w-32 h-32 mb-6">
                            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden group">
                                {photoPreview || formData.photo_url ? (
                                    <img src={photoPreview || formData.photo_url || ""} alt={formData.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-16 w-16 text-slate-300" />
                                )}
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="h-6 w-6 text-white mb-1" />
                                        <span className="text-[10px] font-bold text-white uppercase">Cambiar</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            {formData.shirt_number && (
                                <div className="absolute -bottom-1 -right-1 h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-extrabold text-primary border-4 border-white dark:border-slate-900 scale-in-center shadow-lg">
                                    {formData.shirt_number}
                                </div>
                            )}
                        </div>

                        {isEditing && photoPreview && (
                            <div className="mb-6 animate-in zoom-in-95 duration-300">
                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Nueva imagen lista</p>
                                <button
                                    type="button"
                                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase border border-red-200 rounded-full px-3 py-1 bg-red-50"
                                >
                                    Cancelar selección
                                </button>
                            </div>
                        )}

                        <h2 className="text-2xl font-extrabold text-foreground break-words leading-tight">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full text-center bg-transparent border-b border-accent focus:outline-none"
                                    placeholder="Nombre Completo"
                                />
                            ) : player.full_name}
                        </h2>
                        <p className="font-bold text-secondary uppercase tracking-widest text-xs mt-2">{formData.position}</p>

                        <div className="mt-8 pt-8 border-t border-border/20 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Dorsal</p>
                                <p className="text-xl font-black text-foreground">{formData.shirt_number || "-"}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Posición</p>
                                <p className="text-xl font-black text-foreground">{formData.position?.substring(0, 3).toUpperCase() || "-"}</p>
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
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id
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

                        <div className="p-8 flex-1 min-h-[500px]">
                            {activeTab === "sports" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border/20 pb-2">Información Deportiva</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nombre Completo</label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name || ""}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Número de Camiseta</label>
                                            <input
                                                type="number"
                                                name="shirt_number"
                                                value={formData.shirt_number || ""}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Posición Principal</label>
                                            <select
                                                name="position"
                                                value={formData.position || ""}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all font-medium"
                                            >
                                                <option>Portero</option>
                                                <option>Defensa</option>
                                                <option>Mediocampista</option>
                                                <option>Delantero</option>
                                                <option>Extremo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Fecha de Nacimiento</label>
                                            <input
                                                type="date"
                                                name="birth_date"
                                                value={formData.birth_date || ""}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "gear" && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border/20 pb-2">Indumentaria y Talles</h4>

                                    <div className="space-y-6">
                                        <p className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                                            Equipo de Verano
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Camiseta</label>
                                                <input type="text" name="shirt_size" value={formData.shirt_size || ""} onChange={handleChange} disabled={!isEditing} placeholder="Ej: M, 14..." className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Short</label>
                                                <input type="text" name="short_size" value={formData.short_size || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Medias</label>
                                                <input type="text" name="socks_size" value={formData.socks_size || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <p className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                                            Equipo de Invierno / Largo
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Camiseta Larga</label>
                                                <input type="text" name="long_jersey_size" value={formData.long_jersey_size || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pantalón Largo</label>
                                                <input type="text" name="long_shorts_size" value={formData.long_shorts_size || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Campera / Abrigo</label>
                                                <input type="text" name="jacket_size" value={formData.jacket_size || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Calzado / Zapatillas</label>
                                                <input type="text" name="shoe_size" value={formData.shoe_size || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "contact" && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border/20 pb-2">Información de Contactos</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        {/* Mother */}
                                        <div className="space-y-4">
                                            <p className="text-xs font-black text-secondary uppercase tracking-widest">Madre</p>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Nombre Completo</label>
                                                <input type="text" name="mother_name" value={formData.mother_name || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Teléfono</label>
                                                <input type="text" name="mother_phone" value={formData.mother_phone || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                        </div>

                                        {/* Father */}
                                        <div className="space-y-4">
                                            <p className="text-xs font-black text-secondary uppercase tracking-widest">Padre</p>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Nombre Completo</label>
                                                <input type="text" name="father_name" value={formData.father_name || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Teléfono</label>
                                                <input type="text" name="father_phone" value={formData.father_phone || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                            </div>
                                        </div>

                                        {/* Referent */}
                                        <div className="space-y-4 md:col-span-2 pt-4 border-t border-border/20">
                                            <p className="text-xs font-black text-secondary uppercase tracking-widest">Referente Opcional</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase">Nombre Completo</label>
                                                    <input type="text" name="referent_name" value={formData.referent_name || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase">Teléfono</label>
                                                    <input type="text" name="referent_phone" value={formData.referent_phone || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 pt-4 border-t border-border/20">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dirección de Residencia</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address || ""}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "docs" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border/20 pb-2">Documentos y Vencimientos</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* ID Card */}
                                        <div className="glass-morphism-sm p-5 rounded-2xl border border-border/20 space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-bold text-foreground">Cédula de Identidad</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Número de CI</label>
                                                    <input type="text" name="id_card_num" value={formData.id_card_num || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-white dark:bg-white/5 border border-border rounded-lg p-2 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Vencimiento CI</label>
                                                    <input type="date" name="id_card_expiry" value={formData.id_card_expiry || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-white dark:bg-white/5 border border-border rounded-lg p-2 text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Health Card / Ficha */}
                                        <div className="glass-morphism-sm p-5 rounded-2xl border border-border/20 space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                                    <Shield className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-bold text-foreground">Ficha de Salud / Carnet</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Empresa Salud / Seguro</label>
                                                    <input type="text" name="health_insurance" value={formData.health_insurance || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-white dark:bg-white/5 border border-border rounded-lg p-2 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Vencimiento Ficha</label>
                                                    <input type="date" name="health_card_expiry" value={formData.health_card_expiry || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-white dark:bg-white/5 border border-border rounded-lg p-2 text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Permissions */}
                                        <div className="glass-morphism-sm p-5 rounded-2xl border border-border/20 space-y-4 md:col-span-2">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                                                    <Edit2 className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-bold text-foreground">Permisos y Otros</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Detalle del Permiso</label>
                                                    <input type="text" name="permit_info" value={formData.permit_info || ""} onChange={handleChange} disabled={!isEditing} placeholder="Ej: Viaje, Competencia..." className="w-full bg-white dark:bg-white/5 border border-border rounded-lg p-2 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Vencimiento Permiso</label>
                                                    <input type="date" name="permit_expiry" value={formData.permit_expiry || ""} onChange={handleChange} disabled={!isEditing} className="w-full bg-white dark:bg-white/5 border border-border rounded-lg p-2 text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 pt-4">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Observaciones / Alergias</label>
                                            <textarea
                                                name="allergies"
                                                value={formData.allergies || ""}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                rows={3}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-70 transition-all font-medium resize-none shadow-inner"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="p-8 border-t border-border/40 bg-slate-50/30 dark:bg-black/10 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="btn-secondary"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    Guardar Cambios
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
