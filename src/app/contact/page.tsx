"use client";

import { useState } from "react";
import { Mail, User, Phone, MessageSquare, Send, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // This is a mockup for now as per frontend request. 
        // In a real app we'd use an API route or EmailJS.
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary p-6 relative">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img src="/images/stadium-bg.png" alt="bg" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10 w-full max-w-md">
                    <div className="glass-morphism rounded-3xl border border-white/10 p-10 text-center shadow-2xl">
                        <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-secondary" />
                        </div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Mensaje Enviado</h2>
                        <p className="text-slate-300 mt-4 font-medium leading-relaxed">
                            Gracias por contactar con CLUB 33 Churrinches gen 2017.
                            Nos pondremos en contacto contigo en breve.
                        </p>
                        <Link href="/" className="btn-secondary w-full mt-8 flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-6 relative overflow-hidden">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <img src="/images/stadium-bg.png" alt="stadium" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/90 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">Volver</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <img src="/images/33.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="text-white font-black italic tracking-tighter text-lg leading-tight">CLUB 33 <br /><span className="text-[10px] text-secondary uppercase block">Churrinches gen 2017</span></span>
                    </div>
                </div>

                <div className="glass-morphism rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Contáctanos</h1>
                        <p className="text-slate-300 mt-2 font-medium">Club 33 Churrinches gen 2017</p>
                        <p className="text-xs text-secondary/80 font-bold uppercase tracking-widest mt-1">Hacia: elnona@gmail.com</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white uppercase tracking-widest ml-1 opacity-70">Nombre</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Tu nombre"
                                        className="w-full bg-slate-900/40 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white uppercase tracking-widest ml-1 opacity-70">Teléfono</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="099..."
                                        className="w-full bg-slate-900/40 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-widest ml-1 opacity-70">Mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="correo@ejemplo.com"
                                    className="w-full bg-slate-900/40 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-widest ml-1 opacity-70">Mensaje</label>
                            <div className="relative group">
                                <MessageSquare className="absolute left-4 top-6 h-5 w-5 text-slate-500 group-focus-within:text-secondary transition-colors" />
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Escribe tu mensaje aquí..."
                                    className="w-full bg-slate-900/40 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-600 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-secondary h-14 flex items-center justify-center gap-3 text-lg mt-8 font-black uppercase tracking-widest"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : (
                                <>
                                    Enviar Mensaje
                                    <Send className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
