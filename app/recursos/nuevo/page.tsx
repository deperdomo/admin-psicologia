import { Metadata } from 'next'
import { NuevoRecursoClient } from './NuevoRecursoClient'

export const metadata: Metadata = {
  title: 'Nuevo Recurso - Admin Psicología',
  description: 'Crear un nuevo recurso de psicología',
}

export default function NuevoRecursoPage() {
  return <NuevoRecursoClient />;
}