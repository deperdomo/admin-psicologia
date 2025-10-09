import { Metadata } from 'next'
import ListaDiasBloqueadosClient from './ListaDiasBloqueadosClient'

export const metadata: Metadata = {
  title: 'Días Bloqueados | Admin Psicología',
  description: 'Gestiona los días y horarios bloqueados',
}

export default function ListaDiasBloqueadosPage() {
  return <ListaDiasBloqueadosClient />
}
