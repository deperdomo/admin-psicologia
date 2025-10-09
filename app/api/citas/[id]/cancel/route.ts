import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    const body = await request.json()
    const { notify_patient, admin_notes } = body

    console.log('📋 Cancelando cita:', appointmentId)

    // 1. Actualizar status a CANCELADA en la base de datos
    const { data: appointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'CANCELADA',
        notes: admin_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error al actualizar cita:', updateError)
      return NextResponse.json(
        { error: `Error al cancelar la cita: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Cita actualizada a CANCELADA')

    // 2. Eliminar evento de Google Calendar (si existe google_event_id)
    if (appointment.google_event_id) {
      try {
        console.log('🗑️ Eliminando evento de Google Calendar...')
        
        const { data: calendarData, error: calendarError } = await supabase.functions.invoke(
          'delete-calendar-event',
          { body: { appointmentId: appointmentId } }
        )

        if (calendarError) {
          console.warn('⚠️ Error al eliminar evento de calendario:', calendarError)
          // No lanzamos error, continuamos
        } else {
          console.log('✅ Evento de calendario eliminado:', calendarData)
        }
      } catch (calendarError) {
        console.warn('⚠️ Error al eliminar evento de calendario:', calendarError)
        // No lanzamos error, continuamos
      }
    } else {
      console.log('ℹ️ No hay google_event_id, omitiendo eliminación de calendario')
    }

    // 3. Enviar email de cancelación al paciente (si notify_patient = true)
    if (notify_patient) {
      try {
        console.log('📧 Enviando email de cancelación al paciente...')
        
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send-appointment-email',
          { 
            body: { 
              appointment_id: appointmentId, 
              type: 'cancellation' 
            } 
          }
        )

        if (emailError) {
          console.warn('⚠️ Error al enviar email:', emailError)
          // No lanzamos error, la cita ya fue cancelada
        } else {
          console.log('✅ Email de cancelación enviado:', emailData)
        }
      } catch (emailError) {
        console.warn('⚠️ Error al enviar email:', emailError)
        // No lanzamos error, la cita ya fue cancelada
      }
    } else {
      console.log('ℹ️ notify_patient = false, omitiendo envío de email')
    }

    return NextResponse.json({
      success: true,
      appointment: appointment,
      message: 'Cita cancelada exitosamente'
    })

  } catch (error) {
    console.error('Error en API de cancelación:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
