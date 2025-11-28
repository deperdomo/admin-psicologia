/**
 * Servicio para interactuar con webhooks de n8n
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

export interface N8nWebhookPayload {
  articleId: string
  action: 'create' | 'update'
  timestamp: string
}

/**
 * Dispara el webhook de n8n para procesar productos recomendados de un artículo
 * @param articleId - ID del artículo creado/actualizado
 * @param action - Acción realizada (create o update)
 * @returns Promise con el resultado de la operación
 */
export async function triggerN8nProductProcessing(
  articleId: string,
  action: 'create' | 'update' = 'create'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL no está configurada')
      return {
        success: false,
        error: 'N8N_WEBHOOK_URL no está configurada en las variables de entorno',
      }
    }

    const payload: N8nWebhookPayload = {
      articleId,
      action,
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Error en webhook n8n:', response.status, response.statusText)
      return {
        success: false,
        error: `Error ${response.status}: ${response.statusText}`,
      }
    }

    console.log('Webhook n8n disparado exitosamente para artículo:', articleId)
    return { success: true }
  } catch (error) {
    console.error('Error al disparar webhook n8n:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
