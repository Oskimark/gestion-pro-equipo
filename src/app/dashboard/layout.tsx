"use client";

import Sidebar from "@/components/Sidebar";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile, loading } = useProfile();

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 border-b border-border bg-card flex items-center justify-between px-8 z-20">
                    <h2 className="text-xl font-bold text-foreground">
                        Panel de Control
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            {loading ? (
                                <div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div>
                            ) : (
                                <>
                                    <p className="text-sm font-bold text-foreground leading-none">
                                        {profile?.full_name || "Usuario"}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1">
                                        {profile?.role === 'admin' ? 'Administrador' : 'Ayudante'}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border-2 border-white/20 shadow-sm">
                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/20">
                    {children}
                </main>
            </div>
        </div>
    );
}
