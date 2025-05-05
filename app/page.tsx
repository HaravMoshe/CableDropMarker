"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
import Papa from "papaparse";

GlobalWorkerOptions.workerSrc = pdfWorker;

export default function DropMarkerApp() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [zoom, setZoom] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [drops, setDrops] = useState<any[]>([]);
  const [form, setForm] = useState({ qty: "", type: "", location: "", purpose: "" });
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [purposeOptions, setPurposeOptions] = useState<string[]>([]);

  useEffect(() => {
    if (pdfFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const doc = await getDocument({ data: reader.result }).promise;
        setPdfDoc(doc);
      };
      reader.readAsArrayBuffer(pdfFile);
    }
  }, [pdfFile]);

  useEffect(() => {
    if (pdfDoc) renderPage(pageNum);
  }, [pdfDoc, pageNum, zoom]);

  const renderPage = async (num: number) => {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: zoom });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context!, viewport }).promise;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const label = `${form.type.slice(0, 3).toUpperCase()}-${form.purpose.slice(0, 3).toUpperCase()}-${drops.length + 1}`;
    const newDrop = { ...form, label, x, y, page: pageNum };
    setDrops([...drops, newDrop]);

    if (!typeOptions.includes(form.type)) setTypeOptions([...typeOptions, form.type]);
    if (!locationOptions.includes(form.location)) setLocationOptions([...locationOptions, form.location]);
    if (!purposeOptions.includes(form.purpose)) setPurposeOptions([...purposeOptions, form.purpose]);

    setForm({ qty: "", type: "", location: "", purpose: "" });
  };

  const exportCSV = () => {
    const csv = Papa.unparse(drops);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "drops.csv";
    link.click();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cable Drop Marker</h1>
        <div className="flex gap-2">
          <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
          <Button onClick={() => setPageNum((n) => Math.max(1, n - 1))}>Prev</Button>
          <Button onClick={() => setPageNum((n) => Math.min(n + 1, pdfDoc?.numPages || 1))}>Next</Button>
          <Button onClick={() => setZoom((z) => z + 0.25)}>Zoom In</Button>
          <Button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>Zoom Out</Button>
          <Button onClick={exportCSV}>Export CSV</Button>
        </div>
      </div>

      <div className="relative border rounded-lg overflow-hidden">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="cursor-crosshair" />
        {drops.filter(d => d.page === pageNum).map((d, i) => (
          <div key={i} className="absolute text-xs font-medium px-1 rounded bg-white shadow border"
            style={{
              top: d.y * zoom,
              left: d.x * zoom,
              borderColor: "#333",
              color: "#333",
              position: "absolute"
            }}>
            {d.label} ({d.qty})
          </div>
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Drop</Button>
        </DialogTrigger>
        <DialogContent className="space-y-4">
          <DialogTitle>Add New Drop</DialogTitle>
          <div className="grid gap-3">
            <Label>Quantity</Label>
            <Input value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />

            <Label>Type</Label>
            <Select value={form.type} onValueChange={val => setForm({ ...form, type: val })}>
              <SelectTrigger><SelectValue placeholder="Select or type" /></SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>

            <Label>Location</Label>
            <Select value={form.location} onValueChange={val => setForm({ ...form, location: val })}>
              <SelectTrigger><SelectValue placeholder="Select or type" /></SelectTrigger>
              <SelectContent>
                {locationOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>

            <Label>Purpose</Label>
            <Select value={form.purpose} onValueChange={val => setForm({ ...form, purpose: val })}>
              <SelectTrigger><SelectValue placeholder="Select or type" /></SelectTrigger>
              <SelectContent>
                {purposeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg p-4 bg-muted text-muted-foreground">
        <h2 className="text-lg font-medium mb-2">Drops List</h2>
        {drops.length === 0 ? (
          <p>No drops added yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {drops.map((drop, i) => (
              <li key={i}>
                <span className="font-medium">{drop.label}</span> — Qty: {drop.qty}, Type: {drop.type}, Location: {drop.location}, Purpose: {drop.purpose}, Page: {drop.page}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
