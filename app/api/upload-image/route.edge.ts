import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateStoragePath } from '@/lib/blogImageUtils'

/**
 * API Route para subir imágenes sin optimización del servidor
 * Compatible con Netlify Edge Functions y otros entornos serverless
 * 
 * La optimización se hace en el cliente antes de enviar
 */
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

    console.log('Subiendo imagen (sin optimización del servidor):', {
      filename: file.name,
      size: file.size,
      type: file.type,
      slug
    })

    // Generar el path de almacenamiento
    const extension = file.name.split('.').pop() || 'webp'
    const storagePath = generateStoragePath(slug, extension)

    // Subir directamente a Supabase
    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Error al subir imagen:', uploadError)
      return NextResponse.json(
        { error: `Error al subir la imagen: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(storagePath)

    return NextResponse.json({
      success: true,
      publicUrl: publicUrlData.publicUrl,
      path: storagePath,
      message: 'Imagen optimizada en el cliente y subida exitosamente'
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
