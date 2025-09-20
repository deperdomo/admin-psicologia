import { Metadata } from 'next'
import EditarArticuloClient from './EditarArticuloClient'

export const metadata: Metadata = {
  title: 'Editar Artículo - Administración',
  description: 'Editar artículo del blog de psicología infantil',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarArticuloPage({ params }: Props) {
  const { id } = await params
  return <EditarArticuloClient id={id} />
}
