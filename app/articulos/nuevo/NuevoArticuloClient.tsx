"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import ArticuloForm from '@/components/forms/ArticuloForm'
import { SuccessModal } from '@/components/shared/SuccessModal'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { uploadOptimizedImage } from '@/lib/imageUploadClient'
import type { BlogArticleFormData } from '@/types/database'

export default function NuevoArticuloClient() {
  const { user, loading } = useRequireAuth();
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  if (loading) return <div>Cargando...</div>;
  if (!user) return null;

  const handleSubmit = async (data: BlogArticleFormData, imageFile?: File) => {
    setIsLoading(true)
    try {
      console.log('Datos a enviar:', data)
      console.log('Related articles:', data.related_articles)

      // Si hay una imagen, subirla primero
      if (imageFile && data.slug) {
        const uploadResult = await uploadOptimizedImage(imageFile, data.slug)

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Error al subir la imagen')
        }

        // Actualizar la URL de la imagen en los datos
        data.image_1_url = uploadResult.publicUrl
      }

      const response = await fetch('/api/articulos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el artículo')
      }

      setShowSuccessModal(true)

    } catch (error) {
      console.error('Error al crear el artículo:', error)
      alert(error instanceof Error ? error.message : 'Error al crear el artículo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    router.push('/articulos/lista')
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Artículo</h1>
          <p className="text-muted-foreground">
            Crea un nuevo artículo para el blog de psicología infantil
          </p>
        </div>
      </div>

      <ArticuloForm
        onSubmit={handleSubmit}
        submitLabel={isLoading ? 'Creando...' : 'Crear Artículo'}
        disabled={isLoading}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="¡Artículo creado exitosamente!"
        message="El artículo ha sido creado y guardado correctamente."
      />
    </div>
  )
}
