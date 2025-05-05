# Cable Drop Marker

Cable Drop Marker is a browser-based application for marking cable drop locations on PDF floor plans. The application allows users to upload a multi-page PDF and add markers for network, power, data, and other types of cable installations.

![Cable Drop Marker Screenshot](https://via.placeholder.com/800x400.png?text=Cable+Drop+Marker+Screenshot)

## Features

- PDF viewer with zooming and page navigation
- Click anywhere on the PDF to add a marker
- Each marker includes details: Quantity, Type, Location, and Purpose
- Smart dropdowns that remember previously entered values
- Automatic label generation in the format `TYPE-PUR-#` (e.g., `CAT-NET-1`)
- Color-coded markers based on purpose
- Marker list with all details
- Export to CSV functionality
- Persistent storage using localStorage
- Clean, modern UI following the Untitled UI aesthetic

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React PDF Viewer
- React CSV

## Deployment

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cable-drop-marker.git
cd cable-drop-marker