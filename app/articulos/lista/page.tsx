import { Metadata } from 'next'
import ListaArticulosClient from './ListaArticulosClient'

export const metadata: Metadata = {
  title: 'Lista de Artículos - Administración',
  description: 'Gestionar artículos del blog de psicología infantil',
}

export default function ListaArticulosPage() {
  return <ListaArticulosClient />
}
