# Documentación del Formulario de Artículos

## Resumen
Este documento describe todos los campos, labels e inputs implementados en el formulario de artículos del admin panel de psicología. El formulario está diseñado para capturar toda la información necesaria según la estructura de la base de datos y el formato de ejemplo proporcionado.

## Campos Implementados

### 1. Información Básica del Artículo

#### `title` - Título del Artículo
- **Label**: "Título del Artículo"
- **Input**: `Input` (texto)
- **Validación**: Requerido, mínimo 10 caracteres
- **Formato esperado**: Título principal del artículo
- **Ejemplo**: `"Cómo la presión social afecta la autoestima de los niños"`

#### `subtitle` - Subtítulo
- **Label**: "Subtítulo"
- **Input**: `Textarea` (texto largo)
- **Validación**: Opcional
- **Formato esperado**: Descripción complementaria del artículo
- **Ejemplo**: `"Estrategias para proteger el bienestar emocional infantil en un mundo de comparaciones constantes"`

#### `slug` - URL Amigable
- **Label**: "Slug (URL amigable)"
- **Input**: `Input` (texto, auto-generado)
- **Validación**: Requerido, formato slug
- **Generación**: Automática basada en el título
- **Formato esperado**: kebab-case sin caracteres especiales
- **Ejemplo**: `"como-presion-social-afecta-autoestima-ninos"`

### 2. Categorización

#### `category` - Categoría
- **Label**: "Categoría"
- **Input**: `Select`
- **Validación**: Requerido
- **Opciones**:
  - Psicología Infantil
  - Psicología Adolescente
  - Psicología Adultos
  - Terapia Familiar
  - Trastornos de Ansiedad
  - Depresión
  - Autoestima
  - Relaciones
  - Mindfulness
  - Desarrollo Personal

#### `tags` - Etiquetas
- **Label**: "Etiquetas"
- **Input**: `TagInput` (componente personalizado)
- **Validación**: Array de strings
- **Formato esperado**: Lista de palabras clave
- **Ejemplo**: `["autoestima", "niños", "presión social", "desarrollo infantil"]`

#### `age_range` - Rango de Edad
- **Label**: "Rango de Edad"
- **Input**: `AgeRangeSelector` (componente personalizado)
- **Validación**: Requerido
- **Opciones**:
  - 0-5 años (Primera infancia)
  - 6-12 años (Infancia)
  - 13-17 años (Adolescencia)
  - 18-30 años (Adulto joven)
  - 31-50 años (Adulto)
  - 51+ años (Adulto mayor)
  - Todas las edades

### 3. Contenido Principal

#### `introduction` - Introducción
- **Label**: "Introducción"
- **Input**: `Textarea`
- **Validación**: Requerido, mínimo 100 caracteres
- **Formato esperado**: Texto con Markdown soportado
- **Características**:
  - Soporte para **negrita**, *cursiva*, ***negrita y cursiva***
  - Saltos de línea con `\\n`
  - Párrafos separados con `\\n\\n`
- **Ejemplo**: Ver estructura en archivo ejemplo

#### `current_data_research` - Datos e Investigación Actual
- **Label**: "Datos e Investigación Actual"
- **Input**: Objeto JSON con título y contenido
- **Estructura**:
  ```json
  {
    "title": "Título de la sección",
    "content": "Contenido con formato Markdown"
  }
  ```
- **Formato esperado**: Datos estadísticos, estudios recientes, investigaciones
- **Ejemplo**: `{"title": "Lo que dice la investigación", "content": "Según un estudio..."}`

#### `reflective_question` - Pregunta Reflexiva
- **Label**: "Pregunta Reflexiva"
- **Input**: `Textarea`
- **Validación**: Opcional
- **Formato esperado**: Pregunta que conecte con el lector
- **Ejemplo**: `"¿Has notado que tu hijo se compara constantemente con otros niños?"`

#### `anonymous_case` - Caso Anónimo
- **Label**: "Caso Anónimo"
- **Input**: Objeto JSON con título y contenido
- **Estructura**:
  ```json
  {
    "title": "Título del caso",
    "content": "Descripción del caso clínico"
  }
  ```
- **Formato esperado**: Caso clínico real anonimizado
- **Ejemplo**: `{"title": "Caso real (nombre modificado por privacidad)", "content": "Carmen, madre de..."}`

#### `psychological_analysis` - Análisis Psicológico
- **Label**: "Análisis Psicológico"
- **Input**: Objeto JSON con título y contenido
- **Estructura**:
  ```json
  {
    "title": "Título del análisis",
    "content": "Análisis teórico y científico"
  }
  ```
- **Formato esperado**: Base teórica, neurobiología, teorías psicológicas
- **Ejemplo**: `{"title": "Análisis desde la Psicología del Desarrollo", "content": "Desde la psicología..."}`

#### `practical_recommendations` - Recomendaciones Prácticas
- **Label**: "Recomendaciones Prácticas"
- **Input**: Objeto JSON con título y contenido
- **Estructura**:
  ```json
  {
    "title": "Título de las recomendaciones",
    "content": "Lista numerada de recomendaciones"
  }
  ```
- **Formato esperado**: Lista práctica para padres/profesionales
- **Ejemplo**: Lista numerada con estrategias aplicables

#### `call_to_action` - Llamada a la Acción
- **Label**: "Llamada a la Acción"
- **Input**: `Textarea`
- **Validación**: Opcional
- **Formato esperado**: Invitación a buscar ayuda profesional o tomar acción
- **Ejemplo**: `"Si notas que la autoestima de tu hijo se ve persistentemente afectada..."`

### 4. Metadatos y SEO

#### `meta_description` - Meta Descripción
- **Label**: "Meta Descripción (SEO)"
- **Input**: `Textarea`
- **Validación**: Máximo 160 caracteres
- **Formato esperado**: Descripción para motores de búsqueda

#### `focus_keyword` - Palabra Clave Principal
- **Label**: "Palabra Clave Principal"
- **Input**: `Input`
- **Validación**: Opcional
- **Formato esperado**: Keyword principal para SEO

#### `schema_markup` - Marcado de Esquema
- **Label**: "Schema Markup (JSON-LD)"
- **Input**: `Textarea` (JSON)
- **Validación**: JSON válido
- **Formato esperado**: Esquema estructurado para buscadores
- **Ejemplo**:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Título del artículo",
    "author": {
      "@type": "Person",
      "name": "Nombre del autor"
    }
  }
  ```

### 5. Imágenes

#### `image_1_url` - Imagen Principal
- **Label**: "Imagen Principal"
- **Input**: `ImageUpload` (componente personalizado)
- **Validación**: Requerido
- **Formato esperado**: URL de imagen optimizada
- **Características**: Upload automático a Supabase Storage

#### `image_1_alt` - Texto Alternativo
- **Label**: "Texto Alternativo de Imagen"
- **Input**: `Input`
- **Validación**: Requerido
- **Formato esperado**: Descripción accesible de la imagen

#### `social_share_image` - Imagen para Redes Sociales
- **Label**: "Imagen para Redes Sociales"
- **Input**: `ImageUpload`
- **Validación**: Opcional
- **Formato esperado**: Imagen optimizada para compartir (1200x630px recomendado)

### 6. Autoría

#### `author_name` - Nombre del Autor
- **Label**: "Nombre del Autor"
- **Input**: `Input`
- **Validación**: Requerido
- **Formato esperado**: Nombre completo del profesional

#### `author_bio` - Biografía del Autor
- **Label**: "Biografía del Autor"
- **Input**: `Textarea`
- **Validación**: Opcional
- **Formato esperado**: Descripción profesional breve

### 7. Secciones Adicionales

#### `additional_resources` - Recursos Adicionales
- **Label**: "Recursos Adicionales"
- **Input**: `AdditionalResourcesInput` (componente personalizado)
- **Validación**: Array de objetos
- **Estructura de cada elemento**:
  ```typescript
  {
    tipo: string,      // "libro", "artículo", "herramienta"
    titulo: string,    // Nombre del recurso
    autor?: string,    // Autor (opcional)
    url?: string       // Enlace (opcional)
  }
  ```

#### `faq` - Preguntas Frecuentes
- **Label**: "Preguntas Frecuentes (FAQ)"
- **Input**: `FaqInput` (componente personalizado)
- **Validación**: Array de objetos
- **Estructura de cada elemento**:
  ```typescript
  {
    pregunta: string,  // Pregunta
    respuesta: string  // Respuesta
  }
  ```

#### `summary_points` - Puntos de Resumen
- **Label**: "Puntos de Resumen"
- **Input**: `SummaryPointsInput` (componente personalizado)
- **Validación**: Array de objetos
- **Estructura de cada elemento**:
  ```typescript
  {
    point: string      // Punto clave del artículo
  }
  ```

#### `bibliography` - Bibliografía
- **Label**: "Bibliografía"
- **Input**: `BibliographyInput` (componente personalizado)
- **Validación**: Array de objetos
- **Estructura de cada elemento**:
  ```typescript
  {
    id: string,             // ID único (ej: "ucm2024")
    doi?: string,           // DOI (opcional)
    type: string,           // "journal_article", "book", "report", etc.
    year: number,           // Año de publicación
    pages?: string,         // Páginas (opcional, ej: "123-145")
    title: string,          // Título de la publicación
    volume?: string,        // Volumen (opcional)
    authors: string[],      // Array de autores ["Apellido, N.", "Otro, M."]
    journal?: string,       // Revista o conferencia (opcional)
    publisher?: string,     // Editorial (opcional para libros/reportes)
    cited_in_text: boolean, // Si está citado en el texto
    citation_format: string // "apa", "mla", "chicago", "vancouver"
  }
  ```
- **Características**:
  - Gestión dinámica de múltiples autores
  - Campos específicos según el tipo de publicación
  - Checkbox para marcar si está citado en el texto
  - Selector de formato de citación

#### `related_articles` - Artículos Relacionados
- **Label**: "Artículos Relacionados"
- **Input**: `RelatedArticlesInput` (componente personalizado)
- **Validación**: Array de objetos
- **Características**: 
  - Búsqueda en tiempo real de artículos existentes por título, categoría o tags
  - Auto-completado de campos al seleccionar un artículo
  - Campo relevance se debe completar manualmente
- **Estructura de cada elemento**:
  ```typescript
  {
    slug: string,            // Slug del artículo (requerido)
    type: string,           // "internal" (siempre para artículos internos)
    title: string,          // Título del artículo (auto-completado)
    category: string,       // Categoría del artículo (auto-completado)
    image_url?: string,     // URL de imagen (auto-completado, opcional)
    relevance: string,      // "high", "medium", "low" (manual)
    author_name: string,    // Nombre del autor (auto-completado)
    description?: string,   // Descripción breve (auto-completado, opcional)
    author_image?: string   // Imagen del autor (auto-completado, opcional)
  }
  ```

#### `professional_recommendations` - Recomendaciones Profesionales
- **Label**: "Recomendaciones Profesionales"
- **Input**: `ProfessionalRecommendationsInput` (componente personalizado)
- **Validación**: Array de objetos
- **Características**:
  - Búsqueda de profesionales en base de datos
  - Selección de tipo de recomendación
- **Estructura de cada elemento**:
  ```typescript
  {
    professional: {
      name: string,         // Nombre del profesional
      specialty: string,    // Especialidad
      credentials: string,  // Credenciales
      contact?: string     // Información de contacto (opcional)
    },
    recommendation_type: string, // "primary", "specialist", "consultation"
    notes: string               // Notas adicionales
  }
  ```

#### `recommended_products` - Productos Recomendados
- **Label**: "Productos Recomendados"
- **Input**: `RecommendedProductsInput` (componente personalizado)
- **Validación**: Objeto JSON
- **Formato esperado**: Lista de productos con affiliate links
- **Estructura**:
  ```json
  {
    "products": [
      {
        "name": "Nombre del producto",
        "description": "Descripción del producto",
        "affiliate_link": "https://...",
        "category": "books|apps|toys|therapy_tools"

      }
    ]
  }
  ```

### 8. Configuración de Publicación

#### `status` - Estado
- **Label**: "Estado de Publicación"
- **Input**: `Select`
- **Opciones**:
  - draft (Borrador)
  - published (Publicado)
  - archived (Archivado)

#### `featured` - Artículo Destacado
- **Label**: "Artículo Destacado"
- **Input**: `Checkbox`
- **Formato esperado**: Boolean

#### `publish_date` - Fecha de Publicación
- **Label**: "Fecha de Publicación"
- **Input**: `Input` (datetime-local)
- **Validación**: Requerido
- **Formato esperado**: ISO timestamp

## Validación del Formulario

El formulario utiliza **Zod** para validación con el siguiente esquema:

```typescript
const BlogArticleSchema = z.object({
  title: z.string().min(10, "El título debe tener al menos 10 caracteres"),
  subtitle: z.string().optional(),
  slug: z.string().min(1, "El slug es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  tags: z.array(z.string()),
  age_range: z.string().min(1, "El rango de edad es requerido"),
  introduction: z.string().min(100, "La introducción debe tener al menos 100 caracteres"),
  current_data_research: z.object({
    title: z.string(),
    content: z.string()
  }),
  // ... resto de campos con validaciones específicas
})
```

## Componentes Personalizados Implementados

1. **`TagInput`**: Manejo de etiquetas con autocompletado
2. **`AgeRangeSelector`**: Selector de rangos de edad predefinidos
3. **`ImageUpload`**: Upload de imágenes con preview y validación
4. **`AdditionalResourcesInput`**: Gestión de recursos adicionales
5. **`FaqInput`**: Creación de preguntas frecuentes
6. **`SummaryPointsInput`**: Puntos clave del artículo
7. **`BibliographyInput`**: Referencias bibliográficas completas
8. **`RelatedArticlesInput`**: Búsqueda y selección de artículos relacionados
9. **`ProfessionalRecommendationsInput`**: Búsqueda y recomendación de profesionales
10. **`RecommendedProductsInput`**: Productos con enlaces de afiliado

## Notas de Implementación

- Todos los campos de texto soportan **Markdown básico**
- Los uploads de imagen se manejan automáticamente con **Supabase Storage**
- La validación es **en tiempo real** durante la escritura
- El formulario guarda **borradores automáticos** cada 30 segundos
- Soporte completo para **edición** de artículos existentes
- **Responsive design** optimizado para mobile y desktop

## Formato de Salida

El formulario genera un objeto que coincide exactamente con la estructura de la base de datos `blog_articles` y es compatible con el formato JSON del archivo de ejemplo proporcionado.

## Actualizaciones Recientes

### Bibliografía - Estructura Actualizada
La sección de bibliografía ha sido actualizada para coincidir exactamente con la estructura de la tabla en Supabase:

**Cambios principales:**
- Campo `id` en lugar de `reference_id`
- Campo `authors` como array de strings en lugar de string único
- Agregado campo `cited_in_text` como checkbox
- Agregado campo `citation_format` con opciones predefinidas
- Campos específicos según el tipo de publicación
- Gestión dinámica de múltiples autores

**Ejemplo de estructura:**
```json
[
  {
    "id": "ucm2024",
    "doi": "10.1234/rpd.2024.45.123",
    "type": "journal_article",
    "year": 2024,
    "pages": "123-145",
    "title": "Impacto de la presión social digital...",
    "volume": "45",
    "authors": ["García-López, M.", "Rodríguez-Fernández, A."],
    "journal": "Revista de Psicología del Desarrollo",
    "cited_in_text": true,
    "citation_format": "apa"
  }
]
```

### Artículos Relacionados - Estructura Actualizada
La sección de artículos relacionados ha sido mejorada con funcionalidad de búsqueda avanzada:

**Cambios principales:**
- Búsqueda en tiempo real por título, categoría o tags
- Auto-completado de todos los campos excepto `relevance`
- Estructura más completa con información del autor e imagen
- Campo `slug` como requerido
- Campo `type` siempre "internal" para artículos internos

**Funcionalidad de búsqueda:**
1. El usuario escribe en el campo de búsqueda
2. Se muestra una lista desplegable con resultados filtrados
3. Al seleccionar un artículo, se auto-completan todos los campos
4. El usuario debe seleccionar manualmente la relevancia

**Ejemplo de estructura:**
```json
[
  {
    "slug": "como-combatir-soledad-en-maternidad",
    "type": "internal",
    "title": "¿Cómo combatir la Soledad en la Maternidad?",
    "category": "Psicología social y relaciones personales",
    "image_url": "/articles/soledad-maternidad.webp",
    "relevance": "high",
    "author_name": "Nerea Moreno",
    "description": "Estrategias para madres que experimentan aislamiento...",
    "author_image": "/authors/nerea-moreno.webp"
  }
]
```