import Link from 'next/link'
import { PlusCircle, List, FileText } from 'lucide-react'
import HomeAuthClient from './HomeAuthClient'

export default function HomePage() {
  return (
    <HomeAuthClient>
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
          <Link 
            href="/documentos"
            className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
              <h3 className="text-xl font-semibold text-gray-900">Documentos</h3>
            </div>
            <p className="text-gray-600">
              Accede a los documentos subidos y gestionados en el sistema.
            </p>
          </Link>
        </div>
      </div>
    </HomeAuthClient>
  )
}
