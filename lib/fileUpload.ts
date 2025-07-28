import { supabase } from './supabase'

export interface UploadResult {
  publicUrl: string
  filePath: string
  fileSize: number
  fileName: string
}

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<UploadResult> {
  console.log('=== DIAGNÓSTICO COMPLETO RLS ===');
  console.log('Bucket:', bucket);
  console.log('Path:', path);
  console.log('File:', file.name, file.type, file.size);
  
  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('El archivo excede el tamaño máximo de 5MB')
  }

  // Validar tipo de archivo
  const allowedTypes = {
    'recursos-word': ['.doc', '.docx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'recursos-pdf': ['.pdf', 'application/pdf']
  }

  const bucketAllowedTypes = allowedTypes[bucket as keyof typeof allowedTypes]
  if (bucketAllowedTypes) {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidType = bucketAllowedTypes.some(type => 
      type.startsWith('.') ? type === fileExtension : type === file.type
    )
    
    if (!isValidType) {
      throw new Error(`Tipo de archivo no válido para ${bucket}`)
    }
  }

  try {
    // 1. Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('✓ User authenticated:', !!user);
    console.log('  - User ID:', user?.id);
    console.log('  - User role:', user?.role);
    console.log('  - User aud:', user?.aud);
    
    if (userError) {
      console.error('❌ Auth error:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // 2. Verificar sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('✓ Session valid:', !!session);
    if (session?.expires_at) {
      console.log('  - Session expires at:', new Date(session.expires_at * 1000));
    } else {
      console.log('  - Session expires at: unknown');
    }
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    }
    
    // 3. Test de acceso al bucket
    console.log('🧪 Testing bucket access...');
    const { error: listError } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1 });
    if (listError) {
      console.error('❌ Cannot access bucket:', listError);
    } else {
      console.log('✓ Bucket accessible');
    }
    
    // 4. Verificar permisos específicos del usuario
    console.log('🧪 Testing auth functions...');
    const { error: testError } = await supabase
      .from('storage.objects')
      .select('*')
      .limit(1);
    if (testError) {
      console.log('⚠️  Cannot query storage.objects directly:', testError.message);
    }
    
    // 5. Intentar el upload
    console.log('🚀 Attempting upload...');
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload failed:');
      // StorageError does not have 'statusCode'
      console.error('  - Error message:', error.message);
      console.error('  - Full error:', error);
      
      // Intentar con upsert true por si el archivo ya existe
      console.log('🔄 Retrying with upsert: true...');
      const { data: retryData, error: retryError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (retryError) {
        console.error('❌ Retry also failed:', retryError);
        throw new Error(`Upload failed: ${error.message}`);
      } else {
        console.log('✓ Retry successful!');
        
        // Obtener URL pública del archivo subido con retry
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        
        return {
          publicUrl,
          filePath: retryData.path,
          fileSize: file.size,
          fileName: file.name
        };
      }
    } else {
      console.log('✓ Upload successful!');
      
      // Obtener URL pública del archivo subido exitosamente
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return {
        publicUrl,
        filePath: data.path,
        fileSize: file.size,
        fileName: file.name
      };
    }
    
  } catch (error) {
    console.error('❌ Upload process failed:', error);
    throw error;
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
      
    if (error) {
      console.error('Error deleting file:', error)
      throw new Error(`Error al eliminar archivo: ${error.message}`)
    }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

export async function getFileMetadata(bucket: string, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      })

    if (error) throw error

    return data?.[0] || null
  } catch (error) {
    console.error('Error getting file metadata:', error)
    return null
  }
}

// Función para validar archivos antes de subir
export function validateFile(file: File, maxSize: number = 5 * 1024 * 1024): string | null {
  if (file.size > maxSize) {
    return `El archivo excede el tamaño máximo de ${(maxSize / 1024 / 1024).toFixed(1)}MB`
  }

  // Validar nombre de archivo
  if (file.name.length > 255) {
    return 'El nombre del archivo es demasiado largo'
  }

  // Validar caracteres especiales en el nombre
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(file.name)) {
    return 'El nombre del archivo contiene caracteres no válidos'
  }

  return null
}