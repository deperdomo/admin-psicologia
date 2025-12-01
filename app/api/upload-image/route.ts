import { NextRequest, NextResponse } from 'next/server'
import { uploadBlogImage } from '@/lib/imageUpload'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const slug = formData.get('slug') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'No se proporcionó el slug del artículo' },
        { status: 400 }
      )
    }

    // Validar que el archivo es realmente una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen válida' },
        { status: 400 }
      )
    }

    // Validar el tamaño del archivo
    const maxSize = 8 * 1024 * 1024 // 8MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'La imagen no puede superar los 8MB' },
        { status: 400 }
      )
    }

    console.log('Procesando upload de imagen:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      slug
    })

    // Subir la imagen (esto internamente usa la optimización)
    const result = await uploadBlogImage(file, slug)

    if (!result.success) {
      console.error('Error en uploadBlogImage:', result.error)
      return NextResponse.json(
        { error: result.error || 'Error al subir la imagen' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      publicUrl: result.publicUrl,
      path: result.path,
      optimizationStats: result.optimizationStats
    })

  } catch (error) {
    console.error('Error crítico en upload de imagen:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available')
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al procesar la imagen',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// Configuración del route segment según documentación de Next.js
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const runtime = 'nodejs' // Necesario para Sharp
export const dynamic = 'force-dynamic' // Siempre ejecutar en request time
export const maxDuration = 60 // Máximo 60 segundos (límite de Netlify Functions)