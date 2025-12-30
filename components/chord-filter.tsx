import { ChordType } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getAllChordTypes } from '@/lib/chord-generator'

interface ChordFilterProps {
  selectedTypes: ChordType[]
  onChange: (types: ChordType[]) => void
}

export function ChordFilter({ selectedTypes, onChange }: ChordFilterProps) {
  const allTypes = getAllChordTypes()

  const handleToggle = (type: ChordType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type))
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {allTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`chord-type-${type}`}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => handleToggle(type)}
            />
            <Label
              htmlFor={`chord-type-${type}`}
              className="text-sm font-normal cursor-pointer"
            >
              {type}
            </Label>
          </div>
        ))}
      </div>

      {selectedTypes.length === 0 && (
        <p className="text-sm text-destructive">
          At least one chord type must be selected
        </p>
      )}
    </div>
  )
}
