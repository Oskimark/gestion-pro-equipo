"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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

                    if (data) {
                        setProfile(data);
                    } else {
                        // Fallback to metadata if profile doesn't exist yet
                        setProfile({
                            id: user.id,
                            full_name: user.user_metadata?.full_name || "Usuario",
                            role: "ayudante"
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        }

        getProfile();
    }, []);

    return { profile, loading };
}
