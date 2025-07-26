# 📋 Documento de Requisitos - Sistema de Administración de Recursos

## 🎯 Objetivo del Proyecto
Crear una interfaz web de administración para subir y gestionar recursos de psicología (PDFs y documentos Word) a una base de datos Supabase existente.

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Almacenamiento**: Supabase Storage
- **Autenticación**: Sin autenticación (por ahora)

### Estructura del Proyecto
```
admin-recursos/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── recursos/
│   │   ├── nuevo/
│   │   │   └── page.tsx
│   │   ├── editar/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── lista/
│   │       └── page.tsx
├── components/
│   ├── ui/ (shadcn/ui)
│   ├── forms/
│   ├── layout/
│   └── shared/
├── lib/
│   ├── supabase.ts
│   ├── types.ts
│   ├── validations.ts
│   └── utils.ts
└── types/
    └── database.ts
```

## 📊 Modelo de Datos (Existente)

### Tabla: recursos
```sql
-- Campos Obligatorios para el formulario
resource_id: VARCHAR(100) UNIQUE NOT NULL
title: VARCHAR(255) NOT NULL  
categoria: categoria_principal NOT NULL
resource_type: resource_type NOT NULL
difficulty: difficulty_level NOT NULL
age_ranges: age_range[] NOT NULL (mínimo 1 elemento)

-- Campos Opcionales (generados automáticamente o opcionales)
id: UUID PRIMARY KEY (auto-generado)
description: TEXT
tags: TEXT[]
word_file_name: VARCHAR(255)
pdf_file_name: VARCHAR(255)
word_storage_path: VARCHAR(500)
pdf_storage_path: VARCHAR(500)
word_public_url: TEXT
pdf_public_url: TEXT
is_premium: BOOLEAN DEFAULT false
is_active: BOOLEAN DEFAULT true
file_size_word: BIGINT
file_size_pdf: BIGINT
estimated_reading_time: INTEGER
download_count: INTEGER DEFAULT 0
view_count: INTEGER DEFAULT 0
created_at: TIMESTAMP (auto)
updated_at: TIMESTAMP (auto)
```

### Enums Existentes
```typescript
type ResourceType = 'carta' | 'guia' | 'cuento' | 'ficha' | 'libro' | 'actividad'
type AgeRange = '0-3' | '3-6' | '6-12' | '12+' | 'todas'
type DifficultyLevel = 'basico' | 'intermedio' | 'avanzado'
type CategoriaPrincipal = 'cartas_que_curan' | 'colecciones_ayuda' | 'cuentos_terapeuticos' | 'fichas_psicoeducativas' | 'guias_padres' | 'recomendaciones_libros'
```

## 🎨 Funcionalidades Principales

### 1. Crear Nuevo Recurso
**Ruta**: `/recursos/nuevo`

#### Formulario - Campos Obligatorios:
1. **Resource ID** (text input)
   - Máximo 100 caracteres
   - Único en la base de datos
   - Validación en tiempo real de duplicados

2. **Título** (text input)
   - Máximo 255 caracteres
   - Campo requerido

3. **Categoría** (select)
   - Opciones del enum `categoria_principal`
   - Campo requerido

4. **Tipo de Recurso** (select)
   - Opciones del enum `resource_type`
   - Campo requerido

5. **Dificultad** (select)
   - Opciones del enum `difficulty_level`
   - Campo requerido

6. **Rangos de Edad** (multi-select)
   - Opciones del enum `age_range`
   - Mínimo 1 selección requerida
   - Permite múltiples selecciones

#### Formulario - Campos Opcionales:
7. **Descripción** (textarea)
   - Campo de texto largo opcional

8. **Tags** (input con chips)
   - Texto libre separado por comas
   - Conversión automática a array

9. **Tiempo de Lectura** (number input)
   - En minutos
   - Campo opcional

10. **Es Premium** (checkbox)
    - Por defecto: false

11. **Está Activo** (checkbox)
    - Por defecto: true

#### Subida de Archivos:
12. **Archivo Word** (file input)
    - Formatos: .doc, .docx
    - Tamaño máximo: 5MB
    - Opcional pero recomendado

13. **Archivo PDF** (file input)
    - Formato: .pdf
    - Tamaño máximo: 5MB
    - Opcional

**Conversión Automática**: Si solo se sube Word, intentar conversión automática a PDF usando librerías como `pdf-lib` o servicios externos.

#### Validaciones del Formulario:
- **resource_id**: Único, no vacío, máximo 100 caracteres
- **title**: No vacío, máximo 255 caracteres
- **age_ranges**: Array no vacío
- **Archivos**: Tamaño máximo 5MB cada uno
- **Duplicados**: Verificación en tiempo real contra la base de datos

#### Flujo de Envío:
1. Validar formulario en cliente
2. Verificar duplicados de `resource_id`
3. Subir archivos a Supabase Storage
4. Extraer metadatos de archivos (tamaño)
5. Insertar registro en tabla `recursos`
6. Mostrar confirmación de éxito con pop-up
7. Redireccionar a lista de recursos

### 2. Editar Recurso Existente
**Ruta**: `/recursos/editar/[id]`

- Mismo formulario que crear pero pre-populado
- Permitir cambio de archivos
- Mantener archivos existentes si no se suben nuevos
- Actualizar `updated_at` automáticamente

### 3. Lista de Recursos
**Ruta**: `/recursos/lista`

- Tabla con todos los recursos
- Columnas: ID, Título, Categoría, Tipo, Estado, Fecha de Creación
- Acciones: Editar, Ver detalles
- Paginación
- Filtros básicos por categoría y tipo

## 🔧 Especificaciones Técnicas

### Configuración de Supabase
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Tipos TypeScript
```typescript
// types/database.ts
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
```

### Validaciones con Zod
```typescript
// lib/validations.ts
import { z } from 'zod'

export const recursoSchema = z.object({
  resource_id: z.string().min(1, "Resource ID es requerido").max(100),
  title: z.string().min(1, "Título es requerido").max(255),
  description: z.string().optional(),
  categoria: z.enum(['cartas_que_curan', 'colecciones_ayuda', /* ... */]),
  resource_type: z.enum(['carta', 'guia', 'cuento', /* ... */]),
  age_ranges: z.array(z.enum(['0-3', '3-6', '6-12', /* ... */])).min(1),
  difficulty: z.enum(['basico', 'intermedio', 'avanzado']),
  tags: z.array(z.string()).optional(),
  estimated_reading_time: z.number().min(0).optional(),
  is_premium: z.boolean().default(false),
  is_active: z.boolean().default(true),
})
```

### Gestión de Archivos
```typescript
// lib/fileUpload.ts
export async function uploadFile(
  file: File, 
  bucket: string, 
  path: string
): Promise<string> {
  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('El archivo excede el tamaño máximo de 5MB')
  }
  
  // Subir a Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
    
  if (error) throw error
  
  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
    
  return publicUrl
}
```

## 🎯 Componentes UI Requeridos

### 1. Formulario Principal
- **Componente**: `RecursoForm`
- **Props**: `{ recurso?: Recurso, onSubmit: (data: RecursoFormData) => void }`
- **Estado**: Usar `react-hook-form` con validación Zod

### 2. Selector Múltiple de Edad
- **Componente**: `AgeRangeSelector`
- **Funcionalidad**: Checkboxes para múltiple selección

### 3. Input de Tags
- **Componente**: `TagInput`
- **Funcionalidad**: Input con chips, agregar/quitar tags

### 4. Subida de Archivos
- **Componente**: `FileUpload`
- **Funcionalidad**: Drag & drop, validación de tamaño y tipo

### 5. Modal de Confirmación
- **Componente**: `SuccessModal`
- **Funcionalidad**: Pop-up con check de éxito

## 🔄 Flujos de Trabajo

### Flujo de Creación de Recurso
1. Usuario navega a `/recursos/nuevo`
2. Completa formulario obligatorio
3. Sube archivos (opcional)
4. Sistema valida datos
5. Verifica duplicados de `resource_id`
6. Sube archivos a Storage
7. Intenta conversión Word → PDF si es necesario
8. Extrae metadatos de archivos
9. Inserta registro en base de datos
10. Muestra modal de éxito
11. Redirecciona a lista de recursos

### Flujo de Edición
1. Usuario navega a `/recursos/editar/[id]`
2. Sistema carga datos existentes
3. Pre-popula formulario
4. Usuario modifica campos necesarios
5. Opcionalmente cambia archivos
6. Sistema actualiza registro
7. Muestra confirmación
8. Redirecciona a lista

## 🛡️ Seguridad y Validaciones

### Validaciones de Cliente
- Campos obligatorios no vacíos
- Formatos de archivo correctos
- Tamaño máximo de archivos (5MB)
- Unicidad de `resource_id` en tiempo real

### Validaciones de Servidor
- Re-validación de todos los campos
- Verificación de duplicados en base de datos
- Sanitización de inputs
- Validación de tipos de archivo en servidor

### Manejo de Errores
- Mensajes de error claros y específicos
- Retry automático para fallos de red
- Rollback de archivos si falla inserción en BD
- Logs detallados de errores

## 📱 Experiencia de Usuario

### Feedback Visual
- Estados de carga durante subida
- Validación en tiempo real
- Mensajes de error inline
- Pop-up de confirmación con check verde
- Confirmación antes de enviar formulario

### Navegación
- Breadcrumbs claros
- Botones de cancelar/guardar
- Redirección automática después de éxito
- Enlaces a lista de recursos

## 🚀 Plan de Implementación

### Fase 1: Setup Inicial (Día 1)
1. Crear proyecto Next.js con TypeScript
2. Configurar Tailwind CSS y shadcn/ui
3. Configurar conexión a Supabase
4. Crear tipos TypeScript basados en la BD
5. Setup de validaciones con Zod

### Fase 2: Formulario Básico (Día 2-3)
1. Crear componente `RecursoForm`
2. Implementar campos obligatorios
3. Agregar validaciones del lado cliente
4. Crear selectors para enums
5. Implementar selector múltiple de edad

### Fase 3: Subida de Archivos (Día 4)
1. Crear componente `FileUpload`
2. Implementar subida a Supabase Storage
3. Agregar validaciones de archivos
4. Extraer metadatos de archivos
5. Implementar conversión Word a PDF (si es posible)

### Fase 4: Integración con BD (Día 5)
1. Crear funciones para insertar/actualizar recursos
2. Implementar verificación de duplicados
3. Agregar manejo de errores
4. Testing de flujo completo

### Fase 5: Lista y Edición (Día 6)
1. Crear componente de lista de recursos
2. Implementar formulario de edición
3. Agregar navegación entre páginas
4. Crear componentes de feedback (modals)

### Fase 6: Pulimiento (Día 7)
1. Mejorar estilos y UX
2. Optimizar rendimiento
3. Agregar más validaciones
4. Testing exhaustivo
5. Documentación final

## 📝 Notas Adicionales

### Librerías Adicionales Necesarias
```json
{
  "@supabase/supabase-js": "^2.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "react-dropzone": "^14.x",
  "pdf-lib": "^1.x" // Para conversión Word a PDF
}
```

### Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Consideraciones de Storage
- Crear buckets separados para Word y PDF si es necesario
- Configurar políticas de acceso público para archivos
- Implementar naming convention para archivos: `{resource_id}.{extension}`

Este documento debe ser suficiente para que un agente IA pueda implementar el sistema paso a paso, con todos los detalles técnicos y de negocio necesarios.