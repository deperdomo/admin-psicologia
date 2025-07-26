'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { AGE_RANGE_LABELS } from '@/lib/validations'
import { type AgeRange } from '@/types/database'

interface AgeRangeSelectorProps {
  value: AgeRange[]
  onChange: (value: AgeRange[]) => void
  disabled?: boolean
}

export function AgeRangeSelector({ value, onChange, disabled = false }: AgeRangeSelectorProps) {
  const handleToggle = (ageRange: AgeRange, checked: boolean) => {
    if (disabled) return
    
    if (checked) {
      onChange([...value, ageRange])
    } else {
      onChange(value.filter(range => range !== ageRange))
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Object.entries(AGE_RANGE_LABELS).map(([ageRange, label]) => (
        <div key={ageRange} className="flex items-center space-x-2">
          <Checkbox
            id={`age-${ageRange}`}
            checked={value.includes(ageRange as AgeRange)}
            onCheckedChange={(checked) => 
              handleToggle(ageRange as AgeRange, checked as boolean)
            }
            disabled={disabled}
          />
          <label
            htmlFor={`age-${ageRange}`}
            className={`text-sm font-medium leading-none cursor-pointer ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            }`}
          >
            {label}
          </label>
        </div>
      ))}
    </div>
  )
}

export default AgeRangeSelector