"use client";

import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuspendedPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
                <img src="/images/stadium-bg.png" alt="bg" className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white dark:bg-slate-950 p-10 rounded-3xl border border-red-500/30 hover:border-red-500/50 transition-all group relative overflow-hidden text-center shadow-2xl">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-8 animate-pulse">
                        <ShieldAlert className="h-12 w-12" />
                    </div>

                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Acceso Denegado</h1>

                    <p className="text-slate-300 font-medium leading-relaxed mb-8">
                        Tu cuenta ha sido pausada o eliminada por un administrador.
                        Si crees que esto es un error, contacta con el responsable del equipo.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={handleLogout}
                            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-900/20"
                        >
                            <LogOut className="h-5 w-5" /> Cerrar Sesión
                        </button>

                        <Link
                            href="/"
                            className="w-full h-14 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                        >
                            <ArrowLeft className="h-4 w-4" /> Volver al Inicio
                        </Link>
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                </div>
            </div>
        </div>
    );
}
