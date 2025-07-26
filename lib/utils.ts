import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Devuelve el tamaño de archivo en formato legible (ej: 1.2 MB)
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Genera un nombre de archivo único usando el resource_id y el nombre original
export function generateFileName(resourceId: string, originalName: string): string {
  const timestamp = Date.now();
  const ext = originalName.split('.').pop();
  const base = originalName.replace(/\.[^/.]+$/, "");
  return `${resourceId}-${base}-${timestamp}.${ext}`;
}
