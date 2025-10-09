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

// ===== BLOG ARTICLES TYPES =====

export type BlogArticleCategory = 'desarrollo' | 'comportamiento' | 'emociones' | 'educacion' | 'familia' | 'trastornos' | 'otros'
export type BlogTopicComplexity = 'beginner' | 'intermediate' | 'advanced'
export type BlogStatus = 'draft' | 'published' | 'archived'

// Interfaz que refleja exactamente el esquema de la base de datos para blog_articles
export interface BlogArticle {
  id: string
  title: string
  subtitle?: string | null
  slug: string
  image_1_alt?: string | null
  image_1_url?: string | null
  social_share_image?: string | null
  introduction: string
  current_data_research?: any | null // jsonb
  reflective_question?: string | null
  anonymous_case?: any | null // jsonb
  psychological_analysis: any // jsonb
  practical_recommendations: any // jsonb
  call_to_action?: string | null
  empathetic_closing?: any | null // jsonb
  additional_resources?: string | null
  faq_data?: any | null // jsonb
  summary_points?: any | null // jsonb
  bibliography?: any | null // jsonb
  related_articles?: any | null // jsonb
  meta_description?: string | null
  meta_keywords?: string | null
  canonical_url?: string | null
  schema_markup?: any | null // jsonb
  category?: BlogArticleCategory | null
  subcategory?: string | null
  tags?: string[] | null
  target_audience?: string | null
  age_range?: string | null
  topic_complexity?: BlogTopicComplexity | null
  recommended_products?: any | null // jsonb
  professional_recommendations?: any | null // jsonb
  author_name: string
  author_email?: string | null
  author_bio?: string | null
  author_credentials?: string | null
  author_photo_url?: string | null
  author_social_links?: any | null // jsonb
  status?: BlogStatus | null
  published_at?: string | null
  is_featured?: boolean | null
  is_trending?: boolean | null
  is_professional_content?: boolean | null
  reading_time_minutes?: number | null
  created_at?: string
  updated_at?: string | null
}

// ===== APPOINTMENTS & BLOCKED SLOTS TYPES =====

export type ConsultationType = 'primera_consulta' | 'seguimiento'
export type AppointmentModalidad = 'presencial' | 'online'
export type AppointmentStatus = 'CONFIRMADA' | 'CANCELADA'

// Interfaz que refleja la tabla appointments en Supabase
export interface Appointment {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  appointment_date: string // DATE
  appointment_time: string // TIME
  consultation_type: ConsultationType
  modalidad: AppointmentModalidad
  status: AppointmentStatus
  cancellation_token?: string | null
  notes?: string | null
  google_event_id?: string | null
  google_meet_link?: string | null
  created_at: string
  updated_at?: string | null
}

// Interfaz para el formulario de citas
export interface AppointmentFormData {
  patient_name: string
  patient_email: string
  patient_phone: string
  appointment_date: string // YYYY-MM-DD
  appointment_time: string // HH:mm
  consultation_type: ConsultationType
  modalidad: AppointmentModalidad
  notes?: string
  send_notification?: boolean // ¿Enviar email de confirmación?
}

// Interfaz para cancelar citas desde admin
export interface CancelAppointmentData {
  appointmentId: string
  reason: string // Motivo de cancelación
  notify_patient: boolean // ¿Notificar al paciente?
  admin_notes?: string // Notas internas
}

// Interfaz que refleja la tabla blocked_slots en Supabase
export interface BlockedSlot {
  id: string
  blocked_date: string // DATE
  blocked_time?: string | null // TIME o null para bloquear todo el día
  reason?: string | null
  created_at: string
}

// Interfaz para crear un slot bloqueado
export interface CreateBlockedSlotData {
  blocked_date: string // YYYY-MM-DD
  blocked_time?: string | null // HH:mm o null para todo el día
  reason?: string
  recurring?: {
    type: 'weekly' | 'monthly'
    count: number // Número de repeticiones
  }
}

// Interfaz para filtros de administración de citas
export interface AdminAppointmentFilters {
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
  status?: 'ALL' | AppointmentStatus
  searchTerm?: string // Buscar por nombre, email o teléfono
  page?: number
  limit?: number
}

// Interfaz para estadísticas del admin
export interface AdminStats {
  totalAppointments: number
  todayAppointments: number
  thisWeekAppointments: number
  thisMonthAppointments: number
  cancelledThisMonth: number
  confirmedThisMonth: number
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

// Interfaz para métricas del dashboard
export interface DashboardData {
  // Métricas del día
  todayAppointments: number
  todayRevenue: number
  // Próximas citas
  upcomingAppointments: Appointment[]
  // Estados
  confirmedCount: number
  cancelledCount: number
  blockedSlotsCount: number
}

// Interfaz para el formulario de artículos del blog
export interface BlogArticleFormData {
  title: string
  subtitle?: string
  slug: string
  image_1_alt?: string
  image_1_url?: string
  social_share_image?: string
  introduction: string
  current_data_research?: {
    title: string
    content: string
  }
  reflective_question?: string
  anonymous_case?: {
    title: string
    content: string
  }
  psychological_analysis: {
    title: string
    content: string
  }
  practical_recommendations: {
    title: string
    content: string
  }
  call_to_action?: string
  empathetic_closing?: {
    title: string
    content: string
  }
  additional_resources?: Array<{
    tipo: string
    titulo: string
    autor?: string
    url?: string
  }>
  faq_data?: Array<{
    pregunta: string
    respuesta: string
  }>
  summary_points?: Array<{
    point: string
  }>
  bibliography?: Array<{
    id: string
    authors: string[]
    year: number
    title: string
    journal?: string
    publisher?: string
    volume?: string
    pages?: string
    doi?: string
    type: string
    cited_in_text: boolean
    citation_format: string
  }>
  related_articles?: Array<{
    slug: string
    type: string
    title: string
    category: string
    image_url?: string
    image_alt?: string  // ✅ Cambiar de image_1_alt a image_alt para el formulario
    relevance: string
    author_name: string
    description?: string
    author_image?: string
  }>
  meta_description?: string
  meta_keywords?: string
  canonical_url?: string
  schema_markup?: any
  category?: BlogArticleCategory
  subcategory?: string
  tags?: string[]
  target_audience?: string
  age_range?: string
  topic_complexity?: BlogTopicComplexity
  recommended_products?: Array<{
    nombre: string
    descripcion: string
    url?: string
    categoria?: string
    imagen_url?: string
  }>
  professional_recommendations?: Array<{
    title: string
  }>
  author_name: string
  author_email?: string
  author_bio?: string
  author_credentials?: string
  author_photo_url?: string
  author_social_links?: {
    twitter?: string
    linkedin?: string
    instagram?: string
    web?: string
  }
  status?: BlogStatus
  is_featured?: boolean
  is_trending?: boolean
  is_professional_content?: boolean
  reading_time_minutes?: number
}