"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { UserProfile } from "@/types";

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        async function getProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();

                    // Si no hay perfil o está suspendido, y no estamos en una página pública
                    const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/suspended";

                    if (!data || data.status === 'suspended') {
                        if (!isPublicPage) {
                            router.push("/suspended");
                        }
                    }

                    if (data) {
                        setProfile(data);
                    }
                } else {
                    // Si no hay usuario de auth y no es página pública, al login
                    const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/suspended";
                    if (!isPublicPage) {
                        router.push("/login");
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        }

        getProfile();
    }, [pathname]);

    useEffect(() => {
        if (!profile?.id) return;

        // Mark as online
        const markOnline = async () => {
            await supabase
                .from("profiles")
                .update({
                    is_online: true,
                    last_seen: new Date().toISOString()
                })
                .eq("id", profile.id);
        };

        markOnline();

        // Optional: Mark as offline on window close/unmount
        const markOffline = async () => {
            await supabase
                .from("profiles")
                .update({ is_online: false })
                .eq("id", profile.id);
        };

        window.addEventListener("beforeunload", markOffline);

        return () => {
            markOffline();
            window.removeEventListener("beforeunload", markOffline);
        };
    }, [profile?.id]);

    return { profile, loading };
}
