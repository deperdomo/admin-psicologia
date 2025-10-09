-- Crear tabla blocked_slots para gestionar horarios bloqueados
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  blocked_date DATE NOT NULL,
  blocked_time TIME WITHOUT TIME ZONE NULL, -- NULL = todo el día bloqueado
  reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  CONSTRAINT blocked_slots_pkey PRIMARY KEY (id),
  CONSTRAINT unique_blocked_slot UNIQUE (blocked_date, blocked_time)
);

-- Crear índice para mejorar búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date 
ON public.blocked_slots USING btree (blocked_date);

-- Habilitar Row Level Security
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede ver los slots bloqueados (para validar disponibilidad)
CREATE POLICY "Anyone can view blocked slots"
ON blocked_slots FOR SELECT
USING (true);

-- Política: Solo usuarios autenticados pueden gestionar blocked slots
CREATE POLICY "Admin can manage blocked slots"
ON blocked_slots FOR ALL
USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE public.blocked_slots IS 'Almacena los días y horarios bloqueados por el administrador';
COMMENT ON COLUMN public.blocked_slots.blocked_time IS 'NULL indica que todo el día está bloqueado';
