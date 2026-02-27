"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (authError) throw authError;

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "Error al registrarse. Por favor intenta de nuevo.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary p-6 overflow-hidden relative">
                <div className="relative z-10 w-full max-w-md">
                    <div className="glass-morphism rounded-3xl border border-white/10 p-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-white mb-4">¡Registro Exitoso!</h2>
                        <p className="text-slate-400 mb-8 font-medium">Hemos enviado un correo de confirmación. Por favor, verifica tu bandeja de entrada antes de iniciar sesión.</p>
                        <Link href="/login" className="btn-primary w-full block">
                            Ir al Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-6 overflow-hidden relative">
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
                        <h1 className="text-3xl font-extrabold text-white">Únete al Equipo</h1>
                        <p className="text-slate-400 mt-2 font-medium">Crea tu cuenta para empezar la gestión</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Juan Pérez"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
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
                            className="w-full btn-primary h-14 flex items-center justify-center gap-3 text-lg mt-6"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : (
                                <>
                                    Registrarse
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm mt-8">
                        ¿Ya tienes cuenta? <Link href="/login" className="text-secondary font-bold hover:underline">Inicia Sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
