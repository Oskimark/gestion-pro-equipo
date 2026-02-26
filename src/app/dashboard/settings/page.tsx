import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">Configuración</h1>
                <p className="text-muted-foreground">Ajustes del sistema y control de usuarios.</p>
            </div>

            <div className="glass-morphism rounded-3xl border border-border/40 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-6">
                    <SettingsIcon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Módulo en Desarrollo</h3>
                <p className="text-muted-foreground max-w-md">
                    Estamos trabajando en las opciones de configuración de roles, perfiles y preferencias del club.
                </p>
            </div>
        </div>
    );
}
