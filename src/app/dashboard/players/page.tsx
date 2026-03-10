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
    FileDown,
    Printer,
    BellRing
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { playerService } from "@/services/playerService";
import { Player } from "@/types";
import { getDocStatus, calculateAge } from "@/utils/playerUtils";
import PlayerReportModal from "./components/PlayerReportModal";

import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function PlayersPage() {
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportPlayer, setReportPlayer] = useState<Player | null>(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printColumns, setPrintColumns] = useState({
        shirt_number: true,
        position: true,
        birth_date: true,
        father_phone: true,
        mother_phone: true,
        fee_status: true,
        gear_status: false,
        id_card_num: false,
    });

    const isVisitor = profile?.role === "visitante";

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

    const handleNotifyPlayer = async (player: Player) => {
        if (!confirm(`¿Estás seguro de ejecutar la notificación automática para ${player.full_name}?`)) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/cron/check-vencimientos?manual=true&playerId=${player.id}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'development_secret'}`
                }
            });

            if (res.status === 401) {
                alert("Error de Autorización (401): No se pudo verificar el CRON_SECRET.");
                return;
            }

            const data = await res.json();
            if (data.success) {
                if (data.notifications_sent > 0) {
                    alert(`Notificación enviada con éxito a ${player.full_name}.`);
                } else if (data.skipped) {
                    alert(`No se envió notificación: ${data.reason}`);
                } else {
                    alert(`No hay documentos por vencer para ${player.full_name}, no se envió mensaje.`);
                }
            } else {
                alert(`Error del Servidor: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error al ejecutar la notificación.");
        } finally {
            setLoading(false);
        }
    };

    const filteredPlayers = players.filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.shirt_number?.toString() === searchTerm
    );

    const columnLabels: Record<string, string> = {
        shirt_number: 'Dorsal',
        position: 'Posición',
        birth_date: 'Fecha Nac.',
        father_phone: 'Tel. Padre/Ref.',
        mother_phone: 'Tel. Madre',
        fee_status: 'Estado Cuota',
        gear_status: 'Indumentaria',
        id_card_num: 'Nº Cédula',
    };

    const printList = () => {
        const cols = Object.entries(printColumns).filter(([, v]) => v).map(([k]) => k);
        const rows = filteredPlayers.map((p, i) => {
            const cells = cols.map(col => {
                let val = '';
                if (col === 'shirt_number') val = p.shirt_number ? `#${p.shirt_number}` : '-';
                else if (col === 'position') val = p.position || '-';
                else if (col === 'birth_date') val = p.birth_date ? new Date(p.birth_date).toLocaleDateString('es') : '-';
                else if (col === 'father_phone') val = p.father_phone || p.referent_phone || '-';
                else if (col === 'mother_phone') val = p.mother_phone || '-';
                else if (col === 'fee_status') val = p.fee_status === 'up_to_date' ? 'Al día' : 'Atrasado';
                else if (col === 'gear_status') val = p.gear_status === 'paid' ? 'Pagado' : p.gear_status === 'delivered' ? 'Entregado' : 'Pendiente';
                else if (col === 'id_card_num') val = p.id_card_num || '-';
                return `<td style="padding:6px 10px;border:1px solid #e2e8f0">${val}</td>`;
            }).join('');
            const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
            return `<tr style="background:${bg}"><td style="padding:6px 10px;border:1px solid #e2e8f0;font-weight:700">${i + 1}. ${p.full_name}</td>${cells}</tr>`;
        }).join('');
        const headers = ['Jugador', ...cols.map(c => columnLabels[c] || c)].map(h => `<th style="padding:8px 10px;background:#1e293b;color:#fff;text-align:left;border:1px solid #334155">${h}</th>`).join('');
        const html = `<html><head><title>Plantel Club 33</title><style>body{font-family:Arial,sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2 style="margin-bottom:12px">Plantel Club 33 – ${new Date().toLocaleDateString('es')}</h2><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table><br><button onclick="window.print()">Imprimir</button></body></html>`;
        const win = window.open('', '_blank');
        if (win) { win.document.write(html); win.document.close(); win.print(); }
        setShowPrintModal(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">Gestión de Jugadores</h1>
                    <p className="text-muted-foreground">Listado completo del plantel actual.</p>
                </div>
                {!isVisitor && (
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button
                            onClick={() => setShowPrintModal(true)}
                            className="btn-secondary flex items-center gap-2"
                            title="Imprimir plantel"
                        >
                            <Printer className="h-5 w-5" />
                            Imprimir
                        </button>
                        <Link href="/dashboard/players/new" className="btn-primary flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Nuevo Jugador
                        </Link>
                    </div>
                )}
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

            <div className="bg-white  rounded-2xl border border-border/40 overflow-hidden shadow-sm relative">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                            <p className="font-medium">Cargando jugadores...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-30">
                                <tr className="border-b border-border/40 bg-slate-50  shadow-sm">
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground sticky left-0 z-40 bg-slate-50  min-w-[200px] max-w-[200px]">Jugador</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Habilitado</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Posición</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Edad</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Cédula</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Carnet</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {filteredPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-slate-50  transition-colors group">
                                        <td className="px-4 py-4 whitespace-nowrap sticky left-0 z-20 bg-white  sm:static sm:bg-transparent min-w-[200px] max-w-[200px] overflow-hidden group-hover:bg-slate-50  transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    {player.photo_url ? (
                                                        <Image
                                                            src={player.photo_url}
                                                            alt={player.full_name}
                                                            width={48}
                                                            height={48}
                                                            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-slate-100  flex items-center justify-center border-2 border-white text-slate-400 shadow-sm group-hover:border-secondary transition-colors">
                                                            <User className="h-7 w-7" />
                                                        </div>
                                                    )}
                                                    {player.shirt_number && (
                                                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-secondary flex items-center justify-center font-black text-[10px] text-primary border-2 border-white shadow-md">
                                                            {player.shirt_number}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-foreground  truncate">{player.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {(() => {
                                                const idStatus = getDocStatus(player.id_card_expiry, 30, player.id_card_rev_status);
                                                const healthStatus = getDocStatus(player.health_card_expiry, 30, player.health_card_rev_status);

                                                const isOk = idStatus.label === 'Al día' && healthStatus.label === 'Al día';
                                                const isVencido = idStatus.label === 'Vencido' || healthStatus.label === 'Vencido' || idStatus.label === 'Faltante' || healthStatus.label === 'Faltante';

                                                let icon = Check;
                                                let color = "text-green-500 bg-green-500/10";
                                                let label = "Habilitado";

                                                if (isVencido) {
                                                    icon = X;
                                                    color = "text-red-500 bg-red-500/10";
                                                    label = "No Habilitado";
                                                } else if (!isOk) {
                                                    icon = AlertTriangle;
                                                    color = "text-amber-500 bg-amber-500/10";
                                                    label = "Por vencer";
                                                }

                                                const Icon = icon;
                                                return (
                                                    <div className={`inline-flex items-center justify-center p-1.5 rounded-full ${color}`} title={label}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700  ">
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
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/dashboard/players/detail/${player.id}`} className="p-2 rounded-lg hover:bg-slate-100  text-slate-500 hover:text-accent transition-colors" title="Ver Detalles">
                                                        <Eye className="h-5 w-5" />
                                                    </Link>
                                                    {!isVisitor && (
                                                        <>
                                                            <Link href={`/dashboard/players/detail/${player.id}?edit=true`} className="p-2 rounded-lg hover:bg-slate-100  text-slate-500 hover:text-green-500 transition-colors" title="Editar">
                                                                <Edit2 className="h-5 w-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => setReportPlayer(player)}
                                                                className="p-2 rounded-lg hover:bg-slate-100  text-slate-500 hover:text-blue-500 transition-colors"
                                                                title="Generar Reporte"
                                                            >
                                                                <FileDown className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleNotifyPlayer(player)}
                                                                className="p-2 rounded-lg hover:bg-slate-100  text-slate-500 hover:text-indigo-500 transition-colors"
                                                                title="Notificar Automáticamente"
                                                            >
                                                                <BellRing className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(player.id, player.full_name)}
                                                                className="p-2 rounded-lg hover:bg-slate-100  text-slate-500 hover:text-red-500 transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
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

            {/* Print List Modal */}
            {showPrintModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-border/40 w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Imprimir Plantel</h2>
                                <p className="text-xs text-muted-foreground font-medium">{filteredPlayers.length} jugadores en la lista actual</p>
                            </div>
                            <button onClick={() => setShowPrintModal(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Columnas a incluir</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(columnLabels).map(([key, label]) => (
                                    <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${printColumns[key as keyof typeof printColumns] ? 'border-secondary bg-secondary/5' : 'border-border/40 hover:border-secondary/30'}`}>
                                        <input
                                            type="checkbox"
                                            checked={printColumns[key as keyof typeof printColumns]}
                                            onChange={(e) => setPrintColumns({ ...printColumns, [key]: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <div className={`h-5 w-5 rounded-md flex items-center justify-center transition-colors ${printColumns[key as keyof typeof printColumns] ? 'bg-secondary' : 'bg-border/30'}`}>
                                            {printColumns[key as keyof typeof printColumns] && <Check className="h-3 w-3 text-primary" />}
                                        </div>
                                        <span className="text-xs font-bold text-foreground">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={printList}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
                        >
                            <Printer className="h-5 w-5" />
                            Generar e Imprimir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
