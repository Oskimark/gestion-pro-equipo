import { Check, X, AlertTriangle, LucideIcon } from "lucide-react";

export type DocStatus = 'Al día' | 'Vencido' | 'Faltante';

export interface StatusUI {
    icon: LucideIcon;
    color: string;
    label: DocStatus;
}

export const getDocStatus = (expiryDate?: string): StatusUI => {
    if (!expiryDate) return { icon: X, color: "text-red-500 bg-red-500/10", label: "Faltante" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);

    if (expiry < today) {
        return { icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10", label: "Vencido" };
    }
    return { icon: Check, color: "text-green-500 bg-green-500/10", label: "Al día" };
};

export const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age.toString();
};
