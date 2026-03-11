"use client";

import { useState, useEffect, use } from "react";
import { playerService } from "@/services/playerService";
import { matchService } from "@/services/matchService";
import { Player, Match, MatchResponse } from "@/types";
import {
    Calendar,
    MapPin,
    CheckCircle2,
    XCircle,
    Loader2,
    Users,
    Trophy
} from "lucide-react";
import Image from "next/image";

export default function ConvocatoriaPublicPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [player, setPlayer] = useState<Player | null>(null);
    const [nextMatch, setNextMatch] = useState<Match | null>(null);
    const [response, setResponse] = useState<MatchResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadData();
    }, [token]);

    const loadData = async () => {
        try {
            setLoading(true);
            const playerData = await playerService.getByToken(token);
            setPlayer(playerData);

            const matches = await matchService.getAll();
            const upcoming = matches.find(m => m.status === "Próximo");
            setNextMatch(upcoming || null);

            if (upcoming && playerData) {
                const responses = await matchService.getMatchResponses(upcoming.id);
                const existing = responses.find((r: any) => r.player_id === playerData.id);
                setResponse(existing || null);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (status: 'asiste' | 'no_asiste') => {
        if (!player || !nextMatch) return;

        try {
            setSubmitting(true);
            await matchService.updateMatchResponse(nextMatch.id, player.id, status);
            setSuccess(true);
            // Reload to show updated status
            loadData();
        } catch (error) {
            console.error("Error confirming attendance:", error);
            alert("Hubo un error al procesar tu respuesta. Por favor intenta de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
            </div>
        );
    }

    if (!player || !nextMatch) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-[32px] shadow-xl border border-border/40 max-w-md w-full">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-black uppercase italic tracking-tighter mb-2">Enlace no válido</h1>
                    <p className="text-muted-foreground">No pudimos encontrar la información del partido o del jugador. Verifica el link enviado por WhatsApp.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header Card */}
                <div className="bg-white p-8 rounded-[32px] shadow-xl border border-border/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                    <div className="relative flex flex-col items-center text-center">
                        {player.photo_url ? (
                            <Image
                                src={player.photo_url}
                                alt={player.full_name}
                                width={80}
                                height={80}
                                className="rounded-full border-4 border-white shadow-lg mb-4 object-cover h-20 w-20"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 border-4 border-white shadow-lg text-slate-400">
                                <Users className="h-10 w-10" />
                            </div>
                        )}
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Convocatoria</h2>
                        <h1 className="text-2xl font-black text-foreground uppercase italic tracking-tighter leading-tight">
                            ¡Hola, {player.full_name.split(' ')[0]}!
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground font-medium">Has sido convocado para el próximo encuentro.</p>
                    </div>
                </div>

                {/* Match Details Card */}
                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-border/40 space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-border/20">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Calendar className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fecha y Hora</span>
                            <span className="font-bold text-foreground">
                                {new Date(nextMatch.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                <span className="text-accent ml-2">
                                    {new Date(nextMatch.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-border/20">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Trophy className="h-6 w-6 text-secondary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rival</span>
                            <span className="font-bold text-foreground">vs {nextMatch.rival}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-border/20">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <MapPin className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Lugar</span>
                            <span className="font-bold text-foreground">{nextMatch.venue || "A confirmar"}</span>
                        </div>
                    </div>
                </div>

                {/* Response Section */}
                {!success && response?.status === 'pendiente' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleConfirm('asiste')}
                            disabled={submitting}
                            className="bg-green-500 hover:bg-green-600 text-white font-black uppercase italic tracking-tighter py-4 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                            <span>Asiste</span>
                        </button>
                        <button
                            onClick={() => handleConfirm('no_asiste')}
                            disabled={submitting}
                            className="bg-red-500 hover:bg-red-600 text-white font-black uppercase italic tracking-tighter py-4 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <XCircle className="h-6 w-6" />}
                            <span>No asiste</span>
                        </button>
                    </div>
                ) : (
                    <div className={`p-6 rounded-[32px] text-center border-4 ${response?.status === 'asiste' ? 'border-green-500 bg-green-50 shadow-green-100' : 'border-red-500 bg-red-50 shadow-red-100'} shadow-xl animate-in zoom-in-95 duration-300`}>
                        <div className="flex flex-col items-center">
                            {response?.status === 'asiste' ? (
                                <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                            ) : (
                                <XCircle className="h-12 w-12 text-red-500 mb-2" />
                            )}
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground">
                                {response?.status === 'asiste' ? '¡Asistencia Confirmada!' : 'Has cancelado tu asistencia'}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium mt-1">
                                {response?.status === 'asiste'
                                    ? '¡Te esperamos en la cancha! Recuerda llegar media hora antes del encuentro, traer tu equipo completo y agua en botella individual.'
                                    : '¡Gracias por avisar! Nos vemos en la próxima.'}
                            </p>

                            <button
                                onClick={() => setSuccess(false)}
                                className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cambiar respuesta
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Gestión Club 33 - 2026</p>
                </div>
            </div>
        </div>
    );
}
