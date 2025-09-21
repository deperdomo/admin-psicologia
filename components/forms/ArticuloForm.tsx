"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, FileText, User, Settings, Tag, BookOpen, Globe, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputWithPaste } from '@/components/ui/input-with-paste'
import { Label } from '@/components/ui/label'
import { TextareaWithPaste } from '@/components/ui/textarea-with-paste'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { TagInput } from './TagInput'
import { ImageUpload } from './ImageUpload'
import { AdditionalResourcesInput } from './AdditionalResourcesInput'
import { FaqInput } from './FaqInput'
import { SummaryPointsInput } from './SummaryPointsInput'
import { BibliographyInput } from './BibliographyInput'
import { RelatedArticlesInput } from './RelatedArticlesInput'
import { ProfessionalRecommendationsInput } from './ProfessionalRecommendationsInput'
import { RecommendedProductsInput } from './RecommendedProductsInput'
import { blogArticleSchema, BLOG_CATEGORY_LABELS, BLOG_COMPLEXITY_LABELS, BLOG_STATUS_LABELS } from '@/lib/validations'
import { generateBlogImageUrl } from '@/lib/blogImageUtils'
import type { BlogArticleFormData } from '@/types/database'

interface ArticuloFormProps {
  initialData?: Partial<BlogArticleFormData>
  onSubmit: (data: BlogArticleFormData, imageFile?: File) => Promise<void>
  submitLabel?: string
  disabled?: boolean
  isEditing?: boolean
}

export default function ArticuloForm({
  initialData,
  onSubmit,
  submitLabel = 'Crear Artículo',
  disabled = false,
  isEditing = false
}: ArticuloFormProps) {

  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  // Datos fijos del autor
  const AUTHOR_DATA = {
    'Llenia Monteagudo': {
      author_email: 'vinculoycrecimiento@gmail.com',
      author_bio: 'Llenia Monteagudo es graduada en psicología, con mención en psicología clínica, por la Universidad de Barcelona. Cursó el **Máster en Psicología General Sanitaria** con la Universidad Autónoma de Barcelona.\n\nPosteriormente, se formó como experta en psicología de las emergencias y catástrofes. Tanto esta formación como la experiencia laboral en el campo, supusieron para Llenia el descubrimiento de un nuevo mundo: ***el trauma***.\n\nDesde entonces, trabaja desde un *enfoque integrador* y no ha parado de formarse en trauma, sistema nervioso, apego, duelo y emociones. Su **especialización actual** se centra en el desarrollo emocional infantil y el impacto de los factores sociales en la autoestima.',
      author_credentials: 'Graduada en Psicología (Universidad de Barcelona), Máster en Psicología General Sanitaria (Universidad Autónoma de Barcelona), Especialista en Desarrollo Emocional Infantil',
      author_photo_url: 'https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/authors/llenia-monteagudo.jpg',
      author_social_links: {
        twitter: 'https://twitter.com/llenia_monteagudo',
        linkedin: 'https://linkedin.com/in/llenia-monteagudo-psicologa',
        instagram: 'https://instagram.com/llenia.monteagudo.psicologia',
        web: 'https://lleniapsicologia.com/'
      }
    }
  }

  // Función para autogenerar la URL canónica
  const generateCanonicalUrl = (slug: string) => {
    return slug ? `https://lleniapsicologia.com/blog/${slug}` : ''
  }

  const form = useForm<BlogArticleFormData>({
    resolver: zodResolver(blogArticleSchema),
    defaultValues: {
      title: initialData?.title || '',
      subtitle: initialData?.subtitle || '',
      slug: initialData?.slug || '',
      image_1_alt: initialData?.image_1_alt || '',
      image_1_url: initialData?.image_1_url || '',
      social_share_image: initialData?.social_share_image || '',
      introduction: initialData?.introduction || '',
      current_data_research: initialData?.current_data_research || { title: '', content: '' },
      reflective_question: initialData?.reflective_question || '',
      anonymous_case: initialData?.anonymous_case || { title: '', content: '' },
      psychological_analysis: initialData?.psychological_analysis || { title: '', content: '' },
      practical_recommendations: initialData?.practical_recommendations || { title: '', content: '' },
      call_to_action: initialData?.call_to_action || '',
      empathetic_closing: initialData?.empathetic_closing || { title: '', content: '' },
      additional_resources: initialData?.additional_resources || [],
      faq_data: initialData?.faq_data || [],
      summary_points: initialData?.summary_points || [],
      bibliography: initialData?.bibliography || [],
      related_articles: initialData?.related_articles || [],
      meta_description: initialData?.meta_description || '',
      meta_keywords: initialData?.meta_keywords || '',
      canonical_url: initialData?.canonical_url || '',
      category: initialData?.category || undefined,
      subcategory: initialData?.subcategory || '',
      tags: initialData?.tags || [],
      target_audience: initialData?.target_audience || '',
      age_range: initialData?.age_range || '',
      topic_complexity: initialData?.topic_complexity || undefined,
      recommended_products: initialData?.recommended_products || [],
      professional_recommendations: initialData?.professional_recommendations || [],
      author_name: initialData?.author_name || '',
      author_email: initialData?.author_email || '',
      author_bio: initialData?.author_bio || '',
      author_credentials: initialData?.author_credentials || '',
      author_photo_url: initialData?.author_photo_url || '',
      author_social_links: initialData?.author_social_links || {
        twitter: '',
        linkedin: '',
        instagram: '',
        web: ''
      },
      status: initialData?.status || 'draft',
      is_featured: initialData?.is_featured || false,
      is_trending: initialData?.is_trending || false,
      is_professional_content: initialData?.is_professional_content || false,
      reading_time_minutes: initialData?.reading_time_minutes || undefined
    }
  })

  const handleSubmit = async (data: BlogArticleFormData) => {
    await onSubmit(data, selectedImage || undefined)
  }

  // Auto-generar slug basado en el título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[çć]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Actualizar URL de imagen cuando cambie el slug o se seleccione una imagen
  const updateImageUrl = (slug: string) => {
    if (slug) {
      // Siempre usar extensión .webp ya que todas las imágenes se optimizan a este formato
      const fileName = `${slug}.webp`
      const imageUrl = generateBlogImageUrl(slug, fileName)
      form.setValue('image_1_url', imageUrl)
    }
  }

  // Función centralizada para actualizar todos los campos que dependen del slug
  const updateAllSlugDependentFields = (slug: string) => {
    // 1. Actualizar URL canónica
    form.setValue('canonical_url', generateCanonicalUrl(slug))

    // 2. Actualizar URL de imagen (solo si no estamos editando)
    if (!isEditing) {
      updateImageUrl(slug)
    }

    // 3. Actualizar social_share_image si está vacía o coincide con la imagen principal
    const currentSocialImage = form.getValues('social_share_image')
    const currentImageUrl = form.getValues('image_1_url')

    if (!currentSocialImage || currentSocialImage === currentImageUrl) {
      // La imagen social comparte la misma URL que la imagen principal
      if (slug) {
        // Siempre usar extensión .webp ya que todas las imágenes se optimizan a este formato
        const fileName = `${slug}.webp`
        const imageUrl = generateBlogImageUrl(slug, fileName)
        form.setValue('social_share_image', imageUrl)
      }
    }
  }

  // Manejar selección de imagen
  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file)
    if (file) {
      const currentSlug = form.getValues('slug')
      if (currentSlug) {
        updateAllSlugDependentFields(currentSlug)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Artículo *</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="Título principal del artículo"
                            {...field}
                            disabled={disabled}
                            onChange={(e) => {
                              field.onChange(e)
                              // Auto-generar slug cuando cambie el título
                              const newSlug = generateSlug(e.target.value)
                              if (newSlug) {
                                form.setValue('slug', newSlug)
                                // Actualizar todos los campos dependientes
                                updateAllSlugDependentFields(newSlug)
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="Subtítulo descriptivo del contenido"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug URL *</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="url-amigable-del-articulo"
                            {...field}
                            disabled={disabled}
                            onChange={(e) => {
                              field.onChange(e)
                              const newSlug = e.target.value

                              // Actualizar todos los campos dependientes del slug
                              updateAllSlugDependentFields(newSlug)
                            }}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Se genera automáticamente desde el título. Al cambiar este campo se actualizan automáticamente la URL canónica y la imagen.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  {/* Campo de subida de imagen */}
                  <div>
                    <Label>Imagen Principal del Artículo</Label>
                    <div className="mt-2">
                      <ImageUpload
                        onImageSelect={handleImageSelect}
                        currentImage={selectedImage}
                        disabled={disabled}
                        maxSize={5 * 1024 * 1024} // 5MB
                        accept="image/*"
                        placeholder="Seleccionar imagen principal..."
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      La imagen se subirá automáticamente con el nombre basado en el slug
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="image_1_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de Imagen Principal (Auto-generada)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Se generará automáticamente basada en la fecha y slug"
                            {...field}
                            disabled={true} // Siempre deshabilitado
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Esta URL se genera automáticamente cuando completes el slug y subas una imagen
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="social_share_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de Imagen para Redes Sociales (Auto-generada)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Se generará automáticamente basada en la imagen principal"
                            {...field}
                            disabled={true} // Siempre deshabilitado
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Imagen que aparecerá cuando se comparta en redes sociales (se basa en la imagen principal)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_1_alt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto Alternativo de Imagen</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="Descripción de la imagen para accesibilidad"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reading_time_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiempo de Lectura (minutos)</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            type="number"
                            placeholder="ej: 7"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenido Principal - Optimizado para textos largos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Contenido Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="introduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Introducción *</FormLabel>
                    <FormControl>
                      <TextareaWithPaste
                        placeholder="Introducción del artículo con contexto y gancho inicial..."
                        className="min-h-[150px] font-mono text-sm leading-relaxed"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Escribe la introducción que enganchará al lector. Puedes usar Markdown.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Datos Actuales e Investigación */}
              <div className="border rounded-lg p-4 bg-slate-50">
                <h4 className="font-semibold mb-3">Datos Actuales e Investigación</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="current_data_research.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de la Sección</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="ej: Lo que dice la investigación"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="current_data_research.content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido de Investigación</FormLabel>
                        <FormControl>
                          <TextareaWithPaste
                            placeholder="Datos, estadísticas e investigación científica relevante..."
                            className="min-h-[120px] font-mono text-sm leading-relaxed"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="reflective_question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pregunta Reflexiva</FormLabel>
                    <FormControl>
                      <TextareaWithPaste
                        placeholder="¿Has notado que...? ¿Te preguntas cómo...?"
                        className="min-h-[80px] font-mono text-sm leading-relaxed"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Pregunta para conectar con el lector
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Caso Anónimo */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold mb-3">Caso Clínico Anónimo</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="anonymous_case.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Caso</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="ej: Caso real (nombre modificado por privacidad)"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="anonymous_case.content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción del Caso</FormLabel>
                        <FormControl>
                          <TextareaWithPaste
                            placeholder="Carmen, madre de Sofía (9 años), compartía en sesión..."
                            className="min-h-[120px] font-mono text-sm leading-relaxed"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Análisis Psicológico */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold mb-3">Análisis Psicológico *</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="psychological_analysis.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Análisis *</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="ej: Análisis desde la Psicología del Desarrollo"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="psychological_analysis.content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido del Análisis *</FormLabel>
                        <FormControl>
                          <TextareaWithPaste
                            placeholder="Desde la psicología del desarrollo, la autoestima infantil se construye..."
                            className="min-h-[150px] font-mono text-sm leading-relaxed"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Recomendaciones Prácticas */}
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold mb-3">Recomendaciones Prácticas *</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="practical_recommendations.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de las Recomendaciones *</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="ej: Recomendaciones prácticas para padres"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="practical_recommendations.content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido de las Recomendaciones *</FormLabel>
                        <FormControl>
                          <TextareaWithPaste
                            placeholder="1. Fomenta una mentalidad de crecimiento...&#10;2. Limita el tiempo en redes sociales...&#10;3. Refuerza sus logros personales..."
                            className="min-h-[150px] font-mono text-sm leading-relaxed"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="call_to_action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Llamada a la Acción</FormLabel>
                    <FormControl>
                      <TextareaWithPaste
                        placeholder="Si notas que la autoestima de tu hijo se ve persistentemente afectada..."
                        className="min-h-[100px] font-mono text-sm leading-relaxed"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Invitación a buscar ayuda profesional si es necesario
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cierre Empático */}
              <div className="border rounded-lg p-4 bg-purple-50">
                <h4 className="font-semibold mb-3">Cierre Empático</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="empathetic_closing.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Cierre</FormLabel>
                        <FormControl>
                          <InputWithPaste
                            placeholder="ej: Un mensaje final"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="empathetic_closing.content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido del Cierre</FormLabel>
                        <FormControl>
                          <TextareaWithPaste
                            placeholder="Proteger la autoestima de nuestros hijos en un mundo lleno de comparaciones..."
                            className="min-h-[120px] font-mono text-sm leading-relaxed"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categorización y Metadatos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categorización y Metadatos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(BLOG_CATEGORY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoría</FormLabel>
                      <FormControl>
                        <InputWithPaste
                          placeholder="ej: autoestima-infantil"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topic_complexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complejidad del Tema</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(BLOG_COMPLEXITY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="target_audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audiencia Objetivo</FormLabel>
                      <FormControl>
                        <InputWithPaste
                          placeholder="ej: padres, educadores, psicólogos"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rango de Edad</FormLabel>
                      <FormControl>
                        <InputWithPaste
                          placeholder="ej: 8-12 años"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiquetas</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={disabled}
                        placeholder="Escribe una etiqueta y presiona Enter"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEO y Meta Información */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO y Meta Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Descripción</FormLabel>
                    <FormControl>
                      <TextareaWithPaste
                        placeholder="Descripción breve para motores de búsqueda (máx 180 caracteres)"
                        className="min-h-[80px]"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {field.value?.length || 0}/160 caracteres
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palabras Clave</FormLabel>
                    <FormControl>
                      <InputWithPaste
                        placeholder="autoestima infantil, presión social niños, desarrollo emocional"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canonical_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Canónica (Auto-generada)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Se generará automáticamente basada en el slug"
                        {...field}
                        disabled={true}
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Esta URL se genera automáticamente cuando completes el slug
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Información del Autor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Autor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="author_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Autor *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            // Autocompletar datos del autor
                            if (value === 'Llenia Monteagudo') {
                              const author = AUTHOR_DATA['Llenia Monteagudo']
                              form.setValue('author_email', author.author_email)
                              form.setValue('author_bio', author.author_bio)
                              form.setValue('author_credentials', author.author_credentials)
                              form.setValue('author_photo_url', author.author_photo_url)
                              form.setValue('author_social_links', author.author_social_links)
                            }
                          }}
                          disabled={disabled}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el autor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Llenia Monteagudo">Llenia Monteagudo</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email del Autor</FormLabel>
                      <FormControl>
                        <InputWithPaste
                          type="email"
                          placeholder="vinculoycrecimiento@gmail.com"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="author_bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía del Autor</FormLabel>
                    <FormControl>
                      <TextareaWithPaste
                        placeholder="Llenia Monteagudo es graduada en psicología..."
                        className="min-h-[100px] font-mono text-sm leading-relaxed"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author_credentials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credenciales del Autor</FormLabel>
                    <FormControl>
                      <InputWithPaste
                        placeholder="Graduada en Psicología (Universidad de Barcelona), Máster en..."
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author_photo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Foto del Autor</FormLabel>
                    <FormControl>
                      <InputWithPaste
                        placeholder="https://ejemplo.com/autor-foto.jpg"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="author_social_links.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <InputWithPaste
                          placeholder="https://twitter.com/usuario"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_social_links.linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <InputWithPaste
                          placeholder="https://linkedin.com/in/usuario"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_social_links.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <InputWithPaste
                          placeholder="https://instagram.com/usuario"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_social_links.web"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <InputWithPaste
                          placeholder="https://sitio-web.com"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recursos Adicionales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recursos Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="additional_resources"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <AdditionalResourcesInput
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Preguntas Frecuentes (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="faq_data"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FaqInput
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Puntos de Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Puntos de Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="summary_points"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SummaryPointsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Bibliografía */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Bibliografía
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="bibliography"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <BibliographyInput
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Artículos Relacionados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Artículos Relacionados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="related_articles"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RelatedArticlesInput
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Recomendaciones Profesionales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Recomendaciones Profesionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="professional_recommendations"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ProfessionalRecommendationsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Productos Recomendados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Productos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="recommended_products"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RecommendedProductsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Schema Markup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Schema Markup (SEO Avanzado)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="schema_markup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datos Estructurados JSON-LD</FormLabel>
                    <FormControl>
                      <TextareaWithPaste
                        placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
                        value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : String(field.value || '')}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value)
                            field.onChange(parsed)
                          } catch {
                            field.onChange(e.target.value)
                          }
                        }}
                        disabled={disabled}
                        className="min-h-[120px] font-mono text-sm"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Formato JSON-LD para datos estructurados. Se generará automáticamente si se deja vacío.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Configuración de Publicación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Publicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del Artículo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(BLOG_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Artículo Destacado</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Mostrar en la página principal
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_trending"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>En Tendencia</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Marcar como artículo trending
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_professional_content"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Contenido Profesional</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Marcar como contenido técnico/profesional
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón de envío */}
          <div className="flex justify-end sticky bottom-4 bg-white p-4 border rounded-lg shadow-lg">
            <Button
              type="submit"
              disabled={disabled}
              className="flex items-center gap-2 px-8"
              size="lg"
            >
              <Save className="h-4 w-4" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
