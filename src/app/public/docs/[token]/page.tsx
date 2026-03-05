"use client";

import { useState, useEffect, use } from "react";
import {
    FileText,
    Shield,
    Upload,
    CheckCircle2,
    Loader2,
    AlertCircle,
    User
} from "lucide-react";
import { playerService } from "@/services/playerService";
import { uploadService } from "@/services/uploadService";
import { Player } from "@/types";

export default function PublicDocUploadPage({ params }: { params: Promise<{ token: string }> }) {
    const resolvedParams = use(params);
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [idCardExpiry, setIdCardExpiry] = useState("");
    const [healthCardFile, setHealthCardFile] = useState<File | null>(null);
    const [healthCardExpiry, setHealthCardExpiry] = useState("");

    useEffect(() => {
        loadPlayer();
    }, [resolvedParams.token]);

    const loadPlayer = async () => {
        try {
            setLoading(true);
            const data = await playerService.getByToken(resolvedParams.token);
            setPlayer(data);
        } catch (err) {
            console.error("Error loading player by token:", err);
            setError("El enlace es inválido o ha expirado.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!player) return;

        if (!idCardFile && !healthCardFile && !idCardExpiry && !healthCardExpiry) {
            alert("Por favor, completa al menos un campo para enviar.");
            return;
        }

        try {
            setSubmitting(true);
            const updates: Partial<Player> = {};

            if (idCardFile) {
                const url = await uploadService.uploadFile(idCardFile, "player-docs");
                updates.id_card_rev_url = url;
                updates.id_card_rev_status = 'pending';
            }
            if (idCardExpiry) {
                updates.id_card_rev_expiry = idCardExpiry;
                if (!updates.id_card_rev_status) updates.id_card_rev_status = 'pending';
            }

            if (healthCardFile) {
                const url = await uploadService.uploadFile(healthCardFile, "player-docs");
                updates.health_card_rev_url = url;
                updates.health_card_rev_status = 'pending';
            }
            if (healthCardExpiry) {
                updates.health_card_rev_expiry = healthCardExpiry;
                if (!updates.health_card_rev_status) updates.health_card_rev_status = 'pending';
            }

            await playerService.update(player.id, updates);
            setSuccess(true);
        } catch (err) {
            console.error("Error submitting documents:", err);
            alert("Hubo un error al enviar los documentos. Por favor, reintenta.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <Loader2 className="h-12 w-12 animate-spin text-secondary mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Cargando formulario seguro...</p>
            </div>
        );
    }

    if (error || !player) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="p-4 rounded-full bg-red-500/10 mb-6">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-black mb-2 uppercase tracking-tighter">Acceso Denegado</h1>
                <p className="text-slate-400 max-w-xs">{error || "No se ha podido encontrar la información del jugador."}</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="p-4 rounded-full bg-green-500/10 mb-6 scale-in-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter italic">¡Documentos Enviados!</h1>
                <p className="text-slate-400 max-w-xs mb-8">La información de <span className="text-white font-bold">{player.full_name}</span> ha sido enviada para revisión del club.</p>
                <div className="w-full max-w-xs h-1 px-8 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-progress"></div>
                </div>
                <p className="mt-4 text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ya puedes cerrar esta pestaña</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-secondary/30">
            {/* Header Section */}
            <div className="relative py-12 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-secondary/20 to-transparent blur-3xl opacity-30 pointer-events-none"></div>

                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center p-2 shadow-2xl shadow-black">
                        <img src="/images/33.png" alt="Club 33" className="w-full h-full object-contain" />
                    </div>
                </div>

                <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">
                    Actualizar <span className="text-secondary">Documentación</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium">Jugador: <span className="text-white font-bold">{player.full_name}</span></p>

                <div className="mt-4 flex flex-col items-center justify-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Conexión Segura</span>

                    <div className="max-w-xs p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex gap-3 text-left">
                        <AlertCircle className="h-5 w-5 text-secondary shrink-0" />
                        <p className="text-[10px] font-bold text-secondary uppercase leading-tight">
                            Atención: Por favor completa únicamente los datos solicitados en el mensaje recibido por WhatsApp.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <main className="max-w-md mx-auto px-6 pb-20">
                <form onSubmit={handleUpload} className="space-y-8">

                    {/* ID Card Section */}
                    <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/20 to-transparent">
                        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.3rem] border border-white/5 space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tight italic">Cédula de Identidad</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 block">Foto del Documento</span>
                                    <div className={`relative border-2 border-dashed rounded-[1.5rem] p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${idCardFile ? 'border-green-500/50 bg-green-500/5' : 'border-slate-800 hover:border-blue-500/50 hover:bg-white/5'}`}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        {idCardFile ? (
                                            <>
                                                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                                                <span className="text-xs font-bold text-green-500">{idCardFile.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 text-slate-600 mb-2" />
                                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Toca para subir o tomar foto</span>
                                            </>
                                        )}
                                    </div>
                                </label>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 block">Nueva Fecha Vencimiento</label>
                                    <input
                                        type="date"
                                        value={idCardExpiry}
                                        onChange={(e) => setIdCardExpiry(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Health Card Section */}
                    <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-green-500/20 to-transparent">
                        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.3rem] border border-white/5 space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tight italic">Ficha Médica</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 block">Foto / Escaneo</span>
                                    <div className={`relative border-2 border-dashed rounded-[1.5rem] p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${healthCardFile ? 'border-green-500/50 bg-green-500/5' : 'border-slate-800 hover:border-green-500/50 hover:bg-white/5'}`}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setHealthCardFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        {healthCardFile ? (
                                            <>
                                                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                                                <span className="text-xs font-bold text-green-500">{healthCardFile.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 text-slate-600 mb-2" />
                                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Toca para subir o tomar foto</span>
                                            </>
                                        )}
                                    </div>
                                </label>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 block">Nueva Fecha Vencimiento</label>
                                    <input
                                        type="date"
                                        value={healthCardExpiry}
                                        onChange={(e) => setHealthCardExpiry(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-green-500/50 transition-all appearance-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-20 bg-secondary rounded-[2rem] text-primary font-black uppercase tracking-[0.3em] italic text-lg shadow-2xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-6 w-6 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar Documentos"
                        )}
                    </button>

                    <p className="text-center text-[10px] text-slate-600 px-8 uppercase font-bold tracking-widest leading-relaxed">
                        Al enviar, los datos serán revisados <br /> por la administración de <span className="text-slate-500">Club 33</span>.
                    </p>
                </form>
            </main>
        </div>
    );
}
