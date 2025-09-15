import { useState, useCallback } from 'react'

interface UseClipboardReturn {
  copyToClipboard: (text: string) => Promise<boolean>
  pasteFromClipboard: () => Promise<string | null>
  isSupported: boolean
}

export function useClipboard(): UseClipboardReturn {
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && 'navigator' in window && 'clipboard' in window.navigator
  })

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Clipboard API no está soportado en este navegador')
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error)
      return false
    }
  }, [isSupported])

  const pasteFromClipboard = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      console.warn('Clipboard API no está soportado en este navegador')
      return null
    }

    try {
      const text = await navigator.clipboard.readText()
      return text
    } catch (error) {
      console.error('Error al pegar desde el portapapeles:', error)
      // Podría ser un error de permisos o navegador no soportado
      return null
    }
  }, [isSupported])

  return {
    copyToClipboard,
    pasteFromClipboard,
    isSupported
  }
}