import type { Metadata } from "next";
import "./globals.css";
import "./academy-theme.css";
export const metadata: Metadata = {
  title: "Poker Study Lab",
  description:
    "Academia privada de estudio de cash Hold’em. Fuentes, práctica y progreso.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
