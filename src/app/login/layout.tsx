import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Iniciar Sesión | Club 33",
    description: "Accede al panel de gestión del Club 33 Churrinches.",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
