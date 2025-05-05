'use client'

import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Marker, PURPOSE_COLORS } from '@/types/marker'
import { Trash2 } from 'lucide-react'

type MarkerItemProps = {
  marker: Marker
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  isSelected: boolean
}

export function MarkerItem({ marker, onDelete, onSelect, isSelected }: MarkerItemProps) {
  // Fix: Explicitly type the colorVariant as one of the accepted values
  const colorVariant = PURPOSE_COLORS[marker.purpose] as 
    "network" | "power" | "data" | "audio" | "voice" | "security" | "control" | "other" | 
    "default" | "destructive" | "outline" | "secondary" | undefined;
  
  return (
    <div 
      className={`
        flex items-center justify-between border-b p-3 cursor-pointer hover:bg-gray-50
        ${isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''}
      `}
      onClick={() => onSelect(marker.id)}
    >
      <div className="flex items-center space-x-3">
        <Badge variant={colorVariant}>{marker.label}</Badge>
        <div className="flex flex-col">
          <span className="font-medium">{marker.type} ({marker.quantity})</span>
          <span className="text-sm text-gray-500">{marker.location} - {marker.purpose}</span>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation()
          onDelete(marker.id)
        }}
        className="text-gray-400 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}