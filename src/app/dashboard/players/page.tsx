"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Filter,
    User,
    Eye,
    Edit2,
    Trash2,
    Loader2,
    Check,
    X,
    AlertTriangle,
    FileDown
} from "lucide-react";
import Link from "next/link";
import { playerService } from "@/services/playerService";
import { Player } from "@/types";
import { getDocStatus, calculateAge } from "@/utils/playerUtils";
import PlayerReportModal from "./components/PlayerReportModal";

export default function PlayersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportPlayer, setReportPlayer] = useState<Player | null>(null);

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        try {
            setLoading(true);
            const data = await playerService.getAll();
            setPlayers(data);
        } catch (error) {
            console.error("Error loading players:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
            try {
                await playerService.delete(id);
                setPlayers(players.filter(p => p.id !== id));
            } catch (error) {
                alert("Error al eliminar el jugador");
            }
        }
    };

    const filteredPlayers = players.filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.shirt_number?.toString() === searchTerm
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">Gestión de Jugadores</h1>
                    <p className="text-muted-foreground">Listado completo del plantel actual.</p>
                </div>
                <Link href="/dashboard/players/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
                    <Plus className="h-5 w-5" />
                    Nuevo Jugador
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o dorsal..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros
                </button>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-border/40 overflow-hidden shadow-sm relative">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                            <p className="font-medium">Cargando jugadores...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/40 bg-slate-50/50 dark:bg-white/5">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Jugador</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Dorsal</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Posición</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Edad</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Cédula</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Carnet</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {filteredPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-border text-slate-400 group-hover:border-secondary transition-colors">
                                                    <User className="h-6 w-6" />
                                                </div>
                                                <span className="font-bold text-foreground">{player.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-secondary/10 text-secondary font-extrabold border border-secondary/20">
                                                {player.shirt_number || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {player.position || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-muted-foreground">
                                            {calculateAge(player.birth_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {(() => {
                                                const status = getDocStatus(player.id_card_expiry);
                                                return (
                                                    <div className={`inline-flex items-center justify-center p-1.5 rounded-full ${status.color}`} title={status.label}>
                                                        <status.icon className="h-4 w-4" />
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {(() => {
                                                const status = getDocStatus(player.health_card_expiry);
                                                return (
                                                    <div className={`inline-flex items-center justify-center p-1.5 rounded-full ${status.color}`} title={status.label}>
                                                        <status.icon className="h-4 w-4" />
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/dashboard/players/detail/${player.id}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-accent transition-colors">
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                                <Link href={`/dashboard/players/detail/${player.id}?edit=true`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-green-500 transition-colors">
                                                    <Edit2 className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => setReportPlayer(player)}
                                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition-colors"
                                                    title="Generar Reporte"
                                                >
                                                    <FileDown className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(player.id, player.full_name)}
                                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && filteredPlayers.length === 0 && (
                    <div className="py-20 text-center">
                        <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No se encontraron jugadores que coincidan con la búsqueda.</p>
                    </div>
                )}
            </div>

            <PlayerReportModal
                isOpen={!!reportPlayer}
                onClose={() => setReportPlayer(null)}
                player={reportPlayer}
            />
        </div>
    );
}
