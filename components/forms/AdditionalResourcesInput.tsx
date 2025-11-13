import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'
import { InputWithPaste } from '../ui/input-with-paste'

interface AdditionalResource {
  tipo: string
  titulo: string
  autor?: string
  url?: string
}

interface AdditionalResourcesInputProps {
  value: AdditionalResource[]
  onChange: (value: AdditionalResource[]) => void
  disabled?: boolean
}

export function AdditionalResourcesInput({ value, onChange, disabled }: AdditionalResourcesInputProps) {
  const addResource = () => {
    onChange([...value, { tipo: '', titulo: '', autor: '', url: '' }])
  }

  const removeResource = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateResource = (index: number, field: keyof AdditionalResource, newValue: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Recursos Adicionales</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addResource}
          disabled={disabled}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Recurso
        </Button>
      </div>
      
      {value.map((resource, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recurso {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeResource(index)}
              disabled={disabled}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <InputWithPaste
                placeholder="libro, artículo, herramienta..."
                value={resource.tipo}
                onChange={(e) => updateResource(index, 'tipo', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Título</Label>
              <InputWithPaste
                placeholder="Título del recurso"
                value={resource.titulo}
                onChange={(e) => updateResource(index, 'titulo', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Autor (opcional)</Label>
              <InputWithPaste
                placeholder="Nombre del autor"
                value={resource.autor || ''}
                onChange={(e) => updateResource(index, 'autor', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">URL (opcional)</Label>
              <InputWithPaste
                placeholder="https://..."
                value={resource.url || ''}
                onChange={(e) => updateResource(index, 'url', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      ))}
      
      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay recursos adicionales. Haz clic en &quot;Agregar Recurso&quot; para empezar.</p>
        </div>
      )}
    </div>
  )
}