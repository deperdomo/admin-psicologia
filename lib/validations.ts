import { z } from 'zod'

export const recursoSchema = z.object({
  resource_id: z.string().min(1, "Resource ID es requerido").max(100, "Resource ID no puede exceder 100 caracteres"),
  title: z.string().min(1, "Título es requerido").max(255, "Título no puede exceder 255 caracteres"),
  description: z.string().optional(),
  categoria: z.enum([
    'cartas_que_curan',
    'colecciones_ayuda',
    'cuentos_terapeuticos',
    'fichas_psicoeducativas',
    'guias_padres',
    'recomendaciones_libros',
  ]),
  resource_type: z.enum([
    'carta',
    'guia',
    'cuento',
    'ficha',
    'libro',
    'actividad',
  ]),
  age_ranges: z.array(z.enum(['0-3', '3-6', '6-12', '12+', 'todas'])).min(1, "Selecciona al menos un rango de edad"),
  difficulty: z.enum([
    'basico',
    'intermedio',
    'avanzado',
  ]),
  tags: z.array(z.string()).optional(),
  estimated_reading_time: z.number().min(0, "El tiempo de lectura debe ser positivo").optional(),
  is_premium: z.boolean().default(false),
  is_active: z.boolean().default(true),
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