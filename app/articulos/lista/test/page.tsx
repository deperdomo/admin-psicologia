import { Metadata } from 'next'
import TestListaArticulosClient from '../TestListaArticulosClient'

export const metadata: Metadata = {
  title: 'Test Lista de Artículos - Administración',
  description: 'Test de filtros para la gestión de artículos del blog',
}

export default function TestListaArticulosPage() {
  return <TestListaArticulosClient />
}