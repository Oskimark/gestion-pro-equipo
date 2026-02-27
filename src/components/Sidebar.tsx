"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    CreditCard,
    Calendar,
    Settings,
    LayoutDashboard,
    LogOut,
    UserCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Jugadores", href: "/dashboard/players", icon: Users },
    { name: "Pagos", href: "/dashboard/payments", icon: CreditCard },
    { name: "Partidos", href: "/dashboard/matches", icon: Calendar },
    { name: "Usuarios", href: "/dashboard/users", icon: UserCircle },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="flex h-full w-64 flex-col bg-primary text-white">
            <div className="flex h-20 items-center justify-center border-b border-white/10 px-6">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                        <img src="/images/logo.png" alt="Logo 33" className="w-full h-full object-contain" onError={(e) => {
                            // Fallback if image not found
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<span class="font-black text-primary text-xl">33</span>';
                        }} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white group-hover:text-secondary transition-colors">
                        CLUB <span className="text-secondary group-hover:text-white">33</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-6">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive
                                ? "bg-secondary text-primary shadow-lg shadow-secondary/10"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-slate-500 group-hover:text-secondary transition-colors"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
