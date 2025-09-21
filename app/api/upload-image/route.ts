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

    // Subir la imagen (esto internamente usa la optimización)
    const result = await uploadBlogImage(file, slug)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
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
    console.error('Error en upload de imagen:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}