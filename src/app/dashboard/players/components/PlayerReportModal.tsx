"use client";

import { useState } from "react";
import { Player } from "@/types";
import { X, Printer, MessageCircle, Copy, CheckCircle2, ChevronRight, FileDown, User, FileText } from "lucide-react";
import { generateWhatsAppLink, getDocStatus, calculateAge } from "@/utils/playerUtils";

interface PlayerReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    player: Player | null;
}

export default function PlayerReportModal({ isOpen, onClose, player }: PlayerReportModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [format, setFormat] = useState<'text' | 'printable'>('text');
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
        const phone = player.mother_phone || player.father_phone || player.referent_phone;
        const link = generateWhatsAppLink(phone || "", text);

        if (link && phone) {
            window.open(link, '_blank');
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0 print:static print:block overflow-y-auto">
            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body { background: white !important; }
                    .print-break-inside-avoid { break-inside: avoid; }
                }
            `}</style>

            <div className="bg-white dark:bg-slate-950 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden border border-border/50 print:border-none print:shadow-none print:max-w-none print:h-auto print:rounded-none my-auto">

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
                <div className="p-6 overflow-y-auto print:p-0 print:overflow-visible">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">1. Formato del Reporte</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setFormat('text')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${format === 'text' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-border/40 hover:border-border text-muted-foreground'}`}
                                    >
                                        <Copy className="h-6 w-6" />
                                        <span className="font-bold">Texto (WhatsApp)</span>
                                    </button>
                                    <button
                                        onClick={() => setFormat('printable')}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${format === 'printable' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-border/40 hover:border-border text-muted-foreground'}`}
                                    >
                                        <Printer className="h-6 w-6" />
                                        <span className="font-bold">Imprimible (PDF)</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">2. Secciones a incluir</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { id: 'personal', label: 'Datos Personales', desc: 'Edad, dorsal, posición' },
                                        { id: 'contact', label: 'Contacto', desc: 'Padres y teléfonos' },
                                        { id: 'gear', label: 'Indumentaria', desc: 'Talles de equipo' },
                                        { id: 'docs', label: 'Documentación', desc: 'Estado de CI y Ficha' },
                                    ].map((s) => (
                                        <label key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-border/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground text-sm">{s.label}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-medium">{s.desc}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={sections[s.id as keyof typeof sections]}
                                                onChange={() => toggleSection(s.id as keyof typeof sections)}
                                                className="h-5 w-5 rounded border-border text-secondary focus:ring-secondary/50"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => setStep(2)} className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white p-4 rounded-xl font-bold transition-all shadow-lg mt-4 shadow-secondary/20">
                                Previsualizar Reporte
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {format === 'text' ? (
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/40 whitespace-pre-wrap font-mono text-xs print:hidden">
                                    {generateReportText()}
                                </div>
                            ) : (
                                <div className="bg-white text-black p-0 sm:p-4 print:p-0">
                                    {/* Printable Layout */}
                                    <div className="border-[3px] border-primary p-8 rounded-[40px] print:border-none print:p-0">
                                        {/* Logo and Header */}
                                        <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center p-2">
                                                    <img src="/images/33.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                                                </div>
                                                <div>
                                                    <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Club 33 Churrinches</h1>
                                                    <p className="text-secondary font-bold text-sm uppercase tracking-widest">Generación 2017 • Reporte oficial</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha de emisión</p>
                                                <p className="font-black text-slate-600">{new Date().toLocaleDateString('es-ES')}</p>
                                            </div>
                                        </div>

                                        {/* Player Profile Header */}
                                        <div className="flex flex-col md:flex-row gap-8 mb-10 items-center md:items-start print-break-inside-avoid">
                                            <div className="h-48 w-48 rounded-[32px] overflow-hidden bg-slate-100 border-4 border-slate-50 shrink-0 shadow-xl">
                                                {player.photo_url ? (
                                                    <img src={player.photo_url} alt={player.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <User className="h-20 w-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-4 text-center md:text-left">
                                                <div>
                                                    <h2 className="text-4xl font-black text-primary italic uppercase tracking-tighter leading-tight">{player.full_name}</h2>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                                                        <span className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full font-black text-sm uppercase italic tracking-widest">
                                                            #{player.shirt_number || 'N/A'}
                                                        </span>
                                                        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-widest">
                                                            {player.position || 'Sin Posición'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Edad Actual</p>
                                                        <p className="text-xl font-black text-slate-700">{calculateAge(player.birth_date)} años</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha Nac.</p>
                                                        <p className="text-xl font-black text-slate-700">{player.birth_date ? new Date(player.birth_date).toLocaleDateString('es-ES') : '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sections Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {sections.contact && (
                                                <div className="space-y-4 print-break-inside-avoid shadow-sm rounded-3xl p-6 border border-slate-50">
                                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary border-b pb-2">Información de Contacto</h4>
                                                    <div className="space-y-3">
                                                        {player.mother_name && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Madre</p>
                                                                <p className="font-bold text-slate-700">{player.mother_name} <span className="text-secondary ml-1">• {player.mother_phone}</span></p>
                                                            </div>
                                                        )}
                                                        {player.father_name && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Padre</p>
                                                                <p className="font-bold text-slate-700">{player.father_name} <span className="text-secondary ml-1">• {player.father_phone}</span></p>
                                                            </div>
                                                        )}
                                                        {player.referent_name && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referente</p>
                                                                <p className="font-bold text-slate-700">{player.referent_name} <span className="text-secondary ml-1">• {player.referent_phone}</span></p>
                                                            </div>
                                                        )}
                                                        {player.address && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Domicilio</p>
                                                                <p className="font-bold text-slate-700 leading-tight">{player.address}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {sections.gear && (
                                                <div className="space-y-4 print-break-inside-avoid shadow-sm rounded-3xl p-6 border border-slate-50">
                                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b pb-2">Planilla de Indumentaria</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-slate-50 p-3 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Camiseta</p>
                                                            <p className="text-xl font-black text-primary text-center tracking-tighter italic">{player.shirt_size || '-'}</p>
                                                        </div>
                                                        <div className="bg-slate-50 p-3 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Short</p>
                                                            <p className="text-xl font-black text-primary text-center tracking-tighter italic">{player.short_size || '-'}</p>
                                                        </div>
                                                        <div className="bg-slate-50 p-3 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Medias</p>
                                                            <p className="text-xl font-black text-primary text-center tracking-tighter italic">{player.socks_size || '-'}</p>
                                                        </div>
                                                        <div className="bg-slate-50 p-3 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Calzado</p>
                                                            <p className="text-xl font-black text-primary text-center tracking-tighter italic text-secondary">{player.shoe_size || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {sections.docs && (
                                            <div className="mt-8 space-y-6">
                                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b pb-2 flex items-center justify-between">
                                                    Documentación Respaldada
                                                    <span className="text-[10px] font-bold text-slate-300">Impedimentos o alertas</span>
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                                                    {/* Document Entry */}
                                                    <div className="print-break-inside-avoid">
                                                        <div className="flex items-center justify-between mb-3 px-2">
                                                            <h5 className="font-bold text-slate-700">Cédula de Identidad</h5>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getDocStatus(player.id_card_expiry).color.split(' ')[1].replace('10', '20')}`}>
                                                                {getDocStatus(player.id_card_expiry).label}
                                                            </span>
                                                        </div>
                                                        <div className="aspect-[1.58/1] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                                            {player.id_card_url ? (
                                                                <img src={player.id_card_url} alt="CI front" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FileText className="h-10 w-10 text-slate-200" />
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-2 text-center uppercase tracking-widest italic">Nº: {player.id_card_num || 'S/D'} • VENCE: {player.id_card_expiry ? new Date(player.id_card_expiry).toLocaleDateString() : 'S/D'}</p>
                                                    </div>

                                                    {/* Document Entry */}
                                                    <div className="print-break-inside-avoid">
                                                        <div className="flex items-center justify-between mb-3 px-2">
                                                            <h5 className="font-bold text-slate-700">Ficha Médica</h5>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getDocStatus(player.health_card_expiry).color.split(' ')[1].replace('10', '20')}`}>
                                                                {getDocStatus(player.health_card_expiry).label}
                                                            </span>
                                                        </div>
                                                        <div className="aspect-[1.58/1] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                                            {player.health_card_url ? (
                                                                <img src={player.health_card_url} alt="Health Card" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FileText className="h-10 w-10 text-slate-200" />
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-2 text-center uppercase tracking-widest italic">CONTROL MÉDICO • VENCE: {player.health_card_expiry ? new Date(player.health_card_expiry).toLocaleDateString() : 'S/D'}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-900 p-6 rounded-[24px] text-white print-break-inside-avoid">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mutualista / Salud</p>
                                                            <p className="font-bold">{player.health_insurance || 'No informada'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Alergias / Notas Médicas</p>
                                                            <p className="text-sm font-medium text-slate-300 italic">"{player.allergies || 'Sin observaciones registradas'}"</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Simple footer for print */}
                                        <div className="mt-12 text-center border-t border-slate-100 pt-8 opacity-40">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Documento generado por Antigravity Systems • Club 33</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions (Hidden in Print) */}
                {step === 2 && (
                    <div className="p-6 border-t border-border/10 bg-slate-50 dark:bg-white/5 flex flex-col sm:flex-row gap-3 print:hidden">
                        <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-foreground bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-border hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors sm:w-auto w-full text-center">
                            Ajustar Datos
                        </button>

                        <div className="flex-1 flex flex-col sm:flex-row gap-3 justify-end">
                            {format === 'text' ? (
                                <>
                                    <button onClick={handleCopy} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-300 border border-border hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                        {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                        {copied ? "Copiado" : "Copiar Texto"}
                                    </button>
                                    <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-md sm:flex-1">
                                        <MessageCircle className="h-5 w-5" />
                                        Enviar por WhatsApp
                                    </button>
                                </>
                            ) : (
                                <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto overflow-hidden relative group">
                                    <Printer className="h-5 w-5 group-hover:scale-125 transition-transform" />
                                    Generar PDF / Imprimir
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
