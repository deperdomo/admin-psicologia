"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, MapPin, FileText, CheckCircle, XCircle, Video } from 'lucide-react'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { getCitaById } from '@/lib/citas'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { Appointment } from '@/types/database'

export default function DetalleCitaClient() {
  const { user, loading: authLoading } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const citaId = params.id as string
  
  const [cita, setCita] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !citaId) return
    loadCita()
  }, [user, citaId])

  const loadCita = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Cargando cita:', citaId)
      
      const data = await getCitaById(citaId)
      
      if (!data) {
        setError('Cita no encontrada')
        return
      }
      
      console.log('✅ Cita cargada:', data)
      setCita(data)
    } catch (err) {
      console.error('❌ Error cargando cita:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar la cita')
    } finally {
      setLoading(false)
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  // Formatear hora
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // HH:mm
  }

  // Formatear fecha de creación
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando...</span>
      </div>
    )
  }

  if (!user) return null

  if (error || !cita) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/citas/lista')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la Lista
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Cita no encontrada'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/citas/lista')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalles de la Cita</h1>
            <p className="text-gray-600 mt-1">
              ID: {cita.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        
        {/* Badge de estado */}
        <div>
          {cita.status === 'CONFIRMADA' ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-lg px-4 py-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirmada
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-lg px-4 py-2">
              <XCircle className="h-5 w-5 mr-2" />
              Cancelada
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Paciente */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Paciente
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="text-lg font-medium text-gray-900">{cita.patient_name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a 
                    href={`mailto:${cita.patient_email}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-700"
                  >
                    {cita.patient_email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <a 
                    href={`tel:${cita.patient_phone}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-700"
                  >
                    {cita.patient_phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de la Cita */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Detalles de la Cita
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {formatDate(cita.appointment_date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Hora</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatTime(cita.appointment_time)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de Consulta</p>
                  <Badge variant="outline" className="mt-1">
                    {cita.consultation_type === 'primera_consulta' 
                      ? 'Primera Consulta' 
                      : 'Seguimiento'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                {cita.modalidad === 'online' ? (
                  <Video className="h-5 w-5 text-gray-400 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Modalidad</p>
                  <Badge 
                    variant="outline" 
                    className={`mt-1 ${
                      cita.modalidad === 'online' 
                        ? 'border-blue-300 text-blue-700 bg-blue-50' 
                        : 'border-green-300 text-green-700 bg-green-50'
                    }`}
                  >
                    {cita.modalidad === 'online' ? '💻 Online' : '🏥 Presencial'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Google Meet Link si existe */}
            {cita.google_meet_link && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Link de Google Meet:</strong>
                </p>
                <a 
                  href={cita.google_meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline break-all"
                >
                  {cita.google_meet_link}
                </a>
              </div>
            )}
          </div>

          {/* Notas */}
          {cita.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Notas
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{cita.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar - Información Adicional */}
        <div className="space-y-6">
          {/* Metadatos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Sistema
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Creada el</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(cita.created_at)}
                </p>
              </div>
              
              {cita.updated_at && (
                <div>
                  <p className="text-gray-500">Última actualización</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(cita.updated_at)}
                  </p>
                </div>
              )}
              
              {cita.google_event_id && (
                <div>
                  <p className="text-gray-500">ID Evento Google</p>
                  <p className="font-mono text-xs text-gray-700 break-all">
                    {cita.google_event_id}
                  </p>
                </div>
              )}
              
              {cita.cancellation_token && (
                <div>
                  <p className="text-gray-500">Token de Cancelación</p>
                  <p className="font-mono text-xs text-gray-700 break-all">
                    {cita.cancellation_token.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones
            </h3>
            
            <div className="space-y-2">
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => window.open(`mailto:${cita.patient_email}`, '_blank')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => window.open(`tel:${cita.patient_phone}`, '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
              
              {cita.google_meet_link && (
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => window.open(cita.google_meet_link!, '_blank')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Abrir Google Meet
                </Button>
              )}
            </div>
          </div>

          {/* Ayuda */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Puedes cancelar esta cita desde la lista de citas si es necesario.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
