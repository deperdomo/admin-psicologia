const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://eabqgmhadverstykzcrr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYnFnbWhhZHZlcnN0eWt6Y3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTQ2NTYsImV4cCI6MjA2Nzg5MDY1Nn0.aOBa7mGZ7XlmL2Lv7OAhIXuYkYNhF0JRiATstHuCtM8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnosticarSupabase() {
  console.log('=== Diagnóstico de Supabase ===\n')
  
  try {
    // 1. Verificar conexión
    console.log('1. Verificando conexión...')
    const { data: tables, error: tablesError } = await supabase
      .from('blog_articles')
      .select('count(*)')
      .limit(1)
    
    if (tablesError) {
      console.log('❌ Error de conexión:', tablesError.message)
    } else {
      console.log('✅ Conexión exitosa')
    }
    
    // 2. Verificar buckets de storage
    console.log('\n2. Verificando buckets de storage...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('❌ Error al listar buckets:', bucketsError.message)
    } else {
      console.log('📦 Buckets disponibles:')
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (público: ${bucket.public})`)
      })
    }
    
    // 3. Probar subida de imagen de prueba
    console.log('\n3. Probando subida de imagen...')
    const testData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header
    const testBlob = new Blob([testData], { type: 'image/png' })
    const testFile = new File([testBlob], 'test.png', { type: 'image/png' })
    
    const testPath = 'articles/test/test.png'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(testPath, testFile, { upsert: true })
    
    if (uploadError) {
      console.log('❌ Error al subir imagen de prueba:', uploadError.message)
      console.log('   Código:', uploadError.statusCode)
      
      // Intentar crear el bucket si no existe
      if (uploadError.message.includes('not found')) {
        console.log('   Intentando crear bucket blog-images...')
        const { data: createData, error: createError } = await supabase.storage.createBucket('blog-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880
        })
        
        if (createError) {
          console.log('   ❌ Error al crear bucket:', createError.message)
        } else {
          console.log('   ✅ Bucket blog-images creado')
        }
      }
    } else {
      console.log('✅ Imagen de prueba subida exitosamente')
      
      // Limpiar archivo de prueba
      await supabase.storage.from('blog-images').remove([testPath])
    }
    
    // 4. Verificar permisos específicos
    console.log('\n4. Verificando estructura de carpetas en blog-images...')
    const { data: files, error: listError } = await supabase.storage
      .from('blog-images')
      .list('articles', { limit: 5 })
    
    if (listError) {
      console.log('❌ Error al listar archivos:', listError.message)
    } else {
      console.log('📁 Estructura de carpetas articles:')
      files.forEach(file => {
        console.log(`  - ${file.name}`)
      })
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message)
  }
  
  console.log('\n=== Fin del diagnóstico ===')
}

diagnosticarSupabase()
