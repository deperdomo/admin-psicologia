import { Metadata } from 'next'
import { Suspense } from 'react'
import NuevoDiaBloqueadoClient from './NuevoDiaBloqueadoClient'

export const metadata: Metadata = {
  title: 'Bloquear Día | Admin Psicología',
  description: 'Bloquear días y horarios',
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function NuevoDiaBloqueadoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NuevoDiaBloqueadoClient />
    </Suspense>
  )
}
