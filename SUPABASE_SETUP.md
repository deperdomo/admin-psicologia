# 🔧 Configuración de Supabase

## 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y la clave anónima

## 2. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y actualiza las variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

## 3. Crear Tabla de Recursos

Ejecuta este SQL en el editor de Supabase:

```sql
-- Crear enums
CREATE TYPE categoria_principal AS ENUM (
  'cartas_que_curan',
  'colecciones_ayuda', 
  'cuentos_terapeuticos',
  'fichas_psicoeducativas',
  'guias_padres',
  'recomendaciones_libros'
);

CREATE TYPE resource_type AS ENUM (
  'carta',
  'guia',
  'cuento',
  'ficha',
  'libro',
  'actividad'
);

CREATE TYPE difficulty AS ENUM (
  'basico',
  'intermedio',
  'avanzado'
);

CREATE TYPE age_range AS ENUM (
  '0-3',
  '3-6',
  '6-12',
  '12+',
  'todas'
);

-- Crear tabla recursos
CREATE TABLE recursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  categoria categoria_principal NOT NULL,
  resource_type resource_type NOT NULL,
  difficulty difficulty NOT NULL,
  age_ranges age_range[] NOT NULL,
  tags TEXT[],
  word_file_name VARCHAR(255),
  pdf_file_name VARCHAR(255),
  word_storage_path VARCHAR(500),
  pdf_storage_path VARCHAR(500),
  word_public_url TEXT,
  pdf_public_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  file_size_word BIGINT,
  file_size_pdf BIGINT,
  estimated_reading_time INTEGER,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_recursos_resource_id ON recursos(resource_id);
CREATE INDEX idx_recursos_categoria ON recursos(categoria);
CREATE INDEX idx_recursos_resource_type ON recursos(resource_type);
CREATE INDEX idx_recursos_is_active ON recursos(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recursos_updated_at 
    BEFORE UPDATE ON recursos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 4. Configurar Storage

1. Ve a Storage en el panel de Supabase
2. Crea dos buckets:
   - `recursos-word` (para documentos Word)
   - `recursos-pdf` (para documentos PDF)

3. Configura políticas públicas para ambos buckets:

```sql
-- Política para recursos-word
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'recursos-word');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recursos-word');

-- Política para recursos-pdf  
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'recursos-pdf');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recursos-pdf');
```

## 5. Verificar Configuración

Ejecuta el proyecto y verifica que:
- ✅ Se conecta a Supabase sin errores
- ✅ Puedes crear recursos
- ✅ Los archivos se suben correctamente
- ✅ Los datos se guardan en la tabla

## 🔍 Troubleshooting

### Error de conexión
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Error de permisos en Storage
- Verifica que los buckets existan
- Confirma que las políticas estén configuradas

### Error en la tabla
- Ejecuta el SQL de creación de tabla completo
- Verifica que todos los enums estén creados