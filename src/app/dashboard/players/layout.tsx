import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestión de Jugadores | Club 33",
    description: "Panel de administración de jugadores del Club 33 - Churrinches gen 2017.",
};

export default function PlayersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
