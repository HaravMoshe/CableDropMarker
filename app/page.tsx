"use client";
import { useState, useRef, useEffect } from "react";
import { pdfjs } from "pdfjs-dist";
import Papa from "papaparse";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function HomePage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [zoom, setZoom] = useState(1.5);
  const [drops, setDrops] = useState(() =>
    JSON.parse(localStorage.getItem("drops") || "[]")
  );
  const canvasRef = useRef();

  useEffect(() => {
    if (pdfFile) {
      const reader = new FileReader();
      reader.onload = async function () {
        const loadingTask = pdfjs.getDocument({ data: reader.result });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
      };
      reader.readAsArrayBuffer(pdfFile);
    }
  }, [pdfFile]);

  useEffect(() => {
    if (pdfDoc) renderPage(pageNum);
  }, [pdfDoc, pageNum, zoom]);

  const renderPage = async (num) => {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: zoom });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: ctx, viewport }).promise;
  };

  const handleDrop = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const qty = prompt("Quantity?");
    const type = prompt("Type?");
    const location = prompt("Location?");
    const purpose = prompt("Purpose?");
    const label = `${type.slice(0, 3).toUpperCase()}-${purpose
      .slice(0, 3)
      .toUpperCase()}-${drops.length + 1}`;
    const color = purpose === "POS" ? "red" : "blue";
    const newDrop = { label, qty, type, location, purpose, x, y, page: pageNum, color };
    const updated = [...drops, newDrop];
    setDrops(updated);
    localStorage.setItem("drops", JSON.stringify(updated));
  };

  const exportCSV = () => {
    const csv = Papa.unparse(drops);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "drops.csv";
    link.click();
  };

  return (
    <main className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Cable Drop Marker</h1>
      <input type="file" onChange={(e) => setPdfFile(e.target.files[0])} />
      {pdfDoc && (
        <div className="flex items-center gap-2">
          <button onClick={() => setPageNum((p) => Math.max(p - 1, 1))}>Prev</button>
          <span>
            Page {pageNum} / {pdfDoc.numPages}
          </span>
          <button onClick={() => setPageNum((p) => Math.min(p + 1, pdfDoc.numPages))}>
            Next
          </button>
          <button onClick={() => setZoom((z) => z + 0.25)}>Zoom In</button>
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>Zoom Out</button>
          <button onClick={exportCSV}>Export CSV</button>
        </div>
      )}
      <div className="relative border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} onClick={handleDrop} className="cursor-crosshair" />
        {drops
          .filter((d) => d.page === pageNum)
          .map((d, i) => (
            <div
              key={i}
              className="absolute text-xs font-medium px-1 rounded bg-white shadow border"
              style={{
                top: d.y * zoom,
                left: d.x * zoom,
                borderColor: d.color,
                color: d.color,
              }}
            >
              {d.label} ({d.qty})
            </div>
          ))}
      </div>
    </main>
  );
}
