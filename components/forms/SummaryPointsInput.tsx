import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'
import { InputWithPaste } from '../ui/input-with-paste'

interface SummaryPoint {
  point: string
}

interface SummaryPointsInputProps {
  value: SummaryPoint[]
  onChange: (value: SummaryPoint[]) => void
  disabled?: boolean
}

export function SummaryPointsInput({ value, onChange, disabled }: SummaryPointsInputProps) {
  const addPoint = () => {
    onChange([...value, { point: '' }])
  }

  const removePoint = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updatePoint = (index: number, newValue: string) => {
    const updated = [...value]
    updated[index] = { point: newValue }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Puntos de Resumen</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPoint}
          disabled={disabled}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Punto
        </Button>
      </div>
      
      {value.map((item, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Punto {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePoint(index)}
              disabled={disabled}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <InputWithPaste
            placeholder="Punto clave del resumen..."
            value={item.point}
            onChange={(e) => updatePoint(index, e.target.value)}
            disabled={disabled}
          />
        </div>
      ))}
      
      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay puntos de resumen. Haz clic en &quot;Agregar Punto&quot; para empezar.</p>
        </div>
      )}
    </div>
  )
}