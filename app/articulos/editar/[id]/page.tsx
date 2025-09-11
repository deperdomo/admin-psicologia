import { Metadata } from 'next'
import EditarArticuloClient from './EditarArticuloClient'

export const metadata: Metadata = {
  title: 'Editar Artículo - Administración',
  description: 'Editar artículo del blog de psicología infantil',
}

interface Props {
  params: { id: string }
}

export default function EditarArticuloPage({ params }: Props) {
  return <EditarArticuloClient id={params.id} />
}
