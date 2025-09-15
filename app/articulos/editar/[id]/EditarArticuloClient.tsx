"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ArticuloForm from '@/components/forms/ArticuloForm'
import { SuccessModal } from '@/components/shared/SuccessModal'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { uploadBlogImage } from '@/lib/imageUpload'
import type { BlogArticle, BlogArticleFormData } from '@/types/database'

interface EditarArticuloClientProps {
  id: string
}

export default function EditarArticuloClient({ id }: EditarArticuloClientProps) {
  const router = useRouter()
  const [articulo, setArticulo] = useState<BlogArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    const fetchArticulo = async () => {
      try {
        const response = await fetch(`/api/articulos/${id}`)
        if (!response.ok) {
          throw new Error('Error al cargar el artículo')
        }
        
        const data = await response.json()
        setArticulo(data)
      } catch (error) {
        console.error('Error:', error)
        alert('Error al cargar el artículo')
        router.push('/articulos/lista')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticulo()
  }, [id, router])

  const handleSubmit = async (data: BlogArticleFormData, imageFile?: File) => {
    setIsSubmitting(true)
    try {
      // Si hay una nueva imagen, subirla primero
      if (imageFile && data.slug) {
        console.log('Subiendo nueva imagen...')
        const uploadResult = await uploadBlogImage(imageFile, data.slug)
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Error al subir la imagen')
        }
        
        // Actualizar la URL de la imagen en los datos
        data.image_1_url = uploadResult.publicUrl
        console.log('Imagen subida exitosamente:', uploadResult.publicUrl)
      }

      const response = await fetch(`/api/articulos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el artículo')
      }

      setShowSuccessModal(true)
      
    } catch (error) {
      console.error('Error al actualizar el artículo:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar el artículo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    router.push('/articulos/lista')
  }

  // Convertir datos del artículo al formato del formulario
  const convertToFormData = (articulo: BlogArticle): Partial<BlogArticleFormData> => {
    return {
      title: articulo.title,
      subtitle: articulo.subtitle || '',
      slug: articulo.slug,
      image_1_alt: articulo.image_1_alt || '',
      image_1_url: articulo.image_1_url || '',
      social_share_image: articulo.social_share_image || '',
      introduction: articulo.introduction,
      current_data_research: articulo.current_data_research || { title: '', content: '' },
      reflective_question: articulo.reflective_question || '',
      anonymous_case: articulo.anonymous_case || { title: '', content: '' },
      psychological_analysis: articulo.psychological_analysis || { title: '', content: '' },
      practical_recommendations: articulo.practical_recommendations || { title: '', content: '' },
      call_to_action: articulo.call_to_action || '',
      empathetic_closing: articulo.empathetic_closing || { title: '', content: '' },
      additional_resources: [],
      faq_data: articulo.faq_data || [],
      summary_points: articulo.summary_points || [],
      bibliography: articulo.bibliography || [],
      related_articles: articulo.related_articles || [],
      meta_description: articulo.meta_description || '',
      meta_keywords: articulo.meta_keywords || '',
      canonical_url: articulo.canonical_url || '',
      category: articulo.category || undefined,
      subcategory: articulo.subcategory || '',
      tags: articulo.tags || [],
      target_audience: articulo.target_audience || '',
      age_range: articulo.age_range || '',
      topic_complexity: articulo.topic_complexity || undefined,
      recommended_products: articulo.recommended_products || [],
      professional_recommendations: articulo.professional_recommendations || [],
      author_name: articulo.author_name,
      author_email: articulo.author_email || '',
      author_bio: articulo.author_bio || '',
      author_credentials: articulo.author_credentials || '',
      author_photo_url: articulo.author_photo_url || '',
      author_social_links: articulo.author_social_links || {
        twitter: '',
        linkedin: '',
        instagram: '',
        web: ''
      },
      status: articulo.status || 'draft',
      is_featured: articulo.is_featured || false,
      is_trending: articulo.is_trending || false,
      is_professional_content: articulo.is_professional_content || false,
      reading_time_minutes: articulo.reading_time_minutes || undefined
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Cargando artículo...</div>
      </div>
    )
  }

  if (!articulo) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-600">
          Error: No se pudo cargar el artículo
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/articulos/lista')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la Lista
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Artículo</h1>
          <p className="text-muted-foreground">
            Modificar el contenido del artículo: {articulo.title}
          </p>
        </div>
      </div>

      <ArticuloForm
        initialData={convertToFormData(articulo)}
        onSubmit={handleSubmit}
        submitLabel={isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        disabled={isSubmitting}
        isEditing={true}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="¡Artículo actualizado!"
        message="Los cambios han sido guardados exitosamente."
      />
    </div>
  )
}
