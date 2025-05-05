export interface Marker {
  id: string;
  x: number;
  y: number;
  pageIndex: number;
  quantity: number;
  type: string;
  location: string;
  purpose: string;
  label: string;
  createdAt: number;
}

export const PURPOSE_COLORS: Record<string, string> = {
  "Network": "network",
  "Power": "power",
  "Data": "data",
  "Audio": "audio",
  "Voice": "voice",
  "Security": "security", 
  "Control": "control",
  "Other": "other"
};