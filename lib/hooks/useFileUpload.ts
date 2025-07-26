'use client'

import { useState, useCallback } from 'react'
import { uploadFile, deleteFile } from '@/lib/fileUpload'

import type { FileUploadResult } from '@/components/forms/RecursoForm';

interface UseFileUploadOptions {
  bucket: string
  onSuccess?: (result: FileUploadResult) => void
  onError?: (error: string) => void
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  result: FileUploadResult | null
}

export function useFileUpload({ bucket, onSuccess, onError }: UseFileUploadOptions) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null
  })

  const uploadFileWithProgress = useCallback(async (file: File, path: string) => {
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null
    })

    try {
      // Simular progreso (Supabase no proporciona progreso real)
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 100)

      const result = await uploadFile(file, bucket, path)

      clearInterval(progressInterval)
      
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        result
      })

      onSuccess?.(result)
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo'
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        result: null
      })

      onError?.(errorMessage)
      throw error
    }
  }, [bucket, onSuccess, onError])

  const deleteFileFromStorage = useCallback(async (path: string) => {
    try {
      await deleteFile(bucket, path)
      setUploadState(prev => ({ ...prev, result: null }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar archivo'
      setUploadState(prev => ({ ...prev, error: errorMessage }))
      throw error
    }
  }, [bucket])

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null
    })
  }, [])

  return {
    ...uploadState,
    uploadFile: uploadFileWithProgress,
    deleteFile: deleteFileFromStorage,
    resetUpload
  }
}