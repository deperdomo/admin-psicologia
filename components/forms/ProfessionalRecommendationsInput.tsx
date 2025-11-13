import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'
import { InputWithPaste } from '../ui/input-with-paste'
import { TextareaWithPaste } from '../ui/textarea-with-paste'

interface ProfessionalInfo {
  name: string
  title: string
  approach: string
  image_url: string
  credentials: string
  specialties: string[]
  experience_description: string
}

interface ProfessionalRecommendation {
  title: string
  subtitle?: string
  cta_url?: string
  cta_text?: string
  display_type?: string
  professional_info?: ProfessionalInfo
  position_after_section?: string
}

interface ProfessionalRecommendationsInputProps {
  value: ProfessionalRecommendation[]
  onChange: (value: ProfessionalRecommendation[]) => void
  disabled?: boolean
}

// Lista de profesionales predefinidos
const PROFESSIONALS: ProfessionalInfo[] = [
  {
    name: "Llenia Monteagudo",
    title: "Psicóloga Especialista en Desarrollo Infantil",
    approach: "Enfoque integrador basado en neuropsicología del desarrollo y apego seguro",
    image_url: "https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/authors/llenia-monteagudo.webp",
    credentials: "Graduada de Psicología Clínica (Universidad Central Martha Abreu de las Villas), Máster en Psicología Infantil y Juvenil, Máster en Terapias de Tercera Generación, Máster de Cuidado Pastoral de la Familia y Máster en Psicopedagogía Terapéutica",
    specialties: ["Autoestima Infantil", "Desarrollo Emocional", "Crianza Consciente", "Ansiedad Infantil"],
    experience_description: "Especializada en acompañar a familias en el fortalecimiento del bienestar emocional infantil"
  },
  {
    name: "Dr. María González",
    title: "Psicóloga Clínica Infantil",
    approach: "Terapia cognitivo-conductual y mindfulness para niños",
    image_url: "https://eabqgmhadverstykzcrr.supabase.co/storage/v1/object/public/blog-images/authors/maria-gonzalez.jpg",
    credentials: "Doctora en Psicología Clínica, Especialista en Terapia Infantil",
    specialties: ["Ansiedad", "Depresión Infantil", "Trastornos del Comportamiento", "Mindfulness"],
    experience_description: "15 años de experiencia en terapia infantil y familiar"
  }
]

export function ProfessionalRecommendationsInput({ value, onChange, disabled }: ProfessionalRecommendationsInputProps) {
  const addRecommendation = () => {
    onChange([...value, {
      title: '',
      subtitle: '',
      cta_url: '/reserva-cita',
      cta_text: 'Reservar consulta',
      display_type: 'professional_cta',
      professional_info: undefined,
      position_after_section: ''
    }])
  }

  const removeRecommendation = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateRecommendation = (index: number, field: keyof ProfessionalRecommendation, newValue: string | ProfessionalInfo) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  const selectProfessional = (index: number, professionalName: string) => {
    const selected = PROFESSIONALS.find(p => p.name === professionalName)
    if (selected) {
      updateRecommendation(index, 'professional_info', selected)
    }
  }

  const updateProfessionalSpecialty = (index: number, specialtyIndex: number, newValue: string) => {
    const updated = [...value]
    if (updated[index].professional_info) {
      const newSpecialties = [...(updated[index].professional_info?.specialties || [])]
      newSpecialties[specialtyIndex] = newValue
      updated[index] = {
        ...updated[index],
        professional_info: {
          ...updated[index].professional_info!,
          specialties: newSpecialties
        }
      }
      onChange(updated)
    }
  }

  const addSpecialty = (index: number) => {
    const updated = [...value]
    if (updated[index].professional_info) {
      updated[index] = {
        ...updated[index],
        professional_info: {
          ...updated[index].professional_info!,
          specialties: [...(updated[index].professional_info?.specialties || []), '']
        }
      }
      onChange(updated)
    }
  }

  const removeSpecialty = (index: number, specialtyIndex: number) => {
    const updated = [...value]
    if (updated[index].professional_info) {
      updated[index] = {
        ...updated[index],
        professional_info: {
          ...updated[index].professional_info!,
          specialties: updated[index].professional_info!.specialties.filter((_, i) => i !== specialtyIndex)
        }
      }
      onChange(updated)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Recomendaciones Profesionales</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRecommendation}
          disabled={disabled}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Recomendación
        </Button>
      </div>
      
      {value.map((recommendation, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recomendación {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRecommendation(index)}
                disabled={disabled}
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Título</Label>
                <InputWithPaste
                  placeholder="¿Necesitas apoyo profesional?"
                  value={recommendation.title}
                  onChange={(e) => updateRecommendation(index, 'title', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Tipo de Display</Label>
                <Select
                  value={recommendation.display_type || 'professional_cta'}
                  onValueChange={(value) => updateRecommendation(index, 'display_type', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional_cta">CTA Profesional</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="inline">En línea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Subtítulo</Label>
              <TextareaWithPaste
                placeholder="Descripción de la recomendación..."
                value={recommendation.subtitle || ''}
                onChange={(e) => updateRecommendation(index, 'subtitle', e.target.value)}
                disabled={disabled}
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">URL del CTA</Label>
                <InputWithPaste
                  placeholder="/reserva-cita"
                  value={recommendation.cta_url || ''}
                  onChange={(e) => updateRecommendation(index, 'cta_url', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Texto del CTA</Label>
                <InputWithPaste
                  placeholder="Reservar consulta"
                  value={recommendation.cta_text || ''}
                  onChange={(e) => updateRecommendation(index, 'cta_text', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs">Posición (después de sección)</Label>
                <InputWithPaste
                  placeholder="Nombre de la sección"
                  value={recommendation.position_after_section || ''}
                  onChange={(e) => updateRecommendation(index, 'position_after_section', e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Información del Profesional */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-3 block">Información del Profesional</Label>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Seleccionar Profesional</Label>
                  <Select
                    value={recommendation.professional_info?.name || ''}
                    onValueChange={(value) => selectProfessional(index, value)}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar profesional..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONALS.map((prof) => (
                        <SelectItem key={prof.name} value={prof.name}>
                          {prof.name} - {prof.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {recommendation.professional_info && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Nombre</Label>
                      <InputWithPaste
                        value={recommendation.professional_info.name}
                        onChange={(e) => updateRecommendation(index, 'professional_info', {
                          ...recommendation.professional_info!,
                          name: e.target.value
                        })}
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Título Profesional</Label>
                      <InputWithPaste
                        value={recommendation.professional_info.title}
                        onChange={(e) => updateRecommendation(index, 'professional_info', {
                          ...recommendation.professional_info!,
                          title: e.target.value
                        })}
                        disabled={disabled}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Enfoque/Aproximación</Label>
                      <TextareaWithPaste
                        value={recommendation.professional_info.approach}
                        onChange={(e) => updateRecommendation(index, 'professional_info', {
                          ...recommendation.professional_info!,
                          approach: e.target.value
                        })}
                        disabled={disabled}
                        className="min-h-[60px]"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">URL de Imagen</Label>
                      <InputWithPaste
                        value={recommendation.professional_info.image_url}
                        onChange={(e) => updateRecommendation(index, 'professional_info', {
                          ...recommendation.professional_info!,
                          image_url: e.target.value
                        })}
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Credenciales</Label>
                      <InputWithPaste
                        value={recommendation.professional_info.credentials}
                        onChange={(e) => updateRecommendation(index, 'professional_info', {
                          ...recommendation.professional_info!,
                          credentials: e.target.value
                        })}
                        disabled={disabled}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Descripción de Experiencia</Label>
                      <TextareaWithPaste
                        value={recommendation.professional_info.experience_description}
                        onChange={(e) => updateRecommendation(index, 'professional_info', {
                          ...recommendation.professional_info!,
                          experience_description: e.target.value
                        })}
                        disabled={disabled}
                        className="min-h-[60px]"
                      />
                    </div>

                    {/* Especialidades */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Especialidades</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSpecialty(index)}
                          disabled={disabled}
                          className="cursor-pointer"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar
                        </Button>
                      </div>
                      {recommendation.professional_info.specialties.map((specialty, specialtyIndex) => (
                        <div key={specialtyIndex} className="flex gap-2 mb-2">
                          <InputWithPaste
                            placeholder="Especialidad"
                            value={specialty}
                            onChange={(e) => updateProfessionalSpecialty(index, specialtyIndex, e.target.value)}
                            disabled={disabled}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSpecialty(index, specialtyIndex)}
                            disabled={disabled}
                            className="cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      {value.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay recomendaciones profesionales. Haz clic en &quot;Agregar Recomendación&quot; para empezar.</p>
        </div>
      )}
    </div>
  )
}