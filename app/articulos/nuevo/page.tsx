import { Metadata } from 'next'
import NuevoArticuloClient from './NuevoArticuloClient'

export const metadata: Metadata = {
  title: 'Nuevo Artículo - Administración',
  description: 'Crear un nuevo artículo para el blog de psicología infantil',
}

export default function NuevoArticuloPage() {
  return <NuevoArticuloClient />
}
