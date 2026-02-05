import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

// Tipografía Inter - limpia y moderna
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusCafe - Dashboard",
  description: "Sistema de reportes para cafetería universitaria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Fondo crema suave - Coffee Theme */}
      <body className={`${inter.variable} font-sans antialiased bg-[#FDFBF7]`}>
        {/* Sidebar fijo a la izquierda */}
        <Sidebar />

        {/* Contenido principal con margen para el sidebar */}
        <main className="ml-64 min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
