import { NextRequest, NextResponse } from 'next/server'
import { getArticuloById, updateArticulo, deleteArticulo, checkSlugExists } from '@/lib/articulos'
import type { BlogArticleFormData } from '@/types/database'

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
    const data: Partial<BlogArticleFormData> = await request.json()

    // Log para debug
    console.log('Datos recibidos en PUT API:', data)
    console.log('Related articles recibidos en PUT:', data.related_articles)

    // Validaciones básicas si se están actualizando campos obligatorios
    if (data.title !== undefined && !data.title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    if (data.slug !== undefined && !data.slug) {
      return NextResponse.json(
        { error: 'El slug es requerido' },
        { status: 400 }
      )
    }

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

    if (data.author_name !== undefined && !data.author_name) {
      return NextResponse.json(
        { error: 'El nombre del autor es requerido' },
        { status: 400 }
      )
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
