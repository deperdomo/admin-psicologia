import { NextRequest, NextResponse } from 'next/server'
import { getArticuloById, updateArticulo, deleteArticulo, checkSlugExists } from '@/lib/articulos'
import { blogArticleSchema } from '@/lib/validations'
import type { BlogArticleFormData } from '@/types/database'

// Función helper para formatear errores de Zod en mensajes legibles
function formatZodErrors(errors: { path: (string | number)[]; message: string }[]): string {
  const fieldLabels: Record<string, string> = {
    title: 'Título',
    slug: 'Slug URL',
    introduction: 'Introducción',
    'psychological_analysis': 'Análisis psicológico',
    'psychological_analysis.title': 'Título del análisis psicológico',
    'psychological_analysis.content': 'Contenido del análisis psicológico',
    'practical_recommendations': 'Recomendaciones prácticas',
    'practical_recommendations.title': 'Título de recomendaciones prácticas',
    'practical_recommendations.content': 'Contenido de recomendaciones prácticas',
    author_name: 'Nombre del autor',
    author_email: 'Email del autor',
    canonical_url: 'URL canónica',
  }

  const formattedErrors = errors.map(err => {
    const path = err.path.join('.')
    const label = fieldLabels[path] || path
    return `• ${label}: ${err.message}`
  })

  return `Errores de validación:\n${formattedErrors.join('\n')}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const articulo = await getArticuloById(id)
    
    if (!articulo) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(articulo)
  } catch (error) {
    console.error('Error en GET /api/articulos/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rawData = await request.json()

    // Log para debug
    console.log('Datos recibidos en PUT API:', rawData)
    console.log('Related articles recibidos en PUT:', rawData.related_articles)

    // Validar con Zod schema
    const validationResult = blogArticleSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      const errorMessage = formatZodErrors(validationResult.error.errors)
      console.log('Errores de validación en PUT:', validationResult.error.errors)
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    const data = validationResult.data as BlogArticleFormData

    // Verificar si el slug ya existe (excluyendo el artículo actual)
    if (data.slug) {
      const slugExists = await checkSlugExists(data.slug, id)
      if (slugExists) {
        return NextResponse.json(
          { error: 'Ya existe un artículo con ese slug. Por favor, usa uno diferente.' },
          { status: 400 }
        )
      }
    }

    const articulo = await updateArticulo(id, data)
    return NextResponse.json(articulo)
  } catch (error) {
    console.error('Error en PUT /api/articulos/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteArticulo(id)
    return NextResponse.json({ message: 'Artículo eliminado exitosamente' })
  } catch (error) {
    console.error('Error en DELETE /api/articulos/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
