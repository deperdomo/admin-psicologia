export type ResourceType = 'carta' | 'guia' | 'cuento' | 'ficha' | 'libro' | 'actividad'
export type AgeRange = '0-3' | '3-6' | '6-12' | '12+' | 'todas'
export type DifficultyLevel = 'basico' | 'intermedio' | 'avanzado'
export type CategoriaPrincipal = 'cartas_que_curan' | 'colecciones_ayuda' | 'cuentos_terapeuticos' | 'fichas_psicoeducativas' | 'guias_padres' | 'recomendaciones_libros'

export interface Recurso {
  id?: string
  resource_id: string
  title: string
  description?: string
  categoria: CategoriaPrincipal
  resource_type: ResourceType
  age_ranges: AgeRange[]
  difficulty: DifficultyLevel
  tags?: string[]
  word_file_name?: string
  pdf_file_name?: string
  word_storage_path?: string
  pdf_storage_path?: string
  word_public_url?: string
  pdf_public_url?: string
  is_premium?: boolean
  is_active?: boolean
  file_size_word?: number
  file_size_pdf?: number
  estimated_reading_time?: number
  download_count?: number
  view_count?: number
  created_at?: string
  updated_at?: string
}

export interface RecursoFormData {
  resource_id: string
  title: string
  description: string
  categoria: CategoriaPrincipal
  resource_type: ResourceType
  age_ranges: AgeRange[]
  difficulty: DifficultyLevel
  tags: string[]
  estimated_reading_time: number
  is_premium: boolean
  is_active: boolean
  word_file?: File
  pdf_file?: File
}