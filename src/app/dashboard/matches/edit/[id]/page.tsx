"use client";

import { useState, useEffect, use } from "react";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Trophy,
    Save,
    Loader2,
    Clock,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { matchService } from "@/services/matchService";
import { Match } from "@/types";

interface EditMatchPageProps {
    params: Promise<{ id: string }>;
}

export default function EditMatchPage({ params }: EditMatchPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        rival: "",
        date: "",
        time: "",
        venue: "",
        status: "Próximo" as Match['status'],
        score_home: 0 as number,
        score_away: 0 as number
    });

    useEffect(() => {
        loadMatch();
    }, [id]);

    const loadMatch = async () => {
        try {
            setLoading(true);
            const match = await matchService.getById(id);
            if (match) {
                const dt = new Date(match.date);

                // Extract local date and time components
                const year = dt.getFullYear();
                const month = String(dt.getMonth() + 1).padStart(2, '0');
                const day = String(dt.getDate()).padStart(2, '0');
                const hours = String(dt.getHours()).padStart(2, '0');
                const minutes = String(dt.getMinutes()).padStart(2, '0');

                setFormData({
                    rival: match.rival,
                    date: `${year}-${month}-${day}`,
                    time: `${hours}:${minutes}`,
                    venue: match.venue || "",
                    status: match.status,
                    score_home: match.score_home || 0,
                    score_away: match.score_away || 0
                });
            }
        } catch (error) {
            console.error("Error loading match:", error);
            alert("No se pudo cargar la información del partido.");
            router.push("/dashboard/matches");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const localDate = new Date(`${formData.date}T${formData.time}:00`);
            const matchDateTime = localDate.toISOString();

            const dataToUpdate = {
                rival: formData.rival,
                date: matchDateTime,
                venue: formData.venue,
                status: formData.status,
                score_home: formData.status === "Finalizado" ? formData.score_home : null,
                score_away: formData.status === "Finalizado" ? formData.score_away : null
            };

            await matchService.update(id, dataToUpdate as any);
            router.push("/dashboard/matches");
        } catch (error: any) {
            console.error("Error updating match:", error);
            alert(`Error al actualizar el partido: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("¿Estás seguro de que deseas eliminar este partido permanentemente?")) {
            try {
                setSaving(true);
                await matchService.delete(id);
                router.push("/dashboard/matches");
            } catch (error: any) {
                alert("Error al eliminar el partido");
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                <p className="font-extrabold text-xl animate-pulse">Cargando detalles del partido...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/matches" className="p-2 rounded-full hover:bg-white dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all shadow-sm">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground">Editar Partido</h1>
                        <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">vs {formData.rival}</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-3 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 transition-all flex items-center gap-2 font-bold shadow-sm"
                >
                    <Trash2 className="h-5 w-5" />
                    <span className="hidden sm:inline">Eliminar</span>
                </button>
            </div>

            <div className="max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 rounded-3xl border border-border/40 shadow-xl overflow-hidden group hover:border-accent/30 transition-all">
                    <div className="p-8 space-y-8">
                        {/* Section: Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-secondary" />
                                Detalles del Encuentro
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Rival *</label>
                                    <input
                                        type="text"
                                        name="rival"
                                        value={formData.rival}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Fecha *</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Hora</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Lugar / Sede</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="venue"
                                            value={formData.venue}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Estado</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange as any}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-medium"
                                    >
                                        <option value="Próximo">Próximo</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section: Score (Conditional) */}
                        {formData.status === "Finalizado" && (
                            <div className="space-y-6 pt-6 border-t border-border/20 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-500" />
                                    Resultado Final
                                </h3>
                                <div className="flex items-center gap-8 justify-center bg-slate-50 dark:bg-white/5 p-8 rounded-2xl border border-border/20">
                                    <div className="text-center space-y-3">
                                        <p className="text-xs font-black uppercase text-muted-foreground">MARCADOR 33</p>
                                        <input
                                            type="number"
                                            name="score_home"
                                            value={formData.score_home}
                                            onChange={handleChange}
                                            className="w-20 h-20 text-4xl font-black text-center bg-white dark:bg-slate-900 border-2 border-primary rounded-2xl focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="text-3xl font-black text-muted-foreground opacity-30 mt-6 select-none">VS</div>
                                    <div className="text-center space-y-3">
                                        <p className="text-xs font-black uppercase text-muted-foreground">RIVAL</p>
                                        <input
                                            type="number"
                                            name="score_away"
                                            value={formData.score_away}
                                            onChange={handleChange}
                                            className="w-20 h-20 text-4xl font-black text-center bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-400/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-border/40 bg-slate-50/30 dark:bg-black/10 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary flex items-center gap-2 min-w-[200px] justify-center shadow-lg"
                        >
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Actualizar Partido
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
