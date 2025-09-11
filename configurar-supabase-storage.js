const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://eabqgmhadverstykzcrr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhYnFnbWhhZHZlcnN0eWt6Y3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTQ2NTYsImV4cCI6MjA2Nzg5MDY1Nn0.aOBa7mGZ7XlmL2Lv7OAhIXuYkYNhF0JRiATstHuCtM8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function configurarPoliticasStorage() {
  console.log('=== Configurando Políticas de Storage para blog-images ===\n')
  
  try {
    // 1. Verificar que el bucket blog-images existe
    console.log('1. Verificando bucket blog-images...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      throw new Error(`Error al listar buckets: ${bucketsError.message}`)
    }
    
    const blogImagesBucket = buckets?.find(bucket => bucket.name === 'blog-images')
    
    if (!blogImagesBucket) {
      console.log('   Bucket blog-images no existe, creándolo...')
      const { data: createData, error: createError } = await supabase.storage.createBucket('blog-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        throw new Error(`Error al crear bucket: ${createError.message}`)
      }
      console.log('   ✅ Bucket blog-images creado exitosamente')
    } else {
      console.log(`   ✅ Bucket blog-images existe (público: ${blogImagesBucket.public})`)
    }
    
    // 2. Probar subida de imagen
    console.log('\n2. Probando subida de imagen de prueba...')
    
    // Crear una imagen PNG mínima válida (1x1 pixel transparente)
    const pngData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions  
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // bit depth, color type, etc.
      0x89, 0x00, 0x00, 0x00, 0x0B, 0x49, 0x44, 0x41, // IDAT chunk start
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // end of IDAT
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
      0x42, 0x60, 0x82
    ])
    
    const testBlob = new Blob([pngData], { type: 'image/png' })
    const testFile = new File([testBlob], 'test-upload.png', { type: 'image/png' })
    
    const testPath = `articles/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/test-upload.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(testPath, testFile, { 
        cacheControl: '3600',
        upsert: true 
      })
    
    if (uploadError) {
      console.log(`   ❌ Error al subir: ${uploadError.message}`)
      console.log(`   Código de error: ${uploadError.statusCode}`)
      
      if (uploadError.message.includes('new row violates row-level security policy')) {
        console.log('   🔍 Problema: Las políticas RLS están bloqueando la subida')
        console.log('   📝 Solución: Ejecuta el archivo supabase-storage-policies.sql en el SQL Editor de Supabase')
      }
    } else {
      console.log('   ✅ Imagen de prueba subida exitosamente')
      console.log(`   📁 Path: ${testPath}`)
      
      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(testPath)
      
      console.log(`   🌐 URL pública: ${publicUrlData.publicUrl}`)
      
      // Limpiar archivo de prueba
      console.log('\n3. Limpiando archivo de prueba...')
      const { error: deleteError } = await supabase.storage
        .from('blog-images')
        .remove([testPath])
      
      if (deleteError) {
        console.log(`   ⚠️ No se pudo eliminar archivo de prueba: ${deleteError.message}`)
      } else {
        console.log('   ✅ Archivo de prueba eliminado')
      }
    }
    
    // 3. Verificar estructura de carpetas existente
    console.log('\n4. Verificando estructura de carpetas existente...')
    const { data: articlesFolder, error: listError } = await supabase.storage
      .from('blog-images')
      .list('articles', { limit: 10 })
    
    if (listError) {
      console.log(`   ❌ Error al listar carpeta articles: ${listError.message}`)
    } else {
      console.log(`   📁 Carpetas en /articles: ${articlesFolder.length}`)
      articlesFolder.forEach(item => {
        console.log(`     - ${item.name}${item.id ? '' : '/'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('\n🔧 Pasos para solucionar:')
    console.log('1. Ve al Dashboard de Supabase')
    console.log('2. Abre el SQL Editor')
    console.log('3. Ejecuta el contenido del archivo supabase-storage-policies.sql')
    console.log('4. Verifica que el bucket blog-images esté marcado como público')
  }
  
  console.log('\n=== Fin de la configuración ===')
}

// Función para generar instrucciones de configuración manual
function generarInstruccionesManual() {
  console.log('\n=== INSTRUCCIONES PARA CONFIGURAR MANUALMENTE ===')
  console.log('Si el script anterior falló, sigue estos pasos:')
  console.log('\n1. Ve al Dashboard de Supabase: https://app.supabase.com/projects')
  console.log('2. Abre tu proyecto admin-psicologia')
  console.log('3. Ve a Storage > Buckets')
  console.log('4. Si no existe "blog-images", créalo con estas configuraciones:')
  console.log('   - Nombre: blog-images')
  console.log('   - Público: ✅ SÍ')
  console.log('   - Tipos de archivo permitidos: image/jpeg, image/jpg, image/png, image/webp')
  console.log('   - Tamaño máximo: 5MB')
  console.log('\n5. Ve a Settings > Policies')
  console.log('6. Busca la tabla "storage.objects"')
  console.log('7. Crea estas políticas:')
  console.log('')
  console.log('   POLÍTICA 1 - Lectura (SELECT):')
  console.log('   - Nombre: blog_images_public_select')
  console.log('   - Operación: SELECT')
  console.log('   - USING: bucket_id = \'blog-images\'')
  console.log('')
  console.log('   POLÍTICA 2 - Subida (INSERT):')
  console.log('   - Nombre: blog_images_public_insert') 
  console.log('   - Operación: INSERT')
  console.log('   - WITH CHECK: bucket_id = \'blog-images\' AND (storage.foldername(name))[1] = \'articles\'')
  console.log('')
  console.log('8. Alternativamente, ejecuta el archivo supabase-storage-policies.sql en el SQL Editor')
}

configurarPoliticasStorage().then(() => {
  generarInstruccionesManual()
})
