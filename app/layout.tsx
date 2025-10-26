
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Psicología - Gestión de Recursos",
  description: "Sistema de administración para recursos de psicología",
  icons: {
    icon: '/logo.webp',
    shortcut: '/logo.webp',
    apple: '/logo.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-3">
                  <Image 
                    src="/logo.webp" 
                    alt="Logo Psicología" 
                    width={40} 
                    height={40}
                    className="rounded-lg"
                  />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Admin Psicología
                  </h1>
                </div>
                <nav className="flex space-x-4">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Inicio
                  </Link>
                  <Link href="/recursos/lista" className="text-gray-600 hover:text-gray-900">
                    Recursos
                  </Link>
                  <Link href="/articulos/lista" className="text-gray-600 hover:text-gray-900">
                    Artículos
                  </Link>
                  <Link href="/recursos/nuevo" className="text-blue-600 hover:text-blue-800 font-medium">
                    + Recurso
                  </Link>
                  <Link href="/articulos/nuevo" className="text-purple-600 hover:text-purple-800 font-medium">
                    + Artículo
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
