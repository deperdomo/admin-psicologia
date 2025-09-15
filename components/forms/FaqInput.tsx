import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'
import { InputWithPaste } from '../ui/input-with-paste'
import { TextareaWithPaste } from '../ui/textarea-with-paste'

interface FaqItem {
  pregunta: string
  respuesta: string
}

interface FaqInputProps {
  value: FaqItem[]
  onChange: (value: FaqItem[]) => void
  disabled?: boolean
}

export function FaqInput({ value, onChange, disabled }: FaqInputProps) {
  const addFaq = () => {
    onChange([...value, { pregunta: '', respuesta: '' }])
  }

  const removeFaq = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateFaq = (index: number, field: keyof FaqItem, newValue: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Preguntas Frecuentes (FAQ)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFaq}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar FAQ
        </Button>
      </div>
      
      {value.map((faq, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">FAQ {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeFaq(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Pregunta</Label>
              <InputWithPaste
                placeholder="¿Pregunta frecuente?"
                value={faq.pregunta}
                onChange={(e) => updateFaq(index, 'pregunta', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Respuesta</Label>
              <TextareaWithPaste
                placeholder="Respuesta detallada..."
                value={faq.respuesta}
                onChange={(e) => updateFaq(index, 'respuesta', e.target.value)}
                disabled={disabled}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
      ))}
      
      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay preguntas frecuentes. Haz clic en &quot;Agregar FAQ&quot; para empezar.</p>
        </div>
      )}
    </div>
  )
}