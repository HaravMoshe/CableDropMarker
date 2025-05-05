'use client'

import React, { useMemo } from 'react'
import { Marker } from '@/types/marker'
import { MarkerItem } from './MarkerItem'
import { CSVLink } from "react-csv"
import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type MarkersListProps = {
  markers: Marker[]
  onDelete: (id: string) => void
  onSelectMarker: (id: string) => void
  selectedMarkerId?: string
  currentPageIndex: number
  showAll: boolean
  onToggleView: () => void
}

export function MarkersList({ 
  markers, 
  onDelete, 
  onSelectMarker, 
  selectedMarkerId,
  currentPageIndex,
  showAll,
  onToggleView
}: MarkersListProps) {
  const filteredMarkers = useMemo(() => {
    if (showAll) {
      return markers;
    }
    return markers.filter(marker => marker.pageIndex === currentPageIndex);
  }, [markers, currentPageIndex, showAll]);

  const csvData = useMemo(() => {
    return [
      ['Label', 'Type', 'Quantity', 'Location', 'Purpose', 'Page', 'X', 'Y', 'Created Date'],
      ...markers.map(marker => [
        marker.label,
        marker.type,
        marker.quantity.toString(),
        marker.location,
        marker.purpose,
        (marker.pageIndex + 1).toString(),
        marker.x.toFixed(2),
        marker.y.toFixed(2),
        new Date(marker.createdAt).toLocaleString()
      ])
    ]
  }, [markers]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Markers</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleView}
          >
            {showAll ? 'Current Page' : 'All Pages'}
          </Button>
          
          <CSVLink 
            data={csvData} 
            filename="cable-markers.csv"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export CSV
          </CSVLink>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {filteredMarkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
            <p>No markers {showAll ? '' : 'on this page'}</p>
            <p className="text-sm mt-1">Click on the PDF to add markers</p>
          </div>
        ) : (
          <div>
            {filteredMarkers.map(marker => (
              <MarkerItem 
                key={marker.id} 
                marker={marker} 
                onDelete={onDelete}
                onSelect={onSelectMarker}
                isSelected={marker.id === selectedMarkerId}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t text-sm text-gray-500">
        Total: {filteredMarkers.length} marker{filteredMarkers.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}