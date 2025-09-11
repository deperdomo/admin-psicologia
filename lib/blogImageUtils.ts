/**
 * Genera la URL completa para una imagen del blog basada en la fecha actual y el slug
 */
export function generateBlogImageUrl(slug: string, fileName?: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Los meses van de 0-11
  
  // Base URL del bucket de Supabase
  const baseUrl = 'https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/articles'
  
  // Generar nombre del archivo basado en el slug si no se proporciona
  const imageName = fileName || `${slug}.png`
  
  // Construir la URL completa
  return `${baseUrl}/${year}/${month}/${imageName}`
}

/**
 * Extrae el path relativo de una URL completa del blog
 * Útil para subir archivos a Supabase Storage
 */
export function extractImagePath(fullUrl: string): string {
  const baseUrl = 'https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/articles'
  return fullUrl.replace(`${baseUrl}/`, '')
}

/**
 * Genera el path de almacenamiento para Supabase Storage
 */
export function generateStoragePath(slug: string, fileExtension: string = 'png'): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  return `articles/${year}/${month}/${slug}.${fileExtension}`
}

/**
 * Obtiene la extensión de un archivo
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.substring(lastDot + 1).toLowerCase() : 'png'
}

/**
 * Valida si una URL de imagen del blog tiene el formato correcto
 */
export function validateBlogImageUrl(url: string): boolean {
  const baseUrl = 'https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/articles'
  const pattern = new RegExp(`^${baseUrl}/\\d{4}/\\d{2}/.+\\.(png|jpg|jpeg|webp)$`, 'i')
  return pattern.test(url)
}
