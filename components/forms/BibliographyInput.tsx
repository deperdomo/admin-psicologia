import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Plus } from 'lucide-react'
import { InputWithPaste } from '../ui/input-with-paste'

interface BibliographyItem {
  id: string
  authors: string[]
  year: number
  title: string
  journal?: string
  publisher?: string
  volume?: string
  pages?: string
  doi?: string
  type: string
  cited_in_text: boolean
  citation_format: string
}

interface BibliographyInputProps {
  value: BibliographyItem[]
  onChange: (value: BibliographyItem[]) => void
  disabled?: boolean
}

export function BibliographyInput({ value, onChange, disabled }: BibliographyInputProps) {
  const addBibliography = () => {
    const newId = `ref_${Date.now()}`
    onChange([...value, {
      id: newId,
      authors: [''],
      year: new Date().getFullYear(),
      title: '',
      type: 'journal_article',
      cited_in_text: true,
      citation_format: 'apa'
    }])
  }

  const removeBibliography = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateBibliography = (index: number, field: keyof BibliographyItem, newValue: string | number | boolean) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  const updateAuthors = (index: number, authorIndex: number, newValue: string) => {
    const updated = [...value]
    const newAuthors = [...updated[index].authors]
    newAuthors[authorIndex] = newValue
    updated[index] = { ...updated[index], authors: newAuthors }
    onChange(updated)
  }

  const addAuthor = (index: number) => {
    const updated = [...value]
    updated[index] = { ...updated[index], authors: [...updated[index].authors, ''] }
    onChange(updated)
  }

  const removeAuthor = (index: number, authorIndex: number) => {
    const updated = [...value]
    updated[index] = { 
      ...updated[index], 
      authors: updated[index].authors.filter((_, i) => i !== authorIndex) 
    }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Bibliografía</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBibliography}
          disabled={disabled}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Referencia
        </Button>
      </div>
      
      {value.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Referencia {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeBibliography(index)}
              disabled={disabled}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">ID de Referencia</Label>
              <InputWithPaste
                placeholder="ej: smith2024"
                value={item.id}
                onChange={(e) => updateBibliography(index, 'id', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Año</Label>
              <InputWithPaste
                type="number"
                value={item.year}
                onChange={(e) => updateBibliography(index, 'year', parseInt(e.target.value))}
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Título</Label>
            <InputWithPaste
              placeholder="Título de la publicación"
              value={item.title}
              onChange={(e) => updateBibliography(index, 'title', e.target.value)}
              disabled={disabled}
            />
          </div>

          <div>
            <Label className="text-xs">Autores</Label>
            {item.authors.map((author, authorIndex) => (
              <div key={authorIndex} className="flex gap-2 mt-2">
                <InputWithPaste
                  placeholder="Apellido, N."
                  value={author}
                  onChange={(e) => updateAuthors(index, authorIndex, e.target.value)}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAuthor(index, authorIndex)}
                  disabled={disabled || item.authors.length === 1}
                  className="cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAuthor(index)}
              disabled={disabled}
              className="mt-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Autor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select
                value={item.type}
                onValueChange={(value) => updateBibliography(index, 'type', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journal_article">Artículo de revista</SelectItem>
                  <SelectItem value="book">Libro</SelectItem>
                  <SelectItem value="chapter">Capítulo de libro</SelectItem>
                  <SelectItem value="report">Reporte</SelectItem>
                  <SelectItem value="website">Sitio web</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Formato de Cita</Label>
              <Select
                value={item.citation_format}
                onValueChange={(value) => updateBibliography(index, 'citation_format', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa">APA</SelectItem>
                  <SelectItem value="mla">MLA</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Revista/Editorial</Label>
              <InputWithPaste
                placeholder="Nombre de la revista o editorial"
                value={item.journal || ''}
                onChange={(e) => updateBibliography(index, 'journal', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Volumen</Label>
              <InputWithPaste
                placeholder="Vol. X"
                value={item.volume || ''}
                onChange={(e) => updateBibliography(index, 'volume', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs">Páginas</Label>
              <InputWithPaste
                placeholder="pp. XX-YY"
                value={item.pages || ''}
                onChange={(e) => updateBibliography(index, 'pages', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">DOI (opcional)</Label>
            <InputWithPaste
              placeholder="10.1000/182"
              value={item.doi || ''}
              onChange={(e) => updateBibliography(index, 'doi', e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`cited-${index}`}
              checked={item.cited_in_text}
              onCheckedChange={(checked) => updateBibliography(index, 'cited_in_text', !!checked)}
              disabled={disabled}
            />
            <Label htmlFor={`cited-${index}`} className="text-sm">
              Citado en el texto
            </Label>
          </div>
        </div>
      ))}
      
      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay referencias bibliográficas. Haz clic en &quot;Agregar Referencia&quot; para empezar.</p>
        </div>
      )}
    </div>
  )
}