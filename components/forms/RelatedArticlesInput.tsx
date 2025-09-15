import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { X, Plus, Search } from 'lucide-react'
import { InputWithPaste } from '../ui/input-with-paste'

interface RelatedArticle {
  slug: string
  type: string
  title: string
  category: string
  image_url?: string
  relevance: string
  author_name: string
  description?: string
  author_image?: string
}

interface ArticleOption {
  id: string
  title: string
  slug: string
  category: string
  author_name: string
  image_url?: string
}

interface RelatedArticlesInputProps {
  value: RelatedArticle[]
  onChange: (value: RelatedArticle[]) => void
  disabled?: boolean
}

export function RelatedArticlesInput({ value, onChange, disabled }: RelatedArticlesInputProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [articleOptions, setArticleOptions] = useState<ArticleOption[]>([])

  // Simular búsqueda de artículos - en producción esto sería una API call
  const searchArticles = async (term: string) => {
    if (term.length < 2) return []
    
    try {
      // Aquí iría la llamada real a tu API
      const response = await fetch(`/api/articulos?search=${encodeURIComponent(term)}`)
      if (response.ok) {
        const articles = await response.json()
        return articles.map((article: Record<string, unknown>) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category,
          author_name: article.author_name,
          image_url: article.image_1_url
        }))
      }
    } catch (error) {
      console.error('Error searching articles:', error)
    }
    return []
  }

  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchTerm) {
        const results = await searchArticles(searchTerm)
        setArticleOptions(results)
      } else {
        setArticleOptions([])
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const addArticle = () => {
    onChange([...value, {
      slug: '',
      type: 'internal',
      title: '',
      category: '',
      image_url: '',
      relevance: 'medium',
      author_name: '',
      description: '',
      author_image: ''
    }])
  }

  const removeArticle = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateArticle = (index: number, field: keyof RelatedArticle, newValue: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  const selectArticleFromSearch = (index: number, selectedArticle: ArticleOption) => {
    const updated = [...value]
    updated[index] = {
      ...updated[index],
      title: selectedArticle.title,
      slug: selectedArticle.slug,
      category: selectedArticle.category,
      author_name: selectedArticle.author_name,
      image_url: selectedArticle.image_url || '',
      type: 'internal'
    }
    onChange(updated)
    setSearchTerm('')
    setArticleOptions([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Artículos Relacionados</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addArticle}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Artículo
        </Button>
      </div>
      
      {value.map((article, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Artículo {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArticle(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Búsqueda de artículos */}
            <div className="space-y-2">
              <Label className="text-xs">Buscar artículo existente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <InputWithPaste
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={disabled}
                  className="pl-9"
                />
              </div>
              
              {articleOptions.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {articleOptions.map((option) => (
                    <div
                      key={option.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectArticleFromSearch(index, option)}
                    >
                      <div className="font-medium text-sm">{option.title}</div>
                      <div className="text-xs text-gray-500">
                        {option.category} • {option.author_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campos manuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Título</Label>
                <InputWithPaste
                  placeholder="Título del artículo"
                  value={article.title}
                  onChange={(e) => updateArticle(index, 'title', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Slug</Label>
                <InputWithPaste
                  placeholder="slug-del-articulo"
                  value={article.slug || ''}
                  onChange={(e) => updateArticle(index, 'slug', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Categoría</Label>
                <InputWithPaste
                  placeholder="Categoría"
                  value={article.category || ''}
                  onChange={(e) => updateArticle(index, 'category', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Autor</Label>
                <InputWithPaste
                  placeholder="Nombre del autor"
                  value={article.author_name || ''}
                  onChange={(e) => updateArticle(index, 'author_name', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Relevancia</Label>
                <Select
                  value={article.relevance || 'medium'}
                  onValueChange={(value) => updateArticle(index, 'relevance', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={article.type || 'internal'}
                  onValueChange={(value) => updateArticle(index, 'type', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Interno</SelectItem>
                    <SelectItem value="external">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Descripción</Label>
              <InputWithPaste
                placeholder="Breve descripción del artículo"
                value={article.description || ''}
                onChange={(e) => updateArticle(index, 'description', e.target.value)}
                disabled={disabled}
              />
            </div>

            <div>
              <Label className="text-xs">URL de imagen</Label>
              <InputWithPaste
                placeholder="https://..."
                value={article.image_url || ''}
                onChange={(e) => updateArticle(index, 'image_url', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </Card>
      ))}
      
      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay artículos relacionados. Haz clic en &quot;Agregar Artículo&quot; para empezar.</p>
        </div>
      )}
    </div>
  )
}