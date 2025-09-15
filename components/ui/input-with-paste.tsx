"use client"

import * as React from "react"
import { ClipboardPaste } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useClipboard } from "@/lib/hooks/useClipboard"

export interface InputWithPasteProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onPaste'> {
  onPasteCustom?: (value: string) => void
  showPasteButton?: boolean
}

const InputWithPaste = React.forwardRef<HTMLInputElement, InputWithPasteProps>(
  ({ className, type, onPasteCustom, showPasteButton = true, onChange, ...props }, ref) => {
    const { pasteFromClipboard, isSupported } = useClipboard()
    
    const handlePasteClick = async () => {
      try {
        const clipboardText = await pasteFromClipboard()
        if (clipboardText !== null) {
          // Crear un evento sintético para que funcione con react-hook-form
          const syntheticEvent = {
            target: { value: clipboardText }
          } as React.ChangeEvent<HTMLInputElement>
          
          // Llamar al onChange si existe
          if (onChange) {
            onChange(syntheticEvent)
          }
          
          // Llamar al callback personalizado de paste si existe
          if (onPasteCustom) {
            onPasteCustom(clipboardText)
          }
          
          console.log("Texto pegado correctamente")
        } else {
          console.warn("No se pudo acceder al portapapeles")
        }
      } catch (error) {
        console.error('Error al pegar:', error)
      }
    }

    return (
      <div className="relative">
        <Input
          type={type}
          className={cn(
            showPasteButton && isSupported ? "pr-10" : "",
            className
          )}
          ref={ref}
          onChange={onChange}
          {...props}
        />
        {showPasteButton && isSupported && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
            onClick={handlePasteClick}
            title="Pegar desde portapapeles"
          >
            <ClipboardPaste className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }
)
InputWithPaste.displayName = "InputWithPaste"

export { InputWithPaste }