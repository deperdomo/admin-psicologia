'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, X, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { recursoSchema, type RecursoFormSchema, CATEGORIA_LABELS, RESOURCE_TYPE_LABELS, DIFFICULTY_LABELS } from '@/lib/validations'
import { type Recurso } from '@/types/database'
import { AgeRangeSelector } from './AgeRangeSelector'
import { TagInput } from './TagInput'
import { FileUpload } from './FileUpload'

import { useFileUpload } from '@/lib/hooks/useFileUpload'
import { generateFileName } from '@/lib/utils'
import { validateFile } from '@/lib/fileUpload'

export interface FileUploadResult {
  fileName: string;
  filePath: string;
  publicUrl: string;
  fileSize: number;
}

interface RecursoFormProps {
  recurso?: Recurso
  onSubmit: (data: RecursoFormSchema & { 
    word_file?: File; 
    pdf_file?: File;
    word_upload_result?: FileUploadResult;
    pdf_upload_result?: FileUploadResult;
  }) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function RecursoForm({ recurso, onSubmit, onCancel, isLoading = false }: RecursoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const [wordUploadResult, setWordUploadResult] = useState<FileUploadResult | null>(null)
  const [pdfUploadResult, setPdfUploadResult] = useState<FileUploadResult | null>(null)

  const form = useForm<RecursoFormSchema & { word_file?: File; pdf_file?: File }>({
    resolver: zodResolver(recursoSchema),
    defaultValues: {
      resource_id: recurso?.resource_id || '',
      title: recurso?.title || '',
      description: recurso?.description || '',
      categoria: recurso?.categoria,
      resource_type: recurso?.resource_type,
      age_ranges: recurso?.age_ranges || [],
      difficulty: recurso?.difficulty,
      tags: recurso?.tags || [],
      estimated_reading_time: recurso?.estimated_reading_time || 0,
      is_premium: recurso?.is_premium || false,
      is_active: recurso?.is_active ?? true,
    },
  })

  // Hooks para subida de archivos
  const wordUpload = useFileUpload({
    bucket: 'recursos-word',
    onSuccess: (result) => setWordUploadResult(result),
    onError: (error) => console.error('Word upload error:', error)
  })

  const pdfUpload = useFileUpload({
    bucket: 'recursos-pdf',
    onSuccess: (result) => setPdfUploadResult(result),
    onError: (error) => console.error('PDF upload error:', error)
  })

  const handleWordFileSelect = async (file: File | undefined) => {
    if (!file) {
      form.setValue('word_file', undefined)
      setWordUploadResult(null)
      return
    }

    // Validar archivo
    const validationError = validateFile(file)
    if (validationError) {
      return // El error se mostrará en el componente FileUpload
    }

    form.setValue('word_file', file)

    // Subir archivo automáticamente si tenemos resource_id
    const resourceId = form.getValues('resource_id')
    if (resourceId) {
      try {
        const fileName = generateFileName(resourceId, file.name)
        const path = `recursos-word/${fileName}`
        await wordUpload.uploadFile(file, path)
      } catch (error) {
        console.error('Error uploading word file:', error)
      }
    }
  }

  const handlePdfFileSelect = async (file: File | undefined) => {
    if (!file) {
      form.setValue('pdf_file', undefined)
      setPdfUploadResult(null)
      return
    }

    // Validar archivo
    const validationError = validateFile(file)
    if (validationError) {
      return // El error se mostrará en el componente FileUpload
    }

    form.setValue('pdf_file', file)

    // Subir archivo automáticamente si tenemos resource_id
    const resourceId = form.getValues('resource_id')
    if (resourceId) {
      try {
        const fileName = generateFileName(resourceId, file.name)
        const path = `recursos-pdf/${fileName}`
        await pdfUpload.uploadFile(file, path)
      } catch (error) {
        console.error('Error uploading pdf file:', error)
      }
    }
  }

  const handleSubmit = async (data: RecursoFormSchema & { word_file?: File; pdf_file?: File }) => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Subir archivos si no se han subido aún
      let finalWordResult = wordUploadResult
      let finalPdfResult = pdfUploadResult

      if (data.word_file && !wordUploadResult) {
        const fileName = generateFileName(data.resource_id, data.word_file.name)
        const path = `recursos-word/${fileName}`
        finalWordResult = await wordUpload.uploadFile(data.word_file, path)
      }

      if (data.pdf_file && !pdfUploadResult) {
        const fileName = generateFileName(data.resource_id, data.pdf_file.name)
        const path = `recursos-pdf/${fileName}`
        finalPdfResult = await pdfUpload.uploadFile(data.pdf_file, path)
      }

      await onSubmit({
        ...data,
        word_upload_result: finalWordResult ?? undefined,
        pdf_upload_result: finalPdfResult ?? undefined
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError(error instanceof Error ? error.message : 'Error al guardar el recurso')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormLoading = isSubmitting || isLoading || wordUpload.isUploading || pdfUpload.isUploading

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {recurso ? 'Editar Recurso' : 'Crear Nuevo Recurso'}
        </CardTitle>
        <CardDescription>
          {recurso 
            ? 'Modifica la información del recurso existente'
            : 'Completa la información para crear un nuevo recurso de psicología'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="resource_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource ID *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ej: carta-001" 
                        {...field}
                        disabled={!!recurso || isFormLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Identificador único del recurso (máximo 100 caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Título del recurso" 
                        {...field}
                        disabled={isFormLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre descriptivo del recurso (máximo 255 caracteres)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del recurso..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isFormLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción opcional del contenido y propósito del recurso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categorización */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
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
                name="resource_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Recurso *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
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
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dificultad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona dificultad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
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

            {/* Rangos de Edad */}
            <FormField
              control={form.control}
              name="age_ranges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rangos de Edad *</FormLabel>
                  <FormControl>
                    <AgeRangeSelector
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isFormLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Selecciona uno o más rangos de edad apropiados para este recurso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
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
                      placeholder="Agrega etiquetas separadas por comas..."
                      disabled={isFormLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Etiquetas para facilitar la búsqueda y organización
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Configuración Adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="estimated_reading_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo de Lectura (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={isFormLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Tiempo estimado de lectura en minutos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_premium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isFormLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Contenido Premium
                      </FormLabel>
                      <FormDescription>
                        Marcar si es contenido de pago
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isFormLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Recurso Activo
                      </FormLabel>
                      <FormDescription>
                        Recurso visible y disponible
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Subida de Archivos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Archivos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="word_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Archivo Word</FormLabel>
                      <FormControl>
                        <FileUpload
                          accept=".doc,.docx"
                          maxSize={5 * 1024 * 1024}
                          onFileSelect={handleWordFileSelect}
                          currentFile={field.value}
                          placeholder="Arrastra un archivo Word aquí o haz clic para seleccionar"
                          isUploading={wordUpload.isUploading}
                          uploadProgress={wordUpload.progress}
                          uploadError={wordUpload.error ?? undefined}
                        />
                      </FormControl>
                      <FormDescription>
                        Archivo Word opcional (máximo 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pdf_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Archivo PDF</FormLabel>
                      <FormControl>
                        <FileUpload
                          accept=".pdf"
                          maxSize={5 * 1024 * 1024}
                          onFileSelect={handlePdfFileSelect}
                          currentFile={field.value}
                          placeholder="Arrastra un archivo PDF aquí o haz clic para seleccionar"
                          isUploading={pdfUpload.isUploading}
                          uploadProgress={pdfUpload.progress}
                          uploadError={pdfUpload.error ?? undefined}
                        />
                      </FormControl>
                      <FormDescription>
                        Archivo PDF opcional (máximo 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isFormLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isFormLoading}
                className="min-w-[120px]"
              >
                {isFormLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {wordUpload.isUploading || pdfUpload.isUploading ? 'Subiendo...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {recurso ? 'Actualizar' : 'Crear'} Recurso
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}