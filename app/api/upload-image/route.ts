import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateStoragePath } from '@/lib/blogImageUtils'

/**
 * API Route para subir imágenes directamente a Supabase
 * Compatible con Netlify - La optimización se hace en el cliente con Canvas API
 * 
 * NOTA: Esta versión NO usa Sharp para evitar problemas en Netlify.
 * La optimización se realiza en el navegador antes de la subida.
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

    // Validar el tamaño del archivo (después de optimización del cliente)
    const maxSize = 10 * 1024 * 1024 // 10MB (generoso porque ya viene optimizado)
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'La imagen no puede superar los 10MB' },
        { status: 400 }
      )
    }

    console.log('Subiendo imagen optimizada desde cliente:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      slug
    })

    // Generar el path de almacenamiento
    const extension = file.name.split('.').pop() || 'webp'
    const storagePath = generateStoragePath(slug, extension)

    console.log('Path de storage:', storagePath)

    // Subir directamente a Supabase (ya viene optimizado del cliente)
    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Error al subir imagen a Supabase:', uploadError)
      return NextResponse.json(
        { error: `Error al subir la imagen: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(storagePath)

    console.log('Imagen subida exitosamente:', publicUrlData.publicUrl)

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

// Configuración para Netlify Functions
export const dynamic = 'force-dynamic'
export const maxDuration = 60