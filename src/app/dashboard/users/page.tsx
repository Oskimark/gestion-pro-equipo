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
    UserPlus
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";

export default function UsersPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

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

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === "admin" ? "ayudante" : "admin";
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) throw error;
            loadUsers();
        } catch (error) {
            console.error("Error updating role:", error);
            alert("No tienes permisos suficientes para cambiar roles.");
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">Administra el personal y sus permisos de acceso.</p>
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
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground glass-morphism rounded-3xl border border-dashed border-border/60">
                        <UserCircle className="h-20 w-20 opacity-10 mb-6" />
                        <h3 className="text-xl font-bold text-foreground">No hay usuarios registrados</h3>
                        <p className="mt-2 max-w-xs text-center text-sm">
                            Si acabas de registrarte, asegúrate de que el Administrador haya configurado correctamente la base de datos.
                        </p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="glass-morphism p-6 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                        <UserCircle className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{user.full_name || "Usuario Sin Nombre"}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {user.role === "admin" ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-secondary px-2 py-0.5 bg-secondary/10 rounded-full">
                                                    <Shield size={10} /> Administrador
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full">
                                                    <ShieldAlert size={10} /> Ayudante
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-4 pt-6 border-t border-border/20 relative z-10">
                                <button
                                    onClick={() => toggleRole(user.id, user.role || "")}
                                    className="text-xs font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                                >
                                    {user.role === "admin" ? "Bajar a Ayudante" : "Subir a Admin"}
                                </button>
                                <button className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
                        </div>
                    ))
                )}
            </div>

            <div className="glass-morphism p-8 rounded-3xl border border-border/40 bg-secondary/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-lg shadow-secondary/20">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-foreground">Cómo añadir más gente</h2>
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
        </div>
    );
}
