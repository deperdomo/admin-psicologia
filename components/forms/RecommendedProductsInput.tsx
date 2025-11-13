import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus } from 'lucide-react'
import { InputWithPaste } from '../ui/input-with-paste'
import { TextareaWithPaste } from '../ui/textarea-with-paste'

interface RecommendedProduct {
  nombre: string
  descripcion: string
  url?: string
  categoria?: string
  imagen_url?: string
}

interface RecommendedProductsInputProps {
  value: RecommendedProduct[]
  onChange: (value: RecommendedProduct[]) => void
  disabled?: boolean
}

export function RecommendedProductsInput({ value, onChange, disabled }: RecommendedProductsInputProps) {
  const addProduct = () => {
    onChange([...value, { 
      nombre: '', 
      descripcion: '', 
      url: '', 
      categoria: '',
      imagen_url: ''
    }])
  }

  const removeProduct = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, field: keyof RecommendedProduct, newValue: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Productos Recomendados</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProduct}
          disabled={disabled}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>
      
      {value.map((product, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Producto {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeProduct(index)}
              disabled={disabled}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nombre del Producto</Label>
              <InputWithPaste
                placeholder="Nombre del producto"
                value={product.nombre}
                onChange={(e) => updateProduct(index, 'nombre', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Categoría</Label>
              <Select
                value={product.categoria || ''}
                onValueChange={(value) => updateProduct(index, 'categoria', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="libros">Libros</SelectItem>
                  <SelectItem value="juguetes">Juguetes</SelectItem>
                  <SelectItem value="aplicaciones">Aplicaciones</SelectItem>
                  <SelectItem value="herramientas">Herramientas</SelectItem>
                  <SelectItem value="cursos">Cursos</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">URL (opcional)</Label>
              <InputWithPaste
                placeholder="https://..."
                value={product.url || ''}
                onChange={(e) => updateProduct(index, 'url', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">URL de la Imágen</Label>
              <InputWithPaste
                placeholder="https://..."
                value={product.imagen_url || ''}
                onChange={(e) => updateProduct(index, 'imagen_url', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Descripción</Label>
            <TextareaWithPaste
              placeholder="Descripción del producto y por qué lo recomiendas..."
              value={product.descripcion}
              onChange={(e) => updateProduct(index, 'descripcion', e.target.value)}
              disabled={disabled}
              className="min-h-[80px]"
            />
          </div>
        </div>
      ))}
      
      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay productos recomendados. Haz clic en &quot;Agregar Producto&quot; para empezar.</p>
        </div>
      )}
    </div>
  )
}