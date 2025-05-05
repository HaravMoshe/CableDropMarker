'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Marker, PURPOSE_COLORS } from '@/types/marker'

type MarkerFormProps = {
  open: boolean
  onClose: () => void
  onSave: (marker: Omit<Marker, 'id' | 'label' | 'createdAt'>) => void
  position: { x: number; y: number; pageIndex: number }
  existingOptions: {
    types: string[]
    locations: string[]
    purposes: string[]
  }
}

const DEFAULT_PURPOSES = Object.keys(PURPOSE_COLORS)

export function MarkerForm({ 
  open, 
  onClose, 
  onSave, 
  position,
  existingOptions 
}: MarkerFormProps) {
  const [quantity, setQuantity] = useState<number>(1)
  const [type, setType] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [purpose, setPurpose] = useState<string>('Network')
  const [newType, setNewType] = useState<string>('')
  const [newLocation, setNewLocation] = useState<string>('')
  
  // Reset form when opened
  useEffect(() => {
    if (open) {
      setQuantity(1)
      setType('')
      setLocation('')
      setPurpose('Network')
      setNewType('')
      setNewLocation('')
    }
  }, [open])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const finalType = type === 'new' ? newType : type
    const finalLocation = location === 'new' ? newLocation : location

    onSave({
      x: position.x,
      y: position.y,
      pageIndex: position.pageIndex,
      quantity,
      type: finalType,
      location: finalLocation,
      purpose,
    })
    
    onClose()
  }, [
    quantity, 
    type, 
    location, 
    purpose, 
    newType, 
    newLocation, 
    onSave, 
    onClose, 
    position
  ])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Cable Drop Marker</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              className="col-span-3"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <div className="col-span-3">
              <Select 
                value={type} 
                onValueChange={setType} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cable type" />
                </SelectTrigger>
                <SelectContent>
                  {existingOptions.types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add new type</SelectItem>
                </SelectContent>
              </Select>
              
              {type === 'new' && (
                <Input
                  className="mt-2"
                  placeholder="Enter new cable type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  required={type === 'new'}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <div className="col-span-3">
              <Select 
                value={location} 
                onValueChange={setLocation}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {existingOptions.locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add new location</SelectItem>
                </SelectContent>
              </Select>
              
              {location === 'new' && (
                <Input
                  className="mt-2"
                  placeholder="Enter new location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  required={location === 'new'}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purpose" className="text-right">
              Purpose
            </Label>
            <Select 
              value={purpose} 
              onValueChange={setPurpose}
              required
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_PURPOSES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Marker</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}