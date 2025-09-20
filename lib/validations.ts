import { z } from 'zod'

export const recursoSchema = z.object({
  resource_id: z.string().min(1, "Resource ID es requerido").max(100, "Resource ID no puede exceder 100 caracteres"),
  title: z.string().min(1, "Título es requerido").max(255, "Título no puede exceder 255 caracteres"),
  description: z.string().min(1, "La descripción es obligatoria"),
  categoria: z.enum([
    'cartas_que_curan',
    'colecciones_ayuda',
    'cuentos_terapeuticos',
    'fichas_psicoeducativas',
    'guias_padres',
    'recomendaciones_libros',
  ], {
    required_error: "Categoría es requerida",
    invalid_type_error: "Categoría no válida"
  }),
  resource_type: z.enum([
    'carta',
    'guia',
    'cuento',
    'ficha',
    'libro',
    'actividad',
  ], {
    required_error: "Tipo de recurso es requerido",
    invalid_type_error: "Tipo de recurso no válido"
  }),
  age_ranges: z.array(z.enum(['0-3', '3-6', '6-12', '12+', 'todas'])).min(1, "Selecciona al menos un rango de edad"),
  tags: z.array(z.string()).min(1, "Debes ingresar al menos una etiqueta"),
  estimated_reading_time: z.number({ required_error: "La duración estimada es obligatoria" }).min(1, "La duración debe ser mayor a 0"),
  difficulty: z.enum(['basico', 'intermedio', 'avanzado'], {
    required_error: "Nivel de dificultad es requerido",
    invalid_type_error: "Nivel de dificultad no válido"
  }),
  word_public_url: z.string().optional(),
  pdf_public_url: z.string().optional(),
  // Configuración Adicional (no obligatoria)
  is_premium: z.boolean().optional().default(false),
  requires_supervision: z.boolean().optional().default(false),
})

export type RecursoFormSchema = z.infer<typeof recursoSchema>

// Constantes para los labels de los enums
export const CATEGORIA_LABELS = {
  cartas_que_curan: 'Cartas que Curan',
  colecciones_ayuda: 'Colecciones de Ayuda',
  cuentos_terapeuticos: 'Cuentos Terapéuticos',
  fichas_psicoeducativas: 'Fichas Psicoeducativas',
  guias_padres: 'Guías para Padres',
  recomendaciones_libros: 'Recomendaciones de Libros'
} as const

export const RESOURCE_TYPE_LABELS = {
  carta: 'Carta',
  guia: 'Guía',
  cuento: 'Cuento',
  ficha: 'Ficha',
  libro: 'Libro',
  actividad: 'Actividad'
} as const

export const DIFFICULTY_LABELS = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado'
} as const

export const AGE_RANGE_LABELS = {
  '0-3': '0-3 años',
  '3-6': '3-6 años',
  '6-12': '6-12 años',
  '12+': '12+ años',
  'todas': 'Todas las edades'
} as const

// ===== BLOG ARTICLES VALIDATIONS =====

export const blogArticleSchema = z.object({
  title: z.string().min(1, "Título es requerido").max(255, "Título no puede exceder 255 caracteres"),
  subtitle: z.string().optional(),
  slug: z.string().min(1, "Slug es requerido").max(255, "Slug no puede exceder 255 caracteres")
    .regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones"),
  image_1_alt: z.string().optional(),
  image_1_url: z.string().optional(),
  social_share_image: z.string().optional(),
  introduction: z.string().min(1, "La introducción es obligatoria"),
  
  // Secciones de contenido estructurado
  current_data_research: z.object({
    title: z.string().min(1, "Título es requerido"),
    content: z.string().min(1, "Contenido es requerido")
  }).optional(),
  
  reflective_question: z.string().optional(),
  
  anonymous_case: z.object({
    title: z.string().min(1, "Título es requerido"),
    content: z.string().min(1, "Contenido es requerido")
  }).optional(),
  
  psychological_analysis: z.object({
    title: z.string().min(1, "Título es requerido"),
    content: z.string().min(1, "Contenido es requerido")
  }),
  
  practical_recommendations: z.object({
    title: z.string().min(1, "Título es requerido"),
    content: z.string().min(1, "Contenido es requerido")
  }),
  
  call_to_action: z.string().optional(),
  
  empathetic_closing: z.object({
    title: z.string().min(1, "Título es requerido"),
    content: z.string().min(1, "Contenido es requerido")
  }).optional(),
  
  // Arrays de objetos
  additional_resources: z.array(z.object({
    tipo: z.string().min(1, "Tipo es requerido"),
    titulo: z.string().min(1, "Título es requerido"),
    autor: z.string().optional(),
    url: z.string().optional()
  })).optional(),
  
  faq_data: z.array(z.object({
    pregunta: z.string().min(1, "Pregunta es requerida"),
    respuesta: z.string().min(1, "Respuesta es requerida")
  })).optional(),
  
  summary_points: z.array(z.object({
    point: z.string().min(1, "Punto es requerido")
  })).optional(),
  
  bibliography: z.array(z.object({
    id: z.string().min(1, "ID es requerido"),
    authors: z.array(z.string().min(1)),
    year: z.number().min(1900).max(new Date().getFullYear()),
    title: z.string().min(1, "Título es requerido"),
    journal: z.string().optional(),
    publisher: z.string().optional(),
    volume: z.string().optional(),
    pages: z.string().optional(),
    doi: z.string().optional(),
    type: z.string().min(1, "Tipo es requerido"),
    cited_in_text: z.boolean(),
    citation_format: z.string().min(1, "Formato de cita es requerido")
  })).optional(),
  
  related_articles: z.array(z.object({
    slug: z.string().min(1, "Slug es requerido"),
    type: z.string().min(1, "Tipo es requerido"),
    title: z.string().min(1, "Título es requerido"),
    category: z.string().min(1, "Categoría es requerida"),
    image_url: z.string().optional(),
    image_alt: z.string().optional(),  // ✅ AGREGAR image_alt al schema
    relevance: z.string().min(1, "Relevancia es requerida"),
    author_name: z.string().min(1, "Nombre del autor es requerido"),
    description: z.string().optional(),
    author_image: z.string().optional()
  })).optional(),
  
  recommended_products: z.array(z.object({
    nombre: z.string().min(1, "Nombre es requerido"),
    descripcion: z.string().min(1, "Descripción es requerida"),
    url: z.string().optional(),
    categoria: z.string().optional(),
    imagen_url: z.string().optional(),
  })).optional(),
  
  professional_recommendations: z.array(z.object({
    title: z.string().min(1, "Título es requerido"),
    subtitle: z.string().optional(),
    cta_url: z.string().optional(),
    cta_text: z.string().optional(),
    display_type: z.string().optional(),
    professional_info: z.object({
      name: z.string().min(1, "Nombre es requerido"),
      title: z.string().min(1, "Título profesional es requerido"),
      approach: z.string().min(1, "Enfoque es requerido"),
      image_url: z.string().url("URL de imagen debe ser válida"),
      credentials: z.string().min(1, "Credenciales son requeridas"),
      specialties: z.array(z.string().min(1, "Especialidad no puede estar vacía")),
      experience_description: z.string().min(1, "Descripción de experiencia es requerida")
    }).optional(),
    position_after_section: z.string().optional()
  })).optional(),
  
  // Meta información
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  canonical_url: z.string().url("URL canónica debe ser válida").optional(),
  schema_markup: z.any().optional(),
  
  // Categorización
  category: z.enum(['desarrollo', 'comportamiento', 'emociones', 'educacion', 'familia', 'trastornos', 'otros']).optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  target_audience: z.string().optional(),
  age_range: z.string().optional(),
  topic_complexity: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  
  // Autor
  author_name: z.string().min(1, "Nombre del autor es requerido"),
  author_email: z.string().email("Email válido es requerido").optional(),
  author_bio: z.string().optional(),
  author_credentials: z.string().optional(),
  author_photo_url: z.string().optional(),
  author_social_links: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    web: z.string().optional()
  }).optional(),
  
  // Configuración
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  is_featured: z.boolean().optional().default(false),
  is_trending: z.boolean().optional().default(false),
  is_professional_content: z.boolean().optional().default(false),
  reading_time_minutes: z.number().min(1, "Tiempo de lectura debe ser mayor a 0").optional()
})

export type BlogArticleFormSchema = z.infer<typeof blogArticleSchema>

// Constantes para los labels de los enums del blog
export const BLOG_CATEGORY_LABELS = {
  desarrollo: 'Desarrollo Infantil',
  comportamiento: 'Comportamiento',
  emociones: 'Emociones',
  educacion: 'Educación',
  familia: 'Familia',
  trastornos: 'Trastornos',
  otros: 'Otros'
} as const

export const BLOG_COMPLEXITY_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
} as const

export const BLOG_STATUS_LABELS = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado'
} as const