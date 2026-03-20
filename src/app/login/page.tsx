"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Format username to internal email if no '@' is present
        let loginEmail = email;
        if (!email.includes('@')) {
            const cleanUsername = email.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
            loginEmail = `${cleanUsername}@gestion-equipo.com`;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password,
        });

        if (authError) {
            setError("Credenciales inválidas. Por favor, revisa tu correo y contraseña.");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        setResetMessage(null);

        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setResetMessage({ type: 'error', text: "Error: No se pudo enviar el correo de recuperación." });
        } else {
            setResetMessage({ type: 'success', text: "¡Correo enviado! Revisa tu bandeja de entrada." });
            setTimeout(() => {
                setIsForgotModalOpen(false);
                setResetMessage(null);
            }, 3000);
        }
        setResetLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-6 overflow-hidden relative">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src="/images/stadium-bg.png" alt="stadium background" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white  p-8 md:p-10 rounded-3xl border border-border/40 hover:border-accent/40 transition-all group relative overflow-hidden shadow-2xl">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center p-2 shadow-xl shadow-black/40 mx-auto transition-transform hover:scale-110">
                                <img src="/images/33.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                        </Link>
                        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-tight">Club 33 <br /><span className="text-secondary text-sm">Churrinches gen 2017</span></h1>
                        <p className="text-slate-300 mt-2 font-medium">Panel de Gestión Administrativa</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Usuario o Correo</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ej: juanperez o correo@ejemplo.com"
                                    className="w-full bg-slate-900/40 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-white uppercase tracking-widest">Contraseña</label>
                                <button
                                    type="button"
                                    onClick={() => setIsForgotModalOpen(true)}
                                    className="text-[10px] font-bold text-secondary hover:text-white transition-colors uppercase"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/40 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-500"
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

                <footer className="mt-12 text-slate-400 text-xs text-center opacity-70">
                    Desarrollado por OSKIMARK© 2026 Gestión Pro Equipo -v1.15 Potenciando el futuro del deporte.
                </footer>
            </div>

            {/* Forgot Password Modal */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[32px] border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-foreground italic uppercase tracking-tighter">Recuperar Acceso</h2>
                                <button onClick={() => setIsForgotModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <p className="text-sm text-muted-foreground">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

                                {resetMessage && (
                                    <div className={`p-4 rounded-xl text-xs font-bold ${resetMessage.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                        {resetMessage.text}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Correo Electrónico</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full bg-slate-50 border border-border rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-accent/40 transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="w-full h-14 bg-secondary hover:bg-secondary/90 text-primary rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-secondary/20"
                                >
                                    {resetLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Enlace"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
