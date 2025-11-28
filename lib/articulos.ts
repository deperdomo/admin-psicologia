import { supabaseAdmin } from './supabase'
import type { BlogArticle, BlogArticleFormData } from '@/types/database'

type RelatedArticle = NonNullable<BlogArticleFormData['related_articles']>[0]

export async function createArticulo(data: BlogArticleFormData): Promise<BlogArticle> {
  try {
    console.log('createArticulo - related_articles recibidos:', data.related_articles)
    
    // Preparar los datos para la inserción, enviando objetos directamente como JSONB
    const insertData = {
      title: data.title,
      subtitle: data.subtitle || null,
      slug: data.slug,
      image_1_alt: data.image_1_alt || null,
      image_1_url: data.image_1_url || null,
      social_share_image: data.social_share_image || null,
      introduction: data.introduction,
      current_data_research: data.current_data_research || null,
      reflective_question: data.reflective_question || null,
      anonymous_case: data.anonymous_case || null,
      psychological_analysis: data.psychological_analysis,
      practical_recommendations: data.practical_recommendations,
      call_to_action: data.call_to_action || null,
      empathetic_closing: data.empathetic_closing || null,
      additional_resources: data.additional_resources && data.additional_resources.length > 0 ? data.additional_resources : null,
      faq_data: data.faq_data && data.faq_data.length > 0 ? data.faq_data : null,
      summary_points: data.summary_points && data.summary_points.length > 0 ? data.summary_points : null,
      bibliography: data.bibliography && data.bibliography.length > 0 ? data.bibliography : null,
      related_articles: (() => {
        if (data.related_articles && data.related_articles.length > 0) {
          // Mapear image_alt a image_1_alt para la BD
          const mappedArticles = data.related_articles.map(article => ({
            ...article,
            image_1_alt: article.image_alt, // ✅ MAPEAR image_alt a image_1_alt para BD
            image_alt: undefined // Remover el campo image_alt ya que no existe en BD
          }))
          console.log('FINAL - related_articles que se insertan en BD:', JSON.stringify(mappedArticles, null, 2))
          return mappedArticles
        }
        return null
      })(),
      meta_description: data.meta_description || null,
      meta_keywords: data.meta_keywords || null,
      canonical_url: data.canonical_url || null,
      schema_markup: null, // Se puede generar automáticamente después
      category: data.category || null,
      subcategory: data.subcategory || null,
      tags: data.tags && data.tags.length > 0 ? data.tags : null,
      target_audience: data.target_audience || null,
      age_range: data.age_range || null,
      topic_complexity: data.topic_complexity || null,
      recommended_products: data.recommended_products && data.recommended_products.length > 0 ? data.recommended_products : null,
      professional_recommendations: data.professional_recommendations && data.professional_recommendations.length > 0 ? data.professional_recommendations : null,
      author_name: data.author_name,
      author_email: data.author_email || null,
      author_bio: data.author_bio || null,
      author_credentials: data.author_credentials || null,
      author_photo_url: data.author_photo_url || null,
      author_social_links: data.author_social_links || null,
      status: data.status || 'draft',
      published_at: data.status === 'published' ? new Date().toISOString() : null,
      is_featured: data.is_featured || false,
      is_trending: data.is_trending || false,
      is_professional_content: data.is_professional_content || false,
      reading_time_minutes: data.reading_time_minutes || null
    }

    console.log('Datos a insertar en BD:', insertData)
    console.log('related_articles que se insertarán:', insertData.related_articles)

    const { data: insertedData, error } = await supabaseAdmin
      .from('blog_articles')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error al insertar artículo:', error)
      throw new Error(`Error al crear el artículo: ${error.message}`)
    }

    return insertedData as BlogArticle
  } catch (error) {
    console.error('Error en createArticulo:', error)
    throw error
  }
}

export async function getArticulos(searchTerm?: string | null): Promise<BlogArticle[]> {
  try {
    let query = supabaseAdmin
      .from('blog_articles')
      .select('*')
      .order('created_at', { ascending: false })

    // Si hay término de búsqueda, aplicar filtros
    if (searchTerm && searchTerm.trim()) {
      query = query.or(`title.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener artículos:', error)
      throw new Error(`Error al obtener los artículos: ${error.message}`)
    }

    return data as BlogArticle[]
  } catch (error) {
    console.error('Error en getArticulos:', error)
    throw error
  }
}

export async function getArticuloById(id: string): Promise<BlogArticle | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error al obtener artículo:', error)
      throw new Error(`Error al obtener el artículo: ${error.message}`)
    }

    return data as BlogArticle
  } catch (error) {
    console.error('Error en getArticuloById:', error)
    return null
  }
}

export async function updateArticulo(id: string, data: Partial<BlogArticleFormData>): Promise<BlogArticle> {
  try {
    console.log('updateArticulo - related_articles recibidos:', data.related_articles)
    
    // Preparar los datos para la actualización
    const updateData: Record<string, unknown> = {}

    Object.keys(data).forEach(key => {
      const value = (data as Record<string, unknown>)[key]
      
      if (value !== undefined) {
        // Log especial para related_articles
        if (key === 'related_articles') {
          console.log('Procesando related_articles en update:', value)
          
          // Mapear image_alt de vuelta a image_1_alt para la BD
          if (Array.isArray(value)) {
            updateData[key] = value.map((article: RelatedArticle) => ({
              ...article,
              image_1_alt: article.image_alt, // ✅ MAPEAR image_alt a image_1_alt para BD
              image_alt: undefined // Remover el campo image_alt ya que no existe en BD
            }))
            console.log('related_articles mapeados para BD:', updateData[key])
          } else {
            updateData[key] = value
          }
        } else {
          // Enviar otros objetos directamente como JSONB (Supabase maneja esto automáticamente)
          updateData[key] = value
        }
      }
    })

    console.log('Datos a actualizar en BD:', updateData)
    if (updateData.related_articles) {
      console.log('related_articles que se actualizarán:', updateData.related_articles)
    }

    // Solo actualizar updated_at, NO tocar published_at en actualizaciones
    updateData.updated_at = new Date().toISOString()

    const { data: updatedData, error } = await supabaseAdmin
      .from('blog_articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar artículo:', error)
      throw new Error(`Error al actualizar el artículo: ${error.message}`)
    }

    return updatedData as BlogArticle
  } catch (error) {
    console.error('Error en updateArticulo:', error)
    throw error
  }
}

export async function deleteArticulo(id: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('blog_articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar artículo:', error)
      throw new Error(`Error al eliminar el artículo: ${error.message}`)
    }
  } catch (error) {
    console.error('Error en deleteArticulo:', error)
    throw error
  }
}

// Función para verificar si un slug ya existe
export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabaseAdmin
      .from('blog_articles')
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al verificar slug:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error en checkSlugExists:', error)
    return false
  }
}
