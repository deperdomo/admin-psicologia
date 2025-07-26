'use client'

import { useState, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function TagInput({ 
  value, 
  onChange, 
  placeholder = "Escribe y presiona Enter...", 
  disabled = false 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const addTag = () => {
    if (disabled) return
    
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    if (disabled) return
    onChange(value.filter((_, i) => i !== index))
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return
    
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const tags = pastedText
      .split(/[,\n\t]/)
      .map(tag => tag.trim())
      .filter(tag => tag && !value.includes(tag))
    
    if (tags.length > 0) {
      onChange([...value, ...tags])
      setInputValue('')
    }
  }

  return (
    <div className="space-y-2">
      <Input
        value={inputValue}
        onChange={(e) => !disabled && setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => !disabled && addTag()}
        placeholder={placeholder}
        disabled={disabled}
      />
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
      
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} etiqueta{value.length !== 1 ? 's' : ''} agregada{value.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}