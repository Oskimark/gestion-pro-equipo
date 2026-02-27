"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError("Credenciales inválidas. Por favor, revisa tu correo y contraseña.");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-6 overflow-hidden relative">
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="glass-morphism rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center font-black text-primary text-2xl shadow-lg shadow-secondary/20 mx-auto transition-transform hover:scale-110">
                                PE
                            </div>
                        </Link>
                        <h1 className="text-3xl font-extrabold text-white">Bienvenido</h1>
                        <p className="text-slate-400 mt-2 font-medium">Ingresa tus credenciales para continuar</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@proequipo.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contraseña</label>
                                <button type="button" className="text-[10px] font-bold text-secondary hover:text-white transition-colors uppercase">¿Olvidaste tu contraseña?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-14 flex items-center justify-center gap-3 text-lg mt-8"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : (
                                <>
                                    Entrar al Panel
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm mt-8">
                        ¿No tienes cuenta? <Link href="/register" className="text-secondary font-bold hover:underline">Regístrate</Link>
                    </p>
                </div>

                <footer className="mt-12 text-slate-500 text-xs text-center opacity-70">
                    Desarrollado por OSKIMARK© 2026 Gestión Pro Equipo -v1.07 Potenciando el futuro del deporte.
                </footer>
            </div>
        </div>
    );
}
