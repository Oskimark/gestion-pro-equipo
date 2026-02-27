"use client";

import { useState } from "react";
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
    Camera,
    X,
    Upload
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { playerService } from "@/services/playerService";
import { uploadService } from "@/services/uploadService";
import { Player } from "@/types";

const tabs = [
    { id: "sports", name: "Deportivo", icon: Shield },
    { id: "gear", name: "Indumentaria", icon: Shirt },
    { id: "contact", name: "Contacto", icon: Phone },
    { id: "docs", name: "Documentos", icon: FileText },
];

export default function NewPlayerPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("sports");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Player>>({
        full_name: "",
        position: "Delantero",
        shirt_number: undefined,
        birth_date: "",
        shirt_size: "",
        short_size: "",
        socks_size: "",
        long_jersey_size: "",
        long_shorts_size: "",
        jacket_size: "",
        shoe_size: "",
        mother_name: "",
        mother_phone: "",
        father_name: "",
        father_phone: "",
        referent_name: "",
        referent_phone: "",
        address: "",
        id_card_num: "",
        id_card_expiry: "",
        health_card_expiry: "",
        permit_info: "",
        permit_expiry: "",
        health_insurance: "",
        allergies: "",
        photo_url: ""
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.full_name) {
            alert("El nombre completo es obligatorio");
            setActiveTab("sports");
            return;
        }

        try {
            setLoading(true);
            const dataToSave = { ...formData };

            // Upload photo if exists
            if (photoFile) {
                const publicUrl = await uploadService.uploadFile(photoFile);
                dataToSave.photo_url = publicUrl;
            }

            // Clean data: remove empty strings or convert to null
            Object.keys(dataToSave).forEach(key => {
                const k = key as keyof typeof dataToSave;
                if (dataToSave[k] === "") {
                    delete dataToSave[k];
                }
            });

            if (dataToSave.shirt_number) {
                dataToSave.shirt_number = parseInt(dataToSave.shirt_number as any);
            }

            await playerService.create(dataToSave as any);
            router.push("/dashboard/players");
        } catch (error: any) {
            console.error("Error creating player:", error);
            const detail = error?.message || error?.details || "Error desconocido";
            alert(`Error al crear el jugador: ${detail}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/players" className="p-2 rounded-full hover:bg-white dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all shadow-sm">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">Nuevo Jugador</h1>
                    <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">v1.04 • Perfil Enriquecido</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tabs Selection */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass-morphism rounded-3xl border border-border/40 p-4 sticky top-8">
                        <p className="px-4 pt-2 pb-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border/10 mb-4">Secciones del Formulario</p>
                        <div className="flex flex-col gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? "bg-secondary text-primary shadow-md scale-[1.02]"
                                        : "text-muted-foreground hover:bg-white dark:hover:bg-white/5"
                                        }`}
                                >
                                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
                                    {tab.name}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                            <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-2">Consejo Deportista</p>
                            <p className="text-xs text-orange-800 dark:text-orange-200">Asegúrate de cargar los vencimientos de documentos para recibir alertas.</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="lg:col-span-2">
                    <div className="glass-morphism rounded-3xl border border-border/40 min-h-[500px] flex flex-col shadow-xl">
                        <div className="p-8 flex-1">
                            {activeTab === "sports" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-xl font-extrabold text-foreground mb-6">Información Básica</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nombre Completo *</label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                                placeholder="Ej: Juan Manuel Pérez..."
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Foto de Perfil</label>
                                            <div className="flex items-center gap-6">
                                                <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border-2 border-dashed border-border flex items-center justify-center shrink-0">
                                                    {photoPreview ? (
                                                        <>
                                                            <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={removePhoto}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <Camera className="h-8 w-8 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="relative cursor-pointer bg-white dark:bg-white/5 border border-border rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group">
                                                        <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                                            <Upload className="h-4 w-4" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-foreground">Seleccionar Imagen</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tight">JPG, PNG o WEBP (Máx 2MB)</p>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Número de Camiseta (Dorsal)</label>
                                            <input
                                                type="number"
                                                name="shirt_number"
                                                value={formData.shirt_number || ""}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                                placeholder="Ej: 10"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Posición Principal</label>
                                            <select
                                                name="position"
                                                value={formData.position}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
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
                                                value={formData.birth_date}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "gear" && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <h3 className="text-xl font-extrabold text-foreground mb-6">Indumentaria y Talles</h3>

                                    <div className="space-y-6">
                                        <p className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                                            Equipo de Verano
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Camiseta</label>
                                                <input type="text" name="shirt_size" value={formData.shirt_size} onChange={handleChange} placeholder="Ej: M, 14..." className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Short</label>
                                                <input type="text" name="short_size" value={formData.short_size} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Medias</label>
                                                <input type="text" name="socks_size" value={formData.socks_size} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
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
                                                <input type="text" name="long_jersey_size" value={formData.long_jersey_size} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pantalón Largo</label>
                                                <input type="text" name="long_shorts_size" value={formData.long_shorts_size} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Campera / Abrigo</label>
                                                <input type="text" name="jacket_size" value={formData.jacket_size} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Calzado / Zapatillas</label>
                                                <input type="text" name="shoe_size" value={formData.shoe_size} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "contact" && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <h3 className="text-xl font-extrabold text-foreground mb-6">Información de Contacto</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        {/* Mother */}
                                        <div className="space-y-4">
                                            <p className="text-xs font-black text-secondary uppercase tracking-widest">Madre</p>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Nombre Completo</label>
                                                <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Teléfono</label>
                                                <input type="text" name="mother_phone" value={formData.mother_phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                        </div>

                                        {/* Father */}
                                        <div className="space-y-4">
                                            <p className="text-xs font-black text-secondary uppercase tracking-widest">Padre</p>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Nombre Completo</label>
                                                <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Teléfono</label>
                                                <input type="text" name="father_phone" value={formData.father_phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                            </div>
                                        </div>

                                        {/* Referent */}
                                        <div className="space-y-4 md:col-span-2 pt-4 border-t border-border/20">
                                            <p className="text-xs font-black text-secondary uppercase tracking-widest">Referente Opcional</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase">Nombre Completo</label>
                                                    <input type="text" name="referent_name" value={formData.referent_name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase">Teléfono</label>
                                                    <input type="text" name="referent_phone" value={formData.referent_phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 pt-4 border-t border-border/20">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dirección de Residencia</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "docs" && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-xl font-extrabold text-foreground mb-6">Documentos y Vencimientos</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* ID Card */}
                                        <div className="glass-morphism-sm p-6 rounded-3xl border border-border/20 space-y-4 bg-white/30 dark:bg-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shadow-sm">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <p className="font-extrabold text-foreground">Cédula Identidad</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Número de CI</label>
                                                    <input type="text" name="id_card_num" value={formData.id_card_num} onChange={handleChange} className="w-full bg-white dark:bg-white/5 border border-border rounded-xl p-2.5 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Vencimiento CI</label>
                                                    <input type="date" name="id_card_expiry" value={formData.id_card_expiry} onChange={handleChange} className="w-full bg-white dark:bg-white/5 border border-border rounded-xl p-2.5 text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Health Card / Ficha */}
                                        <div className="glass-morphism-sm p-6 rounded-3xl border border-border/20 space-y-4 bg-white/30 dark:bg-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shadow-sm">
                                                    <Shield className="h-5 w-5" />
                                                </div>
                                                <p className="font-extrabold text-foreground">Ficha de Salud</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Empresa Salud / Seguro</label>
                                                    <input type="text" name="health_insurance" value={formData.health_insurance} onChange={handleChange} className="w-full bg-white dark:bg-white/5 border border-border rounded-xl p-2.5 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Vencimiento Ficha</label>
                                                    <input type="date" name="health_card_expiry" value={formData.health_card_expiry} onChange={handleChange} className="w-full bg-white dark:bg-white/5 border border-border rounded-xl p-2.5 text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Permissions */}
                                        <div className="glass-morphism-sm p-6 rounded-3xl border border-border/20 space-y-4 md:col-span-2 bg-white/30 dark:bg-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 shadow-sm">
                                                    <Edit2 className="h-5 w-5" />
                                                </div>
                                                <p className="font-extrabold text-foreground">Permisos / Otros</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Detalle del Permiso</label>
                                                    <input type="text" name="permit_info" value={formData.permit_info} onChange={handleChange} placeholder="Ej: Viaje, Competencia..." className="w-full bg-white dark:bg-white/5 border border-border rounded-xl p-2.5 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Vencimiento Permiso</label>
                                                    <input type="date" name="permit_expiry" value={formData.permit_expiry} onChange={handleChange} className="w-full bg-white dark:bg-white/5 border border-border rounded-xl p-2.5 text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 pt-4">
                                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Observaciones / Alergias</label>
                                            <textarea
                                                name="allergies"
                                                value={formData.allergies}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium resize-none shadow-inner"
                                                placeholder="Información médica relevante..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-border/40 bg-slate-50/30 dark:bg-black/10 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center gap-2 min-w-[200px] justify-center shadow-lg"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Registrar Jugador
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
