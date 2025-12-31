import { ScaleType } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getAllScaleTypes } from '@/lib/scale-generator'

interface ScaleFilterProps {
  selectedTypes: ScaleType[]
  onChange: (types: ScaleType[]) => void
}

export function ScaleFilter({ selectedTypes, onChange }: ScaleFilterProps) {
  const allTypes = getAllScaleTypes()

  const handleToggle = (type: ScaleType) => {
    if (selectedTypes.includes(type)) {
      // Prevent removing the last type
      if (selectedTypes.length > 1) {
        onChange(selectedTypes.filter((t) => t !== type))
      }
    } else {
      onChange([...selectedTypes, type])
    }
  }

  const handleSelectAll = () => {
    onChange(allTypes)
  }

  const handleClearAll = () => {
    // Keep at least one type selected (prevent empty filter)
    if (selectedTypes.length > 0) {
      onChange([allTypes[0]])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          disabled={selectedTypes.length === allTypes.length}
          className="min-h-[40px]"
        >
          Select All
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          disabled={selectedTypes.length === 1}
          className="min-h-[40px]"
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {allTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`scale-type-${type}`}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => handleToggle(type)}
              aria-label={`${type} scale type`}
            />
            <Label
              htmlFor={`scale-type-${type}`}
              className="text-sm font-normal cursor-pointer"
            >
              {type}
            </Label>
          </div>
        ))}
      </div>

      {selectedTypes.length === 0 && (
        <p className="text-sm text-destructive" role="alert">
          At least one scale type must be selected
        </p>
      )}
    </div>
  )
}
