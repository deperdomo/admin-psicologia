"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AgeRangeSelector } from './AgeRangeSelector'
import { TagInput } from './TagInput'
import { FileUpload } from './FileUpload'
import { recursoSchema, CATEGORIA_LABELS, RESOURCE_TYPE_LABELS, DIFFICULTY_LABELS } from '@/lib/validations'
import type { RecursoFormData } from '@/types/database'
import { TextareaWithPaste } from '../ui/textarea-with-paste'
import { InputWithPaste } from '../ui/input-with-paste'

interface RecursoFormProps {
  initialData?: Partial<RecursoFormData>
  onSubmit: (data: RecursoFormData, wordFile?: File, pdfFile?: File) => Promise<void>
  submitLabel?: string
  disabled?: boolean
  isEditing?: boolean
}

export default function RecursoForm({
  initialData,
  onSubmit,
  submitLabel = 'Crear Recurso',
  disabled = false,
  isEditing = false
}: RecursoFormProps) {
  const [wordFile, setWordFile] = useState<File | undefined>()
  const [pdfFile, setPdfFile] = useState<File | undefined>()

  // Auto-generar resource_id basado en el título
  const generateResourceId = (title: string) => {
    if (!title.trim()) return ''

    const baseId = title
      .toLowerCase()
      .trim()
      // Convertir caracteres especiales a su equivalente ASCII
      .replace(/[áàäâãā]/g, 'a')
      .replace(/[éèëêēė]/g, 'e')
      .replace(/[íìïîīį]/g, 'i')
      .replace(/[óòöôõō]/g, 'o')
      .replace(/[úùüûū]/g, 'u')
      .replace(/[ñń]/g, 'n')
      .replace(/[çć]/g, 'c')
      .replace(/[ý]/g, 'y')
      // Eliminar caracteres especiales que no sean letras, números, espacios o guiones
      .replace(/[^a-z0-9\s-]/g, '')
      // Convertir espacios múltiples a un solo guión
      .replace(/\s+/g, '-')
      // Eliminar guiones múltiples
      .replace(/-+/g, '-')
      // Eliminar guiones al inicio y final
      .replace(/^-|-$/g, '')

    // Limitar longitud total del ID final (incluyendo el prefijo rec-)
    const maxLength = 50 // Longitud máxima total

    const maxBaseLength = maxLength

    const truncatedBaseId = baseId.length > maxBaseLength
      ? baseId.substring(0, maxBaseLength).replace(/-$/, '') // Evitar que termine en guión
      : baseId

    return `${truncatedBaseId}`
  }

  // Generar un resource_id único si hay conflictos
  const generateUniqueResourceId = (baseId: string) => {
    // Aquí podríamos agregar lógica para verificar duplicados en la base de datos
    // Por ahora, simplemente devolvemos el baseId
    return baseId
  }

  const form = useForm<RecursoFormData>({
    resolver: zodResolver(recursoSchema),
    defaultValues: {
      resource_id: initialData?.resource_id || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      categoria: initialData?.categoria,
      resource_type: initialData?.resource_type,
      age_ranges: initialData?.age_ranges || [],
      tags: initialData?.tags || [],
      is_premium: initialData?.is_premium || false,
      // REMOVIDO: requires_supervision ya que no existe en el esquema
      estimated_reading_time: initialData?.estimated_reading_time,
      difficulty: initialData?.difficulty,
      word_public_url: initialData?.word_public_url,
      pdf_public_url: initialData?.pdf_public_url,
    }
  })

  const handleSubmit = async (data: RecursoFormData) => {
    let fileError = '';
    if (!wordFile && !isEditing) {
      fileError = 'Debes adjuntar el archivo Word (.docx)';
    }
    if (!pdfFile && !isEditing) {
      fileError = fileError ? 'Debes adjuntar ambos archivos: Word y PDF.' : 'Debes adjuntar el archivo PDF (.pdf)';
    }
    if (fileError) {
      form.setError('word_public_url', { type: 'manual', message: fileError });
      form.setError('pdf_public_url', { type: 'manual', message: fileError });
      return;
    }
    await onSubmit(data, wordFile, pdfFile)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <InputWithPaste
                        placeholder="Título del recurso"
                        {...field}
                        disabled={disabled}
                        onChange={(e) => {
                          field.onChange(e)
                          // Auto-generar resource_id cuando cambie el título
                          if (e.target.value.trim().length > 2) {
                            const newResourceId = generateResourceId(e.target.value)
                            if (newResourceId) {
                              const uniqueId = generateUniqueResourceId(newResourceId)
                              form.setValue('resource_id', uniqueId)
                            }
                          } else {
                            // Si el título es muy corto, limpiar el resource_id
                            form.setValue('resource_id', '')
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
                name="resource_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Recurso *</FormLabel>
                    <FormControl>
                      <InputWithPaste
                        placeholder="Se genera automáticamente desde el título"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <TextareaWithPaste
                      placeholder="Descripción detallada del recurso..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Categorización */}
        <Card>
          <CardHeader>
            <CardTitle>Categorización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={disabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimated_reading_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración Estimada (minutos) *</FormLabel>
                    <FormControl>
                      <InputWithPaste
                        type="number"
                        placeholder="ej: 30"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Dificultad *</FormLabel>
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
          </CardContent>
        </Card>

        {/* Rangos de Edad */}
        <Card>
          <CardHeader>
            <CardTitle>Rangos de Edad *</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="age_ranges"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AgeRangeSelector
                      value={field.value}
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

        {/* Etiquetas */}
        <Card>
          <CardHeader>
            <CardTitle>Etiquetas *</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagInput
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

        {/* Configuración Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="is_premium"
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
                    <FormLabel>Recurso Premium</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marcar si este recurso requiere suscripción premium
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* REMOVIDO: Campo requires_supervision ya que no existe en el esquema de la BD */}
          </CardContent>
        </Card>

        {/* Archivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Archivos del Recurso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing && (initialData?.word_public_url || initialData?.pdf_public_url) && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Archivos Actuales:</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {initialData.word_public_url && (
                    <div>✓ Documento Word disponible</div>
                  )}
                  {initialData.pdf_public_url && (
                    <div>✓ Documento PDF disponible</div>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Subir nuevos archivos reemplazará los existentes
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="word-file">Archivo Word (.docx)</Label>
                <FileUpload
                  accept=".docx"
                  onFileSelect={setWordFile}
                  currentFile={wordFile}
                  disabled={disabled}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </div>

              <div>
                <Label htmlFor="pdf-file">Archivo PDF (.pdf)</Label>
                <FileUpload
                  accept=".pdf"
                  onFileSelect={setPdfFile}
                  currentFile={pdfFile}
                  disabled={disabled}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </div>
            </div>

            {/* Mostrar error de archivos obligatorios */}
            {!isEditing && (form.formState.errors.word_public_url || form.formState.errors.pdf_public_url) && (
              <p className="text-sm text-red-600 mt-2">
                {form.formState.errors.word_public_url?.message || form.formState.errors.pdf_public_url?.message}
              </p>
            )}

            {!isEditing && (
              <p className="text-sm text-gray-600">
                * Ambos archivos son obligatorios para crear el recurso
              </p>
            )}
          </CardContent>
        </Card>

        {/* Botón de envío */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={disabled}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}