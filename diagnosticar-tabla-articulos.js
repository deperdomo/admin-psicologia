const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://eabqgmhadverstykzcrr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYnFnbWhhZHZlcnN0eWt6Y3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTQ2NTYsImV4cCI6MjA2Nzg5MDY1Nn0.aOBa7mGZ7XlmL2Lv7OAhIXuYkYNhF0JRiATstHuCtM8'

async function diagnosticarTablaArticulos() {
  console.log('=== Diagnóstico de Tabla blog_articles ===\n')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // 1. Intentar verificar la estructura de la tabla
    console.log('1. Verificando acceso a la tabla blog_articles...')
    
    const { data: testData, error: testError } = await supabase
      .from('blog_articles')
      .select('count(*)')
      .limit(1)
    
    if (testError) {
      console.log(`❌ Error de acceso: ${testError.message}`)
      console.log(`   Código: ${testError.code}`)
      
      if (testError.message.includes('relation "public.blog_articles" does not exist')) {
        console.log('\n🔍 PROBLEMA: La tabla blog_articles no existe')
        console.log('📝 SOLUCIÓN: Necesitas crear la tabla primero')
        console.log('   Ve al README o documentación para el SQL de creación de tabla')
        return
      }
      
      if (testError.message.includes('row-level security')) {
        console.log('\n🔍 PROBLEMA: Políticas RLS bloqueando acceso')
        console.log('📝 SOLUCIÓN: Configura las políticas RLS')
      }
    } else {
      console.log('✅ Acceso a tabla exitoso')
    }
    
    // 2. Intentar inserción de prueba
    console.log('\n2. Probando inserción en blog_articles...')
    
    const testArticle = {
      title: 'Test Article',
      slug: `test-article-${Date.now()}`,
      introduction: 'Test introduction',
      psychological_analysis: JSON.stringify({
        title: 'Test Analysis',
        content: 'Test content'
      }),
      practical_recommendations: JSON.stringify({
        title: 'Test Recommendations', 
        content: 'Test content'
      }),
      author_name: 'Test Author',
      status: 'draft'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('blog_articles')
      .insert([testArticle])
      .select()
      .single()
    
    if (insertError) {
      console.log(`❌ Error en inserción: ${insertError.message}`)
      console.log(`   Código: ${insertError.code}`)
      
      if (insertError.code === '42501' && insertError.message.includes('row-level security policy')) {
        console.log('\n🔍 PROBLEMA IDENTIFICADO: Faltan políticas RLS')
        console.log('📝 SOLUCIONES POSIBLES:')
        console.log('   OPCIÓN 1 - Deshabilitar RLS (más fácil para desarrollo):')
        console.log('   ALTER TABLE public.blog_articles DISABLE ROW LEVEL SECURITY;')
        console.log('')
        console.log('   OPCIÓN 2 - Crear políticas públicas (más seguro):')
        console.log('   Ejecuta el archivo: supabase-blog-articles-policies.sql')
        console.log('')
        console.log('   OPCIÓN 3 - Políticas específicas por rol (producción):')
        console.log('   Configura políticas basadas en autenticación')
      }
      
    } else {
      console.log('✅ Inserción exitosa')
      console.log(`   ID: ${insertData.id}`)
      console.log(`   Título: ${insertData.title}`)
      
      // Limpiar
      console.log('\n3. Limpiando datos de prueba...')
      await supabase.from('blog_articles').delete().eq('id', insertData.id)
      console.log('✅ Datos de prueba eliminados')
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
  
  console.log('\n=== INSTRUCCIONES PARA SOLUCIONAR ===')
  console.log('1. Ve al Dashboard de Supabase: https://app.supabase.com/projects')
  console.log('2. Abre tu proyecto admin-psicologia')
  console.log('3. Ve al SQL Editor')
  console.log('4. OPCIÓN RÁPIDA - Ejecuta esto para deshabilitar RLS:')
  console.log('')
  console.log('   ALTER TABLE public.blog_articles DISABLE ROW LEVEL SECURITY;')
  console.log('')
  console.log('5. OPCIÓN COMPLETA - Ejecuta todo el contenido del archivo:')
  console.log('   supabase-blog-articles-policies.sql')
  console.log('')
  console.log('6. Verifica que funcione ejecutando este script nuevamente')
}

diagnosticarTablaArticulos()
