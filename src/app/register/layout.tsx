import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Registro de Personal | Club 33",
    description: "Crea una cuenta para gestionar el Club 33 Churrinches.",
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
