"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import { SuccessModal } from '@/components/shared/SuccessModal'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Calendar,
  Clock,
  User,
  Tag,
  Filter,
  TrendingUp,
  Star
} from 'lucide-react'
import type { BlogArticle } from '@/types/database'

export default function ListaArticulosClient() {
  const router = useRouter()
  const [articulos, setArticulos] = useState<BlogArticle[]>([])
  const [filteredArticulos, setFilteredArticulos] = useState<BlogArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [articuloToDelete, setArticuloToDelete] = useState<BlogArticle | null>(null)

  useEffect(() => {
    fetchArticulos()
  }, [])

  useEffect(() => {
    const filterArticulos = () => {
      let filtered = articulos

      // Filtrar por búsqueda
      if (searchTerm) {
        filtered = filtered.filter(articulo =>
          articulo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          articulo.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          articulo.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }

      // Filtrar por estado
      if (selectedStatus !== 'todos') {
        filtered = filtered.filter(articulo => articulo.status === selectedStatus)
      }

      // Filtrar por categoría
      if (selectedCategory !== 'todas') {
        filtered = filtered.filter(articulo => articulo.category === selectedCategory)
      }

      setFilteredArticulos(filtered)
    }

    filterArticulos()
  }, [articulos, searchTerm, selectedStatus, selectedCategory])

  const fetchArticulos = async () => {
    try {
      const response = await fetch('/api/articulos')
      if (!response.ok) throw new Error('Error al cargar artículos')
      
      const data = await response.json()
      setArticulos(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar los artículos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (articulo: BlogArticle) => {
    setArticuloToDelete(articulo)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!articuloToDelete) return

    try {
      const response = await fetch(`/api/articulos/${articuloToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar artículo')

      setSuccessModalOpen(true)
      await fetchArticulos() // Recargar lista
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el artículo')
    } finally {
      setDeleteModalOpen(false)
      setArticuloToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publicado</Badge>
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>
      case 'archived':
        return <Badge variant="outline">Archivado</Badge>
      default:
        return <Badge variant="secondary">Sin estado</Badge>
    }
  }

  const getCategoryBadge = (category?: string | null) => {
    if (!category) return null
    
    const categoryLabels: Record<string, string> = {
      desarrollo: 'Desarrollo',
      comportamiento: 'Comportamiento',
      emociones: 'Emociones',
      educacion: 'Educación',
      familia: 'Familia',
      trastornos: 'Trastornos',
      otros: 'Otros'
    }

    return (
      <Badge variant="outline" className="text-xs">
        {categoryLabels[category] || category}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Cargando artículos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lista de Artículos</h1>
            <p className="text-muted-foreground">
              Gestiona los artículos del blog de psicología infantil
            </p>
          </div>
        </div>
        <Button onClick={() => router.push('/articulos/nuevo')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Artículo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por título, autor o etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
              <option value="archived">Archivados</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="desarrollo">Desarrollo</option>
              <option value="comportamiento">Comportamiento</option>
              <option value="emociones">Emociones</option>
              <option value="educacion">Educación</option>
              <option value="familia">Familia</option>
              <option value="trastornos">Trastornos</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{articulos.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-green-600">
                {articulos.filter(a => a.status === 'published').length}
              </div>
              <div className="text-sm text-muted-foreground">Publicados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-yellow-600">
                {articulos.filter(a => a.status === 'draft').length}
              </div>
              <div className="text-sm text-muted-foreground">Borradores</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">
                {articulos.filter(a => a.is_featured).length}
              </div>
              <div className="text-sm text-muted-foreground">Destacados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de artículos */}
      <div className="grid gap-4">
        {filteredArticulos.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No se encontraron artículos que coincidan con los filtros seleccionados.
            </CardContent>
          </Card>
        ) : (
          filteredArticulos.map((articulo) => (
            <Card key={articulo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{articulo.title}</h3>
                      {articulo.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      {articulo.is_trending && (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    {articulo.subtitle && (
                      <p className="text-sm text-muted-foreground">{articulo.subtitle}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {articulo.author_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {articulo.created_at && formatDate(articulo.created_at)}
                      </div>
                      {articulo.reading_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {articulo.reading_time_minutes} min
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(articulo.status)}
                      {getCategoryBadge(articulo.category)}
                      
                      {articulo.tags && articulo.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {articulo.tags && articulo.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{articulo.tags.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/articulos/editar/${articulo.id}`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(articulo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modales */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={articuloToDelete?.title || "Artículo"}
        description="Este artículo y todo su contenido será eliminado permanentemente."
      />

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="¡Artículo eliminado!"
        message="El artículo ha sido eliminado exitosamente."
      />
    </div>
  )
}
