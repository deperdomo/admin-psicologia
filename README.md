# 📋 Sistema de Administración de Recursos - Psicología

Sistema web para gestionar y administrar recursos de psicología (PDFs y documentos Word) con integración a Supabase.

## 🚀 Características

- ✅ Interfaz moderna con Next.js 14+ y TypeScript
- ✅ Diseño responsivo con Tailwind CSS
- ✅ Componentes UI con shadcn/ui
- ✅ Integración con Supabase (PostgreSQL + Storage)
- ✅ Validación de formularios con Zod
- ✅ Subida de archivos con validación
- ✅ Gestión completa de recursos (CRUD)

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Almacenamiento**: Supabase Storage
- **Validación**: Zod + React Hook Form

## 📦 Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Actualiza las variables en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

5. Ejecuta el proyecto:
```bash
npm run dev
```

## 🗂️ Estructura del Proyecto

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
