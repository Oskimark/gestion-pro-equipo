import { Check, X, AlertTriangle, LucideIcon } from "lucide-react";

export type DocStatus = 'Al día' | 'Vencido' | 'Por vencer' | 'Faltante';

export interface StatusUI {
    icon: LucideIcon;
    color: string;
    label: DocStatus;
}

export const getDocStatus = (expiryDate?: string, alertDays: number = 30): StatusUI => {
    if (!expiryDate) return { icon: X, color: "text-red-500 bg-red-500/10", label: "Faltante" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);

    // Calculate the alert threshold date (e.g. 30 days before expiry)
    const alertThreshold = new Date(expiry);
    alertThreshold.setDate(expiry.getDate() - alertDays);

    if (expiry < today) {
        return { icon: AlertTriangle, color: "text-red-600 bg-red-600/10", label: "Vencido" };
    } else if (today >= alertThreshold) {
        return { icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10", label: "Por vencer" };
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

export const generateWhatsAppLink = (phone?: string, message?: string): string | null => {
    if (!phone) return null;

    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Format for Uruguay (+598) specifically
    if (cleaned.length === 9 && cleaned.startsWith('09')) {
        cleaned = `598${cleaned.substring(1)}`;
    } else if (cleaned.length === 8 && cleaned.startsWith('9')) {
        cleaned = `598${cleaned}`;
    }

    if (cleaned.length < 10) return null;

    let url = `https://wa.me/${cleaned}`;
    if (message) {
        url += `?text=${encodeURIComponent(message)}`;
    }
    return url;
};
