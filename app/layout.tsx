
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Psicología - Gestión de Recursos",
  description: "Sistema de administración para recursos de psicología",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Psicología
                </h1>
                <nav className="flex space-x-4">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Inicio
                  </Link>
                  <Link href="/recursos/lista" className="text-gray-600 hover:text-gray-900">
                    Lista de Recursos
                  </Link>
                  <Link href="/recursos/nuevo" className="text-blue-600 hover:text-blue-800 font-medium">
                    Nuevo Recurso
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
