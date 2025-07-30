"use client"

import { useState } from 'react'
import { Edit, Trash2, Download, Eye, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIA_LABELS, RESOURCE_TYPE_LABELS } from '@/lib/validations'
import type { Recurso } from '@/types/database'

// Labels para los rangos de edad
const AGE_RANGE_LABELS = {
  '0-3': '0-3 años',
  '3-6': '3-6 años', 
  '6-12': '6-12 años',
  '12+': '12+ años',
  'todas': 'Todas las edades'
} as const

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
    <div className="space-y-4 flex flex-col items-center">
      {/* Filtros y búsqueda */}
      <Card className="min-w-[1450px]">
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
      <Card className="min-w-[1450px]">
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
              <table className="min-w-full table-auto divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Recurso</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Categoría</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Tipo</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Edad</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Archivos</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Creado</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecursos.map((recurso) => (
                    <tr key={recurso.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 align-top max-w-[190px]">
                        <div>
                          <div className="font-medium text-gray-900 max-w-[250px] truncate">{recurso.title}</div>
                          <div className="text-xs text-gray-500 max-w-[200px] truncate">{recurso.description}</div>
                          {recurso.tags && recurso.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {recurso.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-[10px]">{tag}</Badge>
                              ))}
                              {recurso.tags.length > 2 && (
                                <Badge variant="outline" className="text-[10px]">+{recurso.tags.length - 2}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap hidden sm:table-cell align-top">
                        <Badge variant="outline">{CATEGORIA_LABELS[recurso.categoria]}</Badge>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell align-top">
                        <Badge variant="secondary">{RESOURCE_TYPE_LABELS[recurso.resource_type]}</Badge>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap hidden md:table-cell align-top">
                        <div className="flex flex-wrap gap-1">
                          {recurso.age_ranges?.slice(0, 1).map((range) => (
                            <Badge key={range} variant="outline" className="text-[10px]">{AGE_RANGE_LABELS[range]}</Badge>
                          ))}
                          {recurso.age_ranges && recurso.age_ranges.length > 1 && (
                            <Badge variant="outline" className="text-[10px]">+{recurso.age_ranges.length - 1}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap hidden sm:table-cell align-top">
                        <div className="flex flex-col gap-1">
                          {recurso.word_public_url && (
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">Word</Badge>
                          )}
                          {recurso.pdf_public_url && (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700">PDF</Badge>
                          )}
                          {!recurso.word_public_url && !recurso.pdf_public_url && (
                            <span className="text-[10px] text-gray-400">Sin archivos</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-500 hidden lg:table-cell align-top">{new Date(recurso.created_at).toLocaleDateString()}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-right font-medium align-top">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownload(recurso)}
                            className="h-7 w-7 p-0"
                            disabled={!recurso.word_public_url && !recurso.pdf_public_url}
                            title="Descargar archivos"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(recurso.id)}
                            className="h-7 w-7 p-0"
                            title="Editar recurso"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(recurso.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar recurso"
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