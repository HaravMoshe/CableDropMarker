'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { 
  ArrowUpTrayIcon, 
  XMarkIcon,
  ExclamationCircleIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Dynamically import the PDF Viewer component to avoid SSR issues
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading PDF Viewer...</p>
      </div>
    </div>
  )
})

export default function Home() {
  const [isPdfLoaded, setIsPdfLoaded] = useState<boolean>(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if running on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPdfLoaded(true)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF file')
        return
      }
      
      setError(null)
      setPdfFile(file)
    }
  }

  const clearPdf = () => {
    setPdfFile(null)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Cable Drop Marker</h1>
          
          <div className="flex items-center space-x-3">
            {!pdfFile ? (
              <div>
                <label 
                  htmlFor="pdf-upload" 
                  className="flex items-center cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  <span>Upload PDF Floor Plan</span>
                  <input 
                    id="pdf-upload" 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-3 truncate max-w-xs">
                  {pdfFile.name}
                </span>
                <Button 
                  onClick={clearPdf}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  <span>Clear</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {isPdfLoaded ? (
          pdfFile ? (
            <PdfViewer file={pdfFile} />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50">
              <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">No PDF Loaded</h2>
                <p className="text-gray-600 mb-6">
                  Upload a PDF floor plan to start marking cable drop locations.
                </p>
                <label 
                  htmlFor="pdf-upload-main" 
                  className="flex items-center justify-center cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mx-auto w-max transition-colors duration-200"
                >
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  <span>Upload PDF</span>
                  <input 
                    id="pdf-upload-main" 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </main>
  )
}