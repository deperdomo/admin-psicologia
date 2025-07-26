import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar Recurso - Admin Psicología',
  description: 'Editar recurso de psicología existente',
}




export default function EditarRecursoPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Editar Recurso
        </h1>
        <p className="text-gray-600 mt-2">
          Modificar información del recurso ID: {params.id}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Aquí irá el formulario RecursoForm pre-poblado */}
        <p className="text-gray-500 text-center py-8">
          Formulario de edición en construcción...
        </p>
      </div>
    </div>
  )
}