"use client";

import { useState, useEffect } from "react";
import {
    Banknote,
    Search,
    Filter,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    User,
    ChevronRight,
    MoreHorizontal,
    Shirt,
    X
} from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { Payment, Player } from "@/types";
import { supabase } from "@/lib/supabase";

export default function PaymentsPage() {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newPayment, setNewPayment] = useState<Partial<Payment>>({
        category: 'Cuota Club',
        amount: 0,
        status: 'Pagado',
        paid_date: new Date().toISOString().split('T')[0],
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear()
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [paymentsData, playersData] = await Promise.all([
                paymentService.getAllPayments(),
                supabase.from('profiles').select('*').eq('role', 'jugador').order('full_name')
            ]);
            setPayments(paymentsData);
            if (playersData.data) setPlayers(playersData.data as Player[]);
        } catch (error) {
            console.error("Error loading payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.player?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPayment.player_id || !newPayment.amount) return;

        try {
            setIsSubmitting(true);
            await paymentService.addPayment(newPayment as Payment);

            // Update player status if it was a fee or gear
            const player = players.find(p => p.id === newPayment.player_id);
            if (player) {
                const updates: Partial<Player> = {};
                if (newPayment.category === 'Cuota Club') updates.fee_status = 'up_to_date';
                if (newPayment.category === 'Indumentaria') updates.gear_status = 'paid';

                if (Object.keys(updates).length > 0) {
                    await supabase.from('profiles').update(updates).eq('id', player.id);
                }
            }

            setShowAddModal(false);
            await loadData();

            // Reset form
            setNewPayment({
                category: 'Cuota Club',
                amount: 0,
                status: 'Pagado',
                paid_date: new Date().toISOString().split('T')[0],
                period_month: new Date().getMonth() + 1,
                period_year: new Date().getFullYear()
            });
        } catch (error) {
            console.error("Error adding payment:", error);
            alert("Error al registrar el pago");
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = {
        totalMonth: payments
            .filter(p => {
                const date = new Date(p.paid_date || p.due_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && p.status === 'Pagado';
            })
            .reduce((acc, curr) => acc + (curr.amount || 0), 0),
        pendingCount: payments.filter(p => p.status === 'Pendiente').length,
        upToDatePercent: 85, // Dummy for now, should calculate based on players
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground italic uppercase tracking-tighter">Gestión de Pagos</h1>
                    <p className="text-muted-foreground mt-1">Control de cuotas sociales, indumentaria y recaudaciones.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2 group shadow-xl shadow-accent/20"
                >
                    <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
                        <Plus className="h-4 w-4" />
                    </div>
                    Registrar Nuevo Pago
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                            <Banknote className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recaudado (Mes)</p>
                            <h3 className="text-3xl font-black text-foreground tracking-tighter">${stats.totalMonth.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/5 w-fit px-2 py-1 rounded-lg border border-emerald-500/10">
                        <ArrowUpRight className="h-3 w-3" /> +12.5% vs mes pasado
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors"></div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                            <Clock className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pagos Pendientes</p>
                            <h3 className="text-3xl font-black text-foreground tracking-tighter">{stats.pendingCount}</h3>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/5 w-fit px-2 py-1 rounded-lg border border-amber-500/10">
                        <AlertCircle className="h-3 w-3" /> Requieren atención inmediata
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors"></div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                            <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jugadores al Día</p>
                            <h3 className="text-3xl font-black text-foreground tracking-tighter">{stats.upToDatePercent}%</h3>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: `${stats.upToDatePercent}%` }}></div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/10 transition-colors"></div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[32px] border border-border/40 shadow-sm overflow-hidden min-h-[500px]">
                {/* Table Header / Filters */}
                <div className="p-6 border-b border-border/40 bg-slate-50/50 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setFilterCategory("all")}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterCategory === 'all' ? 'bg-secondary text-primary shadow-lg shadow-secondary/20 scale-105' : 'bg-white border border-border text-muted-foreground hover:border-secondary/50'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterCategory("Cuota Club")}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterCategory === 'Cuota Club' ? 'bg-secondary text-primary border-secondary shadow-lg shadow-secondary/20 scale-105' : 'bg-white border-border text-muted-foreground hover:border-secondary/50'}`}
                        >
                            Cuotas
                        </button>
                        <button
                            onClick={() => setFilterCategory("Indumentaria")}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterCategory === 'Indumentaria' ? 'bg-secondary text-primary border-secondary shadow-lg shadow-secondary/20 scale-105' : 'bg-white border-border text-muted-foreground hover:border-secondary/50'}`}
                        >
                            Indumentaria
                        </button>
                    </div>

                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por jugador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                        />
                    </div>
                </div>

                {/* Table Body */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                            <p className="font-black uppercase tracking-widest text-[10px]">Cargando transacciones...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/30 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground italic border-b border-border/40">
                                    <th className="px-8 py-4">Jugador</th>
                                    <th className="px-8 py-4">Categoría</th>
                                    <th className="px-8 py-4">Fecha / Periodo</th>
                                    <th className="px-8 py-4">Monto</th>
                                    <th className="px-8 py-4">Estado</th>
                                    <th className="px-8 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground opacity-30">
                                                <Banknote className="h-20 w-20" />
                                                <p className="font-bold text-xl uppercase tracking-tighter italic">No se encontraron pagos</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform overflow-hidden shadow-inner border border-border/50">
                                                        {p.player?.photo_url ? (
                                                            <img src={p.player.photo_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-foreground uppercase tracking-tight">{p.player?.full_name}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{p.player?.shirt_number ? `Dorsal ${p.player.shirt_number}` : 'Sin Dorsal'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    {p.category === 'Cuota Club' ? (
                                                        <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg">
                                                            <Calendar className="h-3 w-3" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-1.5 bg-accent/10 text-accent rounded-lg">
                                                            <Shirt className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-black uppercase tracking-widest text-foreground">{p.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {p.paid_date ? new Date(p.paid_date).toLocaleDateString() : p.due_date ? new Date(p.due_date).toLocaleDateString() : '-'}
                                                    </span>
                                                    {p.period_month && (
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase">Periodo: {new Date(0, p.period_month - 1).toLocaleString('es', { month: 'long' })} {p.period_year}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-sm font-black text-foreground italic">${p.amount?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                {p.status === 'Pagado' ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full w-fit border border-emerald-500/20">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Pagado</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full w-fit border border-amber-500/20">
                                                        <Clock className="h-3 w-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex justify-center">
                                                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Payment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-border/40 animate-in zoom-in-95 duration-300">
                        <div className="bg-secondary p-8 text-primary relative overflow-hidden">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter relative z-10">Registrar Pago</h2>
                            <p className="text-primary/70 text-sm font-bold relative z-10">Ingresa los detalles de la nueva transacción.</p>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Jugador</label>
                                <select
                                    required
                                    value={newPayment.player_id || ''}
                                    onChange={(e) => setNewPayment({ ...newPayment, player_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                                >
                                    <option value="">Seleccionar Jugador...</option>
                                    {players.map(p => (
                                        <option key={p.id} value={p.id}>{p.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categoría</label>
                                    <select
                                        required
                                        value={newPayment.category}
                                        onChange={(e) => setNewPayment({ ...newPayment, category: e.target.value as any })}
                                        className="w-full bg-slate-50 border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                                    >
                                        <option value="Cuota Club">Cuota Club</option>
                                        <option value="Indumentaria">Indumentaria</option>
                                        <option value="Recaudación">Recaudación</option>
                                        <option value="Extra">Extra</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Monto ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newPayment.amount || ''}
                                        onChange={(e) => setNewPayment({ ...newPayment, amount: parseInt(e.target.value) })}
                                        placeholder="0"
                                        className="w-full bg-slate-50 border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                                    />
                                </div>
                            </div>

                            {newPayment.category === 'Cuota Club' && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mes</label>
                                        <select
                                            value={newPayment.period_month}
                                            onChange={(e) => setNewPayment({ ...newPayment, period_month: parseInt(e.target.value) })}
                                            className="w-full bg-slate-50 border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {new Date(0, i).toLocaleString('es', { month: 'long' })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Año</label>
                                        <input
                                            type="number"
                                            value={newPayment.period_year}
                                            onChange={(e) => setNewPayment({ ...newPayment, period_year: parseInt(e.target.value) })}
                                            className="w-full bg-slate-50 border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fecha de Pago</label>
                                    <input
                                        type="date"
                                        value={newPayment.paid_date?.split('T')[0]}
                                        onChange={(e) => setNewPayment({ ...newPayment, paid_date: e.target.value })}
                                        className="w-full bg-slate-50 border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Estado</label>
                                    <select
                                        value={newPayment.status}
                                        onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value as any })}
                                        className="w-full bg-slate-50 border border-border rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                                    >
                                        <option value="Pagado">Pagado</option>
                                        <option value="Pendiente">Pendiente</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-2 group shadow-xl shadow-accent/20"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        Registrar Pago
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
