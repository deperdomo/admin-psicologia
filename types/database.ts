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
  word_file_url?: string
  pdf_file_url?: string
  is_premium?: boolean
  requires_supervision?: boolean
  estimated_duration?: number
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
  requires_supervision?: boolean
  estimated_duration?: number
  difficulty_level?: DifficultyLevel
  word_file_url?: string
  pdf_file_url?: string
}

export interface RecursoWithFiles extends Recurso {
  word_file_url?: string
  pdf_file_url?: string
}