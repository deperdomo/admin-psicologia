// types/database.ts

export type ResourceType = 'carta' | 'guia' | 'cuento' | 'ficha' | 'libro' | 'actividad'
export type AgeRange = '0-3' | '3-6' | '6-12' | '12+' | 'todas'
export type Difficulty = 'basico' | 'intermedio' | 'avanzado'
export type CategoriaPrincipal = 'cartas_que_curan' | 'colecciones_ayuda' | 'cuentos_terapeuticos' | 'fichas_psicoeducativas' | 'guias_padres' | 'recomendaciones_libros'

// Interfaz que refleja exactamente el esquema de la base de datos
export interface Recurso {
  id: string
  resource_id: string
  title: string
  description?: string | null
  categoria: CategoriaPrincipal
  resource_type: ResourceType
  age_ranges: AgeRange[]
  tags?: string[] | null
  
  // Archivos - nombres originales
  word_file_name?: string | null
  pdf_file_name?: string | null
  
  // Rutas de almacenamiento (según tu esquema de BD)
  word_storage_path?: string | null
  pdf_storage_path?: string | null
  
  // URLs públicas
  word_public_url?: string | null
  pdf_public_url?: string | null
  
  // Metadatos de archivos
  file_size_word?: number | null
  file_size_pdf?: number | null
  
  // Configuración
  is_premium?: boolean
  is_active?: boolean
  
  // Metadatos adicionales
  estimated_reading_time?: number | null
  difficulty?: Difficulty | null  // Según tu esquema BD usa 'difficulty', no 'difficulty'
  
  // Estadísticas
  download_count?: number
  view_count?: number
  
  // Timestamps
  created_at: string
  updated_at?: string | null
}

// Interfaz para el formulario (mantiene difficulty para consistencia del form)
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
  difficulty?: Difficulty // Mantener como difficulty en el form
  word_public_url?: string
  pdf_public_url?: string
  word_file_name?: string | null
  pdf_file_name?: string | null
  file_size_word?: number | null
  file_size_pdf?: number | null
}

// Interfaz para creación (datos que se envían al crear un recurso)
export interface CreateRecursoData {
  resource_id: string
  title: string
  description?: string | null
  categoria: CategoriaPrincipal
  resource_type: ResourceType
  age_ranges: AgeRange[]
  difficulty?: Difficulty | null  // Mapear a 'difficulty' para BD
  tags?: string[] | null
  estimated_reading_time?: number | null
  is_premium?: boolean
  is_active?: boolean
  
  // Archivos
  word_file_name?: string | null
  pdf_file_name?: string | null
  word_storage_path?: string | null
  pdf_storage_path?: string | null
  word_public_url?: string | null
  pdf_public_url?: string | null
  file_size_word?: number | null
  file_size_pdf?: number | null
}

// Para compatibilidad con código existente
export interface RecursoWithFiles extends Recurso {
  word_public_url?: string
  pdf_public_url?: string
}