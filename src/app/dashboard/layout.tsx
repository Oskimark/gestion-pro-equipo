"use client";

import Sidebar from "@/components/Sidebar";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, Menu, Bell, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { playerService } from "@/services/playerService";
import { getDocStatus } from "@/utils/playerUtils";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile, loading } = useProfile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const players = await playerService.getAll();
                let count = 0;
                players.forEach(p => {
                    if (getDocStatus(p.id_card_expiry).label !== 'Al día') count++;
                    if (getDocStatus(p.health_card_expiry).label !== 'Al día') count++;
                });
                setAlertCount(count);
            } catch (error) {
                console.error("Error fetching alerts for layout:", error);
            }
        };
        fetchAlerts();
    }, []);

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 border-b border-border bg-card flex items-center justify-between px-4 sm:px-8 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 lg:hidden text-foreground"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-xl font-bold text-foreground truncate">
                            Panel de Control
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground transition-colors relative group">
                            <Bell className="h-5 w-5 group-hover:shake transition-all" />
                            {alertCount > 0 && (
                                <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                                    {alertCount}
                                </span>
                            )}
                        </Link>

                        <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-border/50">
                            <div className="text-right hidden sm:block">
                                {loading ? (
                                    <div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-foreground leading-none">
                                            {profile?.full_name || "Usuario"}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1">
                                            {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'visitante' ? 'Visitante' : 'Ayudante'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border-2 border-white/20 shadow-sm shrink-0">
                                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50 dark:bg-slate-950/20">
                    {children}
                </main>
            </div>
        </div>
    );
}
