import { Metadata } from 'next'

import ListaRecursosClient from './ListaRecursosClient'

export const metadata: Metadata = {
  title: 'Lista de Recursos - Admin Psicología',
  description: 'Gestionar recursos de psicología existentes',
}

export default function ListaRecursosPage() {
  return <ListaRecursosClient />;
}
