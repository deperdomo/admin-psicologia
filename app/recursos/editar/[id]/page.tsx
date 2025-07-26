import { Metadata } from 'next'
import { EditarRecursoClient } from './EditarRecursoClient'

export const metadata: Metadata = {
  title: 'Editar Recurso - Admin Psicología',
  description: 'Editar recurso de psicología existente',
}


export default function EditarRecursoPage({ params }: { params: { id: string } }) {
  return <EditarRecursoClient id={params.id} />;
}