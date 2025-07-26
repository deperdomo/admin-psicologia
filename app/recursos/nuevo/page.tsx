import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuevo Recurso - Admin Psicología',
  description: 'Crear un nuevo recurso de psicología',
}

export default function NuevoRecursoPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Recurso</h1>
        <p className="text-gray-600 mt-2">
          Completa la información para crear un nuevo recurso de psicología
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Aquí irá el formulario RecursoForm */}
        <p className="text-gray-500 text-center py-8">
          Formulario en construcción...
        </p>
      </div>
    </div>
  )
}