"use client";

import { useState } from "react";
import { Player } from "@/types";
import { X, Printer, MessageCircle, Copy, CheckCircle2, ChevronRight, FileDown } from "lucide-react";
import { generateWhatsAppLink, getDocStatus, calculateAge } from "@/utils/playerUtils";

interface PlayerReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    player: Player | null;
}

export default function PlayerReportModal({ isOpen, onClose, player }: PlayerReportModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [sections, setSections] = useState({
        personal: true,
        contact: true,
        gear: true,
        docs: true,
    });
    const [copied, setCopied] = useState(false);

    if (!isOpen || !player) return null;

    const toggleSection = (key: keyof typeof sections) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const generateReportText = () => {
        let text = `*📋 REPORTE DE JUGADOR*\n*CLUB 33 Churrinches gen 2017*\n\n`;

        if (sections.personal) {
            text += `👤 *DATOS PERSONALES*\n`;
            text += `Nombre: ${player.full_name}\n`;
            text += `Dorsal: ${player.shirt_number || '-'}\n`;
            text += `Edad: ${calculateAge(player.birth_date)} años\n`;
            text += `Posición: ${player.position || '-'}\n\n`;
        }

        if (sections.contact) {
            text += `📞 *CONTACTO*\n`;
            if (player.mother_name) text += `Madre: ${player.mother_name} (${player.mother_phone})\n`;
            if (player.father_name) text += `Padre: ${player.father_name} (${player.father_phone})\n`;
            if (player.referent_name) text += `Referente: ${player.referent_name} (${player.referent_phone})\n`;
            if (player.address) text += `Dirección: ${player.address}\n`;
            text += `\n`;
        }

        if (sections.gear) {
            text += `👕 *INDUMENTARIA*\n`;
            text += `Camiseta: ${player.shirt_size || '-'}\n`;
            text += `Short: ${player.short_size || '-'}\n`;
            text += `Medias: ${player.socks_size || '-'}\n`;
            text += `Camiseta (Larga): ${player.long_jersey_size || '-'}\n`;
            text += `Short (Largo): ${player.long_shorts_size || '-'}\n`;
            text += `Campera: ${player.jacket_size || '-'}\n`;
            text += `Calzado: ${player.shoe_size || '-'}\n\n`;
        }

        if (sections.docs) {
            text += `📁 *DOCUMENTACIÓN*\n`;
            const ciStatus = getDocStatus(player.id_card_expiry);
            const healthStatus = getDocStatus(player.health_card_expiry);
            text += `Cédula: ${player.id_card_num || '-'} (${ciStatus.label})\n`;
            text += `Ficha Médica: ${healthStatus.label}\n`;
        }

        return text;
    };

    const handleCopy = () => {
        const text = generateReportText();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const text = generateReportText();
        // Fallback to mother -> father -> referent, or just open generic link with text
        const phone = player.mother_phone || player.father_phone || player.referent_phone;
        const link = generateWhatsAppLink(phone || "", text);

        if (link && phone) {
            window.open(link, '_blank');
        } else {
            // If no phone, just open WhatsApp share
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0">
            <div className="bg-white dark:bg-slate-950 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-border/50 print:border-none print:shadow-none print:max-w-none print:h-auto print:max-h-none print:rounded-none">

                {/* Header (Hidden in Print) */}
                <div className="flex items-center justify-between p-6 border-b border-border/10 bg-slate-50 dark:bg-white/5 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl">
                            <FileDown className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Reporte de Jugador</h2>
                            <p className="text-sm text-muted-foreground">{player.full_name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto print:p-8 print:overflow-visible">
                    {step === 1 ? (
                        <div className="space-y-6 print:hidden">
                            <p className="text-sm text-muted-foreground">Selecciona qué secciones deseas incluir en el reporte de este jugador.</p>

                            <div className="grid gap-3">
                                <label className="flex items-center justify-between p-4 rounded-xl border border-border/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">Datos Personales</span>
                                        <span className="text-xs text-muted-foreground">Edad, dorsal, posición</span>
                                    </div>
                                    <input type="checkbox" checked={sections.personal} onChange={() => toggleSection('personal')} className="h-5 w-5 rounded border-border text-secondary focus:ring-secondary/50 bg-slate-100 dark:bg-slate-900" />
                                </label>

                                <label className="flex items-center justify-between p-4 rounded-xl border border-border/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">Contacto</span>
                                        <span className="text-xs text-muted-foreground">Teléfonos y dirección de los padres</span>
                                    </div>
                                    <input type="checkbox" checked={sections.contact} onChange={() => toggleSection('contact')} className="h-5 w-5 rounded border-border text-secondary focus:ring-secondary/50 bg-slate-100 dark:bg-slate-900" />
                                </label>

                                <label className="flex items-center justify-between p-4 rounded-xl border border-border/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">Indumentaria</span>
                                        <span className="text-xs text-muted-foreground">Talles de equipo corto y largo</span>
                                    </div>
                                    <input type="checkbox" checked={sections.gear} onChange={() => toggleSection('gear')} className="h-5 w-5 rounded border-border text-secondary focus:ring-secondary/50 bg-slate-100 dark:bg-slate-900" />
                                </label>

                                <label className="flex items-center justify-between p-4 rounded-xl border border-border/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">Documentación</span>
                                        <span className="text-xs text-muted-foreground">Estado de CI y Ficha Médica</span>
                                    </div>
                                    <input type="checkbox" checked={sections.docs} onChange={() => toggleSection('docs')} className="h-5 w-5 rounded border-border text-secondary focus:ring-secondary/50 bg-slate-100 dark:bg-slate-900" />
                                </label>
                            </div>

                            <button onClick={() => setStep(2)} className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white p-4 rounded-xl font-bold transition-all shadow-md mt-4">
                                Previsualizar Reporte
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Preview Area (This gets printed) */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/40 whitespace-pre-wrap font-mono text-sm print:bg-white print:border-none print:p-0 print:text-black print:text-base">
                                {generateReportText()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions (Hidden in Print) */}
                {step === 2 && (
                    <div className="p-6 border-t border-border/10 bg-slate-50 dark:bg-white/5 flex flex-col sm:flex-row gap-3 print:hidden">
                        <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-foreground bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-border hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors sm:w-auto w-full text-center">
                            Volver
                        </button>

                        <div className="flex-1 flex flex-col sm:flex-row gap-3 justify-end">
                            <button onClick={handleCopy} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-300 border border-border hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                {copied ? "Copiado" : "Copiar"}
                            </button>
                            <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all shadow-sm">
                                <Printer className="h-5 w-5" />
                                Imprimir / PDF
                            </button>
                            <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-md">
                                <MessageCircle className="h-5 w-5" />
                                WhatsApp
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
