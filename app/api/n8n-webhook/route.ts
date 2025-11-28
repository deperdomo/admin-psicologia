import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

/**
 * Endpoint para disparar el webhook de n8n desde el servidor
 * Esto evita problemas de CORS y mantiene la URL del webhook privada
 */
export async function POST(request: NextRequest) {
  try {
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL no está configurada')
      return NextResponse.json(
        {
          success: false,
          error: 'N8N_WEBHOOK_URL no está configurada en las variables de entorno',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { articleId, action = 'create' } = body

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId es requerido' },
        { status: 400 }
      )
    }

    // Llamar al webhook de n8n
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articleId,
        action,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!webhookResponse.ok) {
      console.error('Error en webhook n8n:', webhookResponse.status, webhookResponse.statusText)
      
      // No fallar la operación completa si el webhook falla
      // Solo registrar el error
      return NextResponse.json(
        {
          success: false,
          error: `Webhook error: ${webhookResponse.status}`,
          message: 'El artículo se guardó correctamente, pero hubo un problema al procesar los productos',
        },
        { status: 200 } // 200 para no interferir con el flujo principal
      )
    }

    const result = await webhookResponse.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      message: 'Webhook disparado exitosamente',
      data: result,
    })
  } catch (error) {
    console.error('Error al disparar webhook:', error)
    
    // No fallar la operación completa si el webhook falla
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'El artículo se guardó correctamente, pero hubo un problema al procesar los productos',
      },
      { status: 200 }
    )
  }
}
