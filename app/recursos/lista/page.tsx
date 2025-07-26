import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lista de Recursos - Admin Psicología',
  description: 'Gestionar recursos de psicología existentes',
}

export default function ListaRecursosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lista de Recursos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona y visualiza todos los recursos existentes
          </p>
        </div>
        <a 
          href="/recursos/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo Recurso
        </a>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Aquí irá la tabla de recursos */}
        <p className="text-gray-500 text-center py-8">
          Lista de recursos en construcción...
        </p>
      </div>
    </div>
  )
}