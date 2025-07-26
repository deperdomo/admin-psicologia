'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { AGE_RANGE_LABELS } from '@/lib/validations'
import { type AgeRange } from '@/types/database'

interface AgeRangeSelectorProps {
  value: AgeRange[]
  onChange: (value: AgeRange[]) => void
}

export function AgeRangeSelector({ value, onChange }: AgeRangeSelectorProps) {
  const handleToggle = (ageRange: AgeRange, checked: boolean) => {
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
          />
          <label
            htmlFor={`age-${ageRange}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {label}
          </label>
        </div>
      ))}
    </div>
  )
}