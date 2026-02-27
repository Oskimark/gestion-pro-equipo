import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestión de Personal | Club 33",
    description: "Panel de administración de personal y permisos del Club 33.",
};

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
