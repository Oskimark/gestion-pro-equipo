"use client";

import { useState, useEffect, use } from "react";
import { matchService } from "@/services/matchService";
import { playerService } from "@/services/playerService";
import { Match, MatchResponse, Player } from "@/types";
import {
    Calendar,
    MapPin,
    Trophy,
    Clock,
    Users,
    User,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Search
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [match, setMatch] = useState<Match | null>(null);
    const [responses, setResponses] = useState<(MatchResponse & { player?: Player })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [matchData, matchResponses, allPlayers] = await Promise.all([
                matchService.getAll().then(list => list.find(m => m.id === id)),
                matchService.getMatchResponses(id),
                playerService.getAll()
            ]);

            if (matchData) {
                setMatch(matchData);
                const enrichedResponses = matchResponses.map(r => ({
                    ...r,
                    player: allPlayers.find(p => p.id === r.player_id)
                }));
                setResponses(enrichedResponses);
            }
        } catch (error) {
            console.error("Error loading match details:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResponses = responses.filter(r =>
        r.player?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.player?.shirt_number?.toString() === searchTerm
    );

    const stats = {
        total: responses.length,
        asiste: responses.filter(r => r.status === 'asiste').length,
        no_asiste: responses.filter(r => r.status === 'no_asiste').length,
        pendiente: responses.filter(r => r.status === 'pendiente').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
        );
    }

    if (!match) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No se encontró el partido.</p>
                <Link href="/dashboard/matches" className="text-accent hover:underline mt-4 inline-block font-bold">Volver al calendario</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="p-2 rounded-xl bg-white border border-border/40 group-hover:bg-slate-50 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest">Atrás</span>
                </button>
                <Link href={`/dashboard/matches/edit/${match.id}`} className="btn-secondary flex items-center gap-2">
                    Editar Partido
                </Link>
            </div>

            {/* Match Card */}
            <div className="relative overflow-hidden rounded-[32px] bg-primary p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Trophy className="h-40 w-40" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 ${match.status === 'Próximo' ? 'bg-secondary text-primary' : 'bg-white/10 text-white'}`}>
                            {match.status}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black mt-4 uppercase italic tracking-tighter leading-none">
                            vs {match.rival}
                        </h1>
                        <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-300">
                            <span className="flex items-center gap-2 font-medium">
                                <Calendar className="h-4 w-4 text-secondary" />
                                {new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-2 font-medium">
                                <Clock className="h-4 w-4 text-secondary" />
                                {new Date(match.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} HS
                            </span>
                            <span className="flex items-center gap-2 font-medium">
                                <MapPin className="h-4 w-4 text-secondary" />
                                {match.venue || "A confirmar"}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm rounded-[32px] p-6 border border-white/10 shadow-inner">
                        <div className="grid grid-cols-2 gap-8 text-center">
                            <div>
                                <div className="text-4xl md:text-5xl font-black text-white">{match.status === 'Finalizado' ? match.score_home : '33'}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Club 33</div>
                            </div>
                            <div>
                                <div className="text-4xl md:text-5xl font-black text-slate-400">{match.status === 'Finalizado' ? match.score_away : '?'}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Rival</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Squad Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-border/40 shadow-sm space-y-6">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                            <Users className="h-5 w-5 text-accent" />
                            Resumen Squad
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-border/20">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Convocados</span>
                                <span className="text-xl font-black text-foreground">{stats.total}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-lg text-white">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Asisten</span>
                                </div>
                                <span className="text-xl font-black text-green-700">{stats.asiste}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500 rounded-lg text-white">
                                        <XCircle className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">No Asisten</span>
                                </div>
                                <span className="text-xl font-black text-red-700">{stats.no_asiste}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500 rounded-lg text-white">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pendientes</span>
                                </div>
                                <span className="text-xl font-black text-amber-700">{stats.pendiente}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Squad List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar en el plantel..."
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-white text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none font-medium transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-border/40 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/20">Jugador</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/20 text-center">Posición</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/20 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/10">
                                    {filteredResponses.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">No hay jugadores convocados para este partido.</td>
                                        </tr>
                                    ) : (
                                        filteredResponses.map((res) => (
                                            <tr
                                                key={res.id}
                                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                                                onClick={() => router.push(`/dashboard/players?id=${res.player_id}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {res.player?.photo_url ? (
                                                            <Image src={res.player.photo_url} alt={res.player.full_name} width={40} height={40} className="h-10 w-10 rounded-full object-cover border border-border group-hover/row:border-accent transition-colors" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-border group-hover/row:border-accent transition-colors">
                                                                <User className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-black text-foreground uppercase italic tracking-tighter leading-tight group-hover/row:text-accent transition-colors">
                                                                {res.player?.shirt_number ? `#${res.player.shirt_number} ` : ''}
                                                                {res.player?.full_name}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                                {res.confirmed_at ? new Date(res.confirmed_at).toLocaleString() : 'Sin respuesta aún'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">
                                                        {res.player?.position || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        {res.status === 'asiste' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-green-500 text-white shadow-lg shadow-green-100">
                                                                <CheckCircle2 className="h-3 w-3" /> Asiste
                                                            </span>
                                                        ) : res.status === 'no_asiste' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-red-500 text-white shadow-lg shadow-red-100">
                                                                <XCircle className="h-3 w-3" /> No asiste
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 border border-slate-200">
                                                                <Clock className="h-3 w-3" /> Pendiente
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
