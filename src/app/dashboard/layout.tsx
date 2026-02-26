import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 border-b border-border bg-card flex items-center justify-between px-8 z-20">
                    <h2 className="text-xl font-bold text-foreground">
                        Panel de Administración
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-foreground leading-none">Admin User</p>
                            <p className="text-xs text-muted-foreground mt-1">Administrador</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 border border-border overflow-hidden">
                            {/* User Avatar Placeholder */}
                            <div className="w-full h-full flex items-center justify-center bg-accent text-white font-bold">A</div>
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
