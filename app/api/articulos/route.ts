import { NextRequest, NextResponse } from 'next/server'
import { createArticulo, getArticulos, checkSlugExists } from '@/lib/articulos'
import type { BlogArticleFormData } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const articulos = await getArticulos(search)
    return NextResponse.json(articulos)
  } catch (error) {
    console.error('Error en GET /api/articulos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: BlogArticleFormData = await request.json()
    
    // Log para debug
    console.log('Datos recibidos en API:', data)
    console.log('Related articles recibidos:', data.related_articles)

    // Validaciones básicas
    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: 'Título y slug son campos requeridos' },
        { status: 400 }
      )
    }

    if (!data.introduction) {
      return NextResponse.json(
        { error: 'La introducción es requerida' },
        { status: 400 }
      )
    }

    if (!data.psychological_analysis?.content || !data.practical_recommendations?.content) {
      return NextResponse.json(
        { error: 'El análisis psicológico y las recomendaciones prácticas son requeridos' },
        { status: 400 }
      )
    }

    if (!data.author_name) {
      return NextResponse.json(
        { error: 'El nombre del autor es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el slug ya existe
    const slugExists = await checkSlugExists(data.slug)
    if (slugExists) {
      return NextResponse.json(
        { error: 'Ya existe un artículo con ese slug. Por favor, usa uno diferente.' },
        { status: 400 }
      )
    }

    const articulo = await createArticulo(data)
    return NextResponse.json(articulo, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/articulos:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
