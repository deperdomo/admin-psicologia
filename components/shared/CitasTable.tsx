import { CheckCircle, XCircle, Eye, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Appointment } from '@/types/database'

interface CitasTableProps {
  citas: Appointment[]
  onView?: (id: string) => void
  onCancel?: (cita: Appointment) => void
  loading?: boolean
}

export default function CitasTable({ citas, onView, onCancel, loading }: CitasTableProps) {
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Formatear hora
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // HH:mm
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando citas...</span>
        </div>
      </div>
    )
  }

  if (citas.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-600">No se encontraron citas.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha y Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modalidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {citas.map((cita) => (
              <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                {/* Información del Paciente */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {cita.patient_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cita.patient_email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cita.patient_phone}
                    </div>
                  </div>
                </td>

                {/* Fecha y Hora */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(cita.appointment_date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(cita.appointment_time)}
                    </div>
                  </div>
                </td>

                {/* Tipo de Consulta */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline" className="text-xs">
                    {cita.consultation_type === 'primera_consulta' 
                      ? 'Primera Consulta' 
                      : 'Seguimiento'}
                  </Badge>
                </td>

                {/* Modalidad */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      cita.modalidad === 'online' 
                        ? 'border-blue-300 text-blue-700 bg-blue-50' 
                        : 'border-green-300 text-green-700 bg-green-50'
                    }`}
                  >
                    {cita.modalidad === 'online' ? '💻 Online' : '🏥 Presencial'}
                  </Badge>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {cita.status === 'CONFIRMADA' ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmada
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancelada
                    </Badge>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(cita.id)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onCancel && cita.status === 'CONFIRMADA' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onCancel(cita)}
                        title="Cancelar cita"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer con total */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total: <span className="font-medium">{citas.length}</span> cita{citas.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
