export type ResourceType = 'carta' | 'guia' | 'cuento' | 'ficha' | 'libro' | 'actividad'
export type AgeRange = '0-3' | '3-6' | '6-12' | '12+' | 'todas'
export type DifficultyLevel = 'basico' | 'intermedio' | 'avanzado'
export type CategoriaPrincipal = 'cartas_que_curan' | 'colecciones_ayuda' | 'cuentos_terapeuticos' | 'fichas_psicoeducativas' | 'guias_padres' | 'recomendaciones_libros'

export interface Recurso {
  id: string
  resource_id: string
  title: string
  description?: string
  categoria: CategoriaPrincipal
  resource_type: ResourceType
  age_ranges: AgeRange[]
  tags?: string[]
  word_public_url?: string
  pdf_public_url?: string
  word_file_name?: string | null
  pdf_file_name?: string | null
  file_size_word?: number | null
  file_size_pdf?: number | null
  is_premium?: boolean
  requires_supervision?: boolean
  estimated_reading_time?: number
  difficulty_level?: DifficultyLevel
  created_at: string
  updated_at?: string
}

export interface RecursoFormData {
  resource_id: string
  title: string
  description?: string
  categoria: CategoriaPrincipal
  resource_type: ResourceType
  age_ranges: AgeRange[]
  tags?: string[]
  is_premium?: boolean
  estimated_reading_time?: number
  difficulty_level?: DifficultyLevel // Mantener como difficulty_level en el form
  word_public_url?: string
  pdf_public_url?: string
  word_file_name?: string | null
  pdf_file_name?: string | null
  file_size_word?: number | null
  file_size_pdf?: number | null
}

export interface RecursoWithFiles extends Recurso {
  word_public_url ?: string
  pdf_public_url?: string
}