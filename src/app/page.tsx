'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Upload as ArrowUpTrayIcon, X as XIcon, AlertCircle as AlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Dynamically import PdfViewer with SSR disabled
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div className="flex flex-col items-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        Loading PDF Viewer...
      </div>
    </div>
  ),
});

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
    setError(null);
    console.log('PDF file selected:', file.name);
  };

  const clearFile = () => {
    setPdfFile(null);
    setError(null);
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Cable Drop Marker</h1>

          {!pdfFile ? (
            <label
              htmlFor="pdf-upload"
              className="flex items-center cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Upload PDF
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="truncate max-w-xs text-sm text-gray-700">{pdfFile.name}</span>
              <Button variant="outline" size="sm" onClick={clearFile} className="flex items-center space-x-1">
                <XIcon className="w-4 h-4" />
                <span>Clear</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center text-red-700">
            <AlertIcon className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="flex-1 flex bg-gray-50">
        {pdfFile ? (
          <PdfViewer file={pdfFile} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full p-12 text-center">
            <div className="text-xl font-medium text-gray-700 mb-2">No PDF loaded</div>
            <p className="text-gray-500 mb-4">Upload a PDF floor plan to begin placing cable drop markers.</p>
            <label
              htmlFor="pdf-upload-fallback"
              className="inline-flex items-center justify-center cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Upload PDF
              <input
                id="pdf-upload-fallback"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </main>
  );
}
