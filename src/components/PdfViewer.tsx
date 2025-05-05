'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Viewer, 
  Worker, 
  SpecialZoomLevel
} from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation'
import { zoomPlugin } from '@react-pdf-viewer/zoom'

import { MarkerForm } from '@/components/MarkerForm'
import { MarkersList } from '@/components/MarkersList'
import { Marker, PURPOSE_COLORS } from '@/types/marker'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import '@react-pdf-viewer/page-navigation/lib/styles/index.css'
import '@react-pdf-viewer/zoom/lib/styles/index.css'

const generateUniqueId = () => Math.random().toString(36).substring(2, 9)

const generateLabel = (type: string, purpose: string, existingLabels: string[]): string => {
  const typeAbbr = type.slice(0, 3).toUpperCase()
  const purposeAbbr = purpose.slice(0, 3).toUpperCase()
  const regex = new RegExp(`^${typeAbbr}-${purposeAbbr}-(\\d+)$`)
  const numbers = existingLabels
    .map(label => {
      const match = label.match(regex)
      return match ? parseInt(match[1]) : 0
    })
    .filter(n => n > 0)

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1
  return `${typeAbbr}-${purposeAbbr}-${nextNumber}`
}

interface PdfViewerProps {
  file: File
}

export default function PdfViewer({ file }: PdfViewerProps) {
  const [fileUrl, setFileUrl] = useState<string>('')
  const [markers, setMarkers] = useState<Marker[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0)
  const [markerFormOpen, setMarkerFormOpen] = useState<boolean>(false)
  const [newMarkerPosition, setNewMarkerPosition] = useState<{ x: number; y: number; pageIndex: number }>({ x: 0, y: 0, pageIndex: 0 })
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>(undefined)
  const [showAllMarkers, setShowAllMarkers] = useState<boolean>(false)

  const viewerContainerRef = useRef<HTMLDivElement>(null)

  const pageNavigationPluginInstance = pageNavigationPlugin()
  const zoomPluginInstance = zoomPlugin()
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
  })

  const existingOptions = {
    types: Array.from(new Set(markers.map(m => m.type))),
    locations: Array.from(new Set(markers.map(m => m.location))),
    purposes: Object.keys(PURPOSE_COLORS),
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cableDropMarkers')
      if (saved) {
        try {
          setMarkers(JSON.parse(saved))
        } catch (e) {
          console.error('Error loading markers from localStorage:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && markers.length > 0) {
      localStorage.setItem('cableDropMarkers', JSON.stringify(markers))
    }
  }, [markers])

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setFileUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  const handlePageChange = useCallback((e: { currentPage: number }) => {
    setCurrentPageIndex(e.currentPage - 1)
  }, [])

  const handlePdfClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewerContainerRef.current) return

    const container = viewerContainerRef.current
    const pageLayer = e.target as HTMLElement
    const pageDivs = container.querySelectorAll('.rpv-core__page-layer')
    let pageIndex = -1

    pageDivs.forEach((div, index) => {
      if (div.contains(pageLayer)) {
        pageIndex = index
      }
    })

    if (pageIndex === -1) return

    const pageRect = pageDivs[pageIndex].getBoundingClientRect()
    const x = (e.clientX - pageRect.left) / pageRect.width
    const y = (e.clientY - pageRect.top) / pageRect.height

    setNewMarkerPosition({ x, y, pageIndex })
    setMarkerFormOpen(true)
  }, [])

  const addMarker = useCallback((markerData: Omit<Marker, 'id' | 'label' | 'createdAt'>) => {
    const existingLabels = markers.map(m => m.label)
    const newLabel = generateLabel(markerData.type, markerData.purpose, existingLabels)
    const newMarker: Marker = {
      id: generateUniqueId(),
      label: newLabel,
      createdAt: Date.now(),
      ...markerData
    }
    setMarkers(prev => [...prev, newMarker])
  }, [markers])

  const deleteMarker = useCallback((id: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id))
    if (selectedMarkerId === id) {
      setSelectedMarkerId(undefined)
    }
  }, [selectedMarkerId])

  const selectMarker = useCallback((id: string) => {
    setSelectedMarkerId(id)
    const marker = markers.find(m => m.id === id)
    if (marker && marker.pageIndex !== currentPageIndex) {
      setCurrentPageIndex(marker.pageIndex)
      pageNavigationPluginInstance.jumpToPage(marker.pageIndex + 1)
    }
  }, [markers, currentPageIndex, pageNavigationPluginInstance])

  const toggleMarkerView = useCallback(() => {
    setShowAllMarkers(prev => !prev)
  }, [])

  return (
    <div className="flex h-full">
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 z-10"
          ref={viewerContainerRef}
          onClick={handlePdfClick}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              defaultScale={SpecialZoomLevel.PageWidth}
              plugins={[
                defaultLayoutPluginInstance,
                pageNavigationPluginInstance,
                zoomPluginInstance,
              ]}
              onPageChange={handlePageChange}
            />
          </Worker>
        </div>

        {markers
          .filter(marker => marker.pageIndex === currentPageIndex)
          .map(marker => {
            const colorVariant = PURPOSE_COLORS[marker.purpose] || 'default'
            const isSelected = marker.id === selectedMarkerId

            let bgColor = 'bg-primary'
            switch (colorVariant) {
              case 'network': bgColor = 'bg-blue-500'; break
              case 'power': bgColor = 'bg-red-500'; break
              case 'data': bgColor = 'bg-green-500'; break
              case 'audio': bgColor = 'bg-purple-500'; break
              case 'voice': bgColor = 'bg-orange-500'; break
              case 'security': bgColor = 'bg-gray-500'; break
              case 'control': bgColor = 'bg-yellow-500'; break
              case 'other': bgColor = 'bg-teal-500'; break
            }

            return (
              <div
                key={marker.id}
                className={`marker ${bgColor} ${isSelected ? 'ring-2 ring-white' : ''}`}
                style={{ 
                  left: `${marker.x * 100}%`, 
                  top: `${marker.y * 100}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  selectMarker(marker.id)
                }}
                title={`${marker.label}: ${marker.type} (${marker.quantity}) - ${marker.location} - ${marker.purpose}`}
              />
            )
          })}
      </div>

      <div className="w-80 border-l h-full overflow-hidden">
        <MarkersList 
          markers={markers}
          onDelete={deleteMarker}
          onSelectMarker={selectMarker}
          selectedMarkerId={selectedMarkerId}
          currentPageIndex={currentPageIndex}
          showAll={showAllMarkers}
          onToggleView={toggleMarkerView}
        />
      </div>

      <MarkerForm 
        open={markerFormOpen}
        onClose={() => setMarkerFormOpen(false)}
        onSave={addMarker}
        position={newMarkerPosition}
        existingOptions={existingOptions}
      />
    </div>
  )
}
