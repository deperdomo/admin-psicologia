import Link from 'next/link'
import { PlusCircle, List, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema de Administración de Recursos
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gestiona y administra recursos de psicología de manera eficiente. 
          Sube documentos, organiza por categorías y mantén todo centralizado.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Link 
          href="/recursos/nuevo"
          className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <PlusCircle className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
            <h3 className="text-xl font-semibold text-gray-900">Nuevo Recurso</h3>
          </div>
          <p className="text-gray-600">
            Crea y sube nuevos recursos de psicología con documentos Word y PDF.
          </p>
        </Link>

        <Link 
          href="/recursos/lista"
          className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <List className="h-8 w-8 text-green-600 group-hover:text-green-700" />
            <h3 className="text-xl font-semibold text-gray-900">Lista de Recursos</h3>
          </div>
          <p className="text-gray-600">
            Visualiza, edita y gestiona todos los recursos existentes en el sistema.
          </p>
        </Link>

        <div className="group block p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Estadísticas</h3>
          </div>
          <p className="text-gray-600">
            Próximamente: visualiza estadísticas y métricas de uso de los recursos.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ¿Cómo empezar?
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Haz clic en &quot;Nuevo Recurso&quot; para crear tu primer recurso</li>
          <li>Completa la información obligatoria del formulario</li>
          <li>Sube los archivos Word y/o PDF correspondientes</li>
          <li>Guarda y visualiza tu recurso en la lista</li>
        </ol>
      </div>
    </div>
  )
}
