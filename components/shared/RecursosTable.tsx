"use client"

import { useState } from 'react'
import { Edit, Trash2, Download, Eye, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIA_LABELS, RESOURCE_TYPE_LABELS, AGE_RANGE_LABELS } from '@/lib/validations'
import type { Recurso } from '@/types/database'

interface RecursosTableProps {
  recursos: Recurso[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDownload: (recurso: Recurso) => void
  loading?: boolean
}

export default function RecursosTable({ 
  recursos, 
  onEdit, 
  onDelete, 
  onDownload, 
  loading = false 
}: RecursosTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('all')
  const [filterTipo, setFilterTipo] = useState<string>('all')

  // Filtrar recursos
  const filteredRecursos = recursos.filter(recurso => {
    const matchesSearch = recurso.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recurso.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recurso.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategoria = filterCategoria === 'all' || recurso.categoria === filterCategoria
    const matchesTipo = filterTipo === 'all' || recurso.resource_type === filterTipo

    return matchesSearch && matchesCategoria && matchesTipo
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando recursos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, descripción o etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>
            Recursos ({filteredRecursos.length} de {recursos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecursos.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Eye className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">
                {recursos.length === 0 
                  ? 'No hay recursos registrados.' 
                  : 'No se encontraron recursos con los filtros aplicados.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecursos.map((recurso) => (
                    <tr key={recurso.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {recurso.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {recurso.description}
                          </div>
                          {recurso.tags && recurso.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {recurso.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {recurso.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{recurso.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">
                          {CATEGORIA_LABELS[recurso.categoria]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">
                          {RESOURCE_TYPE_LABELS[recurso.resource_type]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {recurso.age_ranges?.slice(0, 2).map((range) => (
                            <Badge key={range} variant="outline" className="text-xs">
                              {AGE_RANGE_LABELS[range]}
                            </Badge>
                          ))}
                          {recurso.age_ranges && recurso.age_ranges.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{recurso.age_ranges.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(recurso.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownload(recurso)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(recurso.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(recurso.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}