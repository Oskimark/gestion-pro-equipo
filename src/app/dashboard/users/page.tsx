"use client";

import { useState, useEffect } from "react";
import {
    UserCircle,
    Shield,
    ShieldAlert,
    Trash2,
    Loader2,
    Mail,
    Search,
    UserPlus,
    Edit,
    Phone,
    FileText,
    Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function UsersPage() {
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserProfile[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [editForm, setEditForm] = useState({
        full_name: "",
        phone: "",
        observations: "",
        role: "ayudante" as UserProfile['role']
    });

    useEffect(() => {
        if (!profileLoading && profile?.role === "visitante") {
            router.push("/dashboard");
        }
    }, [profile, profileLoading, router]);

    if (profileLoading || profile?.role === "visitante") {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                <p className="font-semibold text-lg">Verificando acceso...</p>
            </div>
        );
    }

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("role", { ascending: true });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: UserProfile) => {
        setEditingUser(user);
        setEditForm({
            full_name: user.full_name || "",
            phone: user.phone || "",
            observations: user.observations || "",
            role: user.role || "ayudante"
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: editForm.full_name,
                    phone: editForm.phone,
                    observations: editForm.observations,
                    role: editForm.role
                })
                .eq("id", editingUser.id);

            if (error) throw error;
            setIsEditModalOpen(false);
            loadUsers();
        } catch (error: any) {
            console.error("Error editing user:", error);
            alert(`Error: ${error.message || "No se pudo actualizar el perfil."}`);
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === "admin" ? "ayudante" : "admin";
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) {
                console.error("Supabase error (role):", error);
                throw error;
            }
            loadUsers();
        } catch (error: any) {
            console.error("Error updating role:", error);
            alert(`Error: ${error.message || "No tienes permisos suficientes."}`);
        }
    };

    const toggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === "suspended" ? "active" : "suspended";
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ status: newStatus })
                .eq("id", userId);

            if (error) {
                console.error("Supabase error (status):", error);
                throw error;
            }
            loadUsers();
        } catch (error: any) {
            console.error("Error updating status:", error);
            alert(`Error: ${error.message || "Error al actualizar el estado."}`);
        }
    };

    const deleteUser = async (userId: string, userName: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("profiles")
                .delete()
                .eq("id", userId);

            if (error) {
                console.error("Supabase error (delete):", error);
                throw error;
            }

            setUsers(users.filter(u => u.id !== userId));
            alert("Usuario eliminado correctamente.");
        } catch (error: any) {
            console.error("Error deleting user:", error);
            alert(`Error: ${error.message || "No se pudo eliminar al usuario."}`);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground italic uppercase tracking-tighter">Gestión de Personal</h1>
                    <p className="text-muted-foreground">Administra el personal, sus permisos y datos de contacto.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/40 w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-secondary mb-4" />
                        <p className="font-bold">Cargando personal...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-white dark:bg-slate-950 rounded-3xl border border-dashed border-border/60">
                        <UserCircle className="h-20 w-20 opacity-10 mb-6" />
                        <h3 className="text-xl font-bold text-foreground">No hay usuarios registrados</h3>
                        <p className="mt-2 max-w-xs text-center text-sm">
                            Si acabas de registrarte, asegúrate de que el Administrador haya configurado correctamente la base de datos.
                        </p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className={`bg-white dark:bg-slate-950 p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden ${user.status === 'suspended' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform border border-border/50">
                                            <UserCircle className="h-8 w-8" />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-950 ${user.is_online ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`} title={user.is_online ? 'En línea' : 'Desconectado'}></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-foreground">{user.full_name || "Usuario Sin Nombre"}</h3>
                                            {user.status === 'suspended' && (
                                                <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase">Suspendido</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                            {user.role === "admin" ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-secondary px-2 py-0.5 bg-secondary/10 rounded-full">
                                                    <Shield size={10} /> Administrador
                                                </span>
                                            ) : user.role === "visitante" ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                                                    <Mail size={10} /> Visitante
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full">
                                                    <ShieldAlert size={10} /> Ayudante
                                                </span>
                                            )}
                                            {user.phone && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full">
                                                    <Phone size={10} /> {user.phone}
                                                </span>
                                            )}
                                        </div>
                                        {user.observations && (
                                            <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 bg-slate-100/50 dark:bg-white/5 p-2 rounded-lg border border-border/20 italic">
                                                "{user.observations}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-4 pt-6 border-t border-border/20 relative z-10">
                                <button
                                    onClick={() => openEditModal(user)}
                                    className="text-xs font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                                >
                                    <Edit size={12} /> Editar Perfil
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleStatus(user.id, user.status || "active")}
                                        className={`p-2 rounded-xl transition-all ${user.status === 'suspended' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-lg shadow-amber-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-amber-500'}`}
                                        title={user.status === 'suspended' ? "Activar Acceso" : "Pausar Acceso"}
                                    >
                                        {user.status === 'suspended' ? <ShieldAlert className="h-4 w-4" /> : <Shield size={4} className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => deleteUser(user.id, user.full_name || "este usuario")}
                                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
                        </div>
                    ))
                )}
            </div>


            <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-border/40 relative overflow-hidden bg-secondary/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-lg shadow-secondary/20">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-foreground italic uppercase tracking-tighter">Cómo añadir más gente</h2>
                        <p className="text-sm text-muted-foreground">Comparte el enlace de registro con tu equipo.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full bg-white dark:bg-black/20 border border-border rounded-xl px-4 py-3 text-sm font-mono text-muted-foreground truncate">
                        {typeof window !== 'undefined' ? `${window.location.origin}/register` : "URL de Registro"}
                    </div>
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                navigator.clipboard.writeText(`${window.location.origin}/register`);
                                alert("Enlace copiado al portapapeles");
                            }
                        }}
                        className="btn-secondary whitespace-nowrap"
                    >
                        Copiar Enlace
                    </button>
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-[32px] border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                        <Edit className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-foreground italic uppercase tracking-tighter">Editar Perfil</h2>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Información de Personal</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-muted-foreground"
                                >
                                    <ShieldAlert className="h-5 w-5 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                                    <div className="relative group">
                                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={editForm.full_name}
                                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Teléfono</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                                            <input
                                                type="text"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                placeholder="099 123 456"
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Rol en el Club</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                                            <select
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all font-bold text-sm appearance-none"
                                            >
                                                <option value="admin">Administrador</option>
                                                <option value="ayudante">Ayudante</option>
                                                <option value="visitante">Visitante</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Observaciones / Notas</label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                                        <textarea
                                            value={editForm.observations}
                                            onChange={(e) => setEditForm({ ...editForm, observations: e.target.value })}
                                            placeholder="Notas adicionales sobre el usuario..."
                                            rows={3}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all font-medium text-sm resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 h-14 rounded-2xl font-bold text-sm uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] h-14 bg-accent hover:bg-accent/90 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20"
                                    >
                                        <Check className="h-5 w-5" /> Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
