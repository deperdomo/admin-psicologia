import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para el frontend (con RLS habilitado)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para el backend/API routes (bypasea RLS - solo usar en server-side)
// IMPORTANTE: Este cliente solo debe ser usado en código del servidor (API routes, Server Components)
export const supabaseAdmin = (() => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceKey) {
    // En el cliente, esto no estará disponible, así que retornamos el cliente normal
    // Solo usar supabaseAdmin en código del servidor
    if (typeof window !== 'undefined') {
      console.warn('⚠️ supabaseAdmin no está disponible en el cliente. Usa supabase en su lugar.')
      return supabase
    }
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()