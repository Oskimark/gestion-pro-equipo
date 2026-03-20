"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        setError(null);

        const { error: resetError } = await supabase.auth.updateUser({
            password: password
        });

        if (resetError) {
            setError("Error al restablecer la contraseña. El enlace puede haber expirado.");
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-6 overflow-hidden relative">
            <div className="absolute inset-0 z-0">
                <img src="/images/stadium-bg.png" alt="stadium" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white p-8 md:p-10 rounded-3xl border border-border/40 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center p-2 mb-4 mx-auto">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Nueva Contraseña</h1>
                        <p className="text-muted-foreground mt-2 font-medium">Define tu nueva clave de acceso</p>
                    </div>

                    {success ? (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-6 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="h-12 w-12 mx-auto" />
                            <p className="font-bold">¡Contraseña actualizada con éxito!</p>
                            <p className="text-xs">Redirigiendo al login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Contraseña Nueva</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-border rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-bold text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-border rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secondary hover:bg-secondary/90 text-primary h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-secondary/20 transition-all"
                            >
                                {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
                                    <>
                                        Actualizar Contraseña
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
