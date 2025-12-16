# File Extractor

A modern web application for extracting file contents to JSON format. Built with React, TypeScript, Tailwind CSS, and DaisyUI.

![File Extractor](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-blue) ![DaisyUI](https://img.shields.io/badge/DaisyUI-5-green)

## ✨ Features

- **Drag & Drop Upload** - Simply drag files or click to select
- **Multi-file Support** - Extract multiple files at once
- **ZIP Archive Extraction** - Supports `.charx`, `.zip`, `.epub`, `.docx`, `.xlsx`, and more
- **Full Extract Mode** - Get complete file contents including parsed JSON, CSV, XML
- **Metadata Only Mode** - Extract only file metadata without content
- **Image Gallery** - Preview and download images from ZIP archives
- **Copy & Download** - Export results as JSON

## 🛠️ Tech Stack

- **Vite** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **DaisyUI** - UI components
- **Lucide React** - Icons
- **JSZip** - ZIP file handling
- **React Router** - Routing

## 📁 Project Structure

```
src/
├── components/
│   ├── ActionButtons.tsx    # Extract & Clear buttons
│   ├── FileList.tsx         # Selected files display
│   ├── Header.tsx           # App header
│   ├── ImageGallery.tsx     # Image preview & download
│   ├── ResultSection.tsx    # JSON output display
│   ├── ToggleSwitch.tsx     # Extract mode toggle
│   └── UploadArea.tsx       # Drag & drop zone
├── hooks/
│   └── useFileExtractor.ts  # Main extraction logic
├── lib/
│   └── fileUtils.ts         # File utilities & types
├── pages/
│   └── Extractor.tsx        # Main page component
├── App.tsx                  # Router provider
├── router.tsx               # Route definitions
├── main.tsx                 # Entry point
└── index.css                # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd FileExtract

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

## 📖 Usage

1. **Upload Files** - Drag & drop files or click the upload area
2. **Select Mode** - Choose "Full Extract" or "Metadata Only"
3. **Extract** - Click "Extract to JSON" button
4. **View Results** - See the JSON output below
5. **Export** - Copy to clipboard or download as JSON file
6. **Images** - For ZIP files, view and download extracted images

## 📦 Supported File Types

### Text Files

- JSON, CSV, XML, TXT, MD, YAML, HTML, CSS, JS

### Archive Files

- `.charx`, `.zip`, `.cbz`, `.epub`
- `.docx`, `.xlsx`, `.pptx`
- `.odt`, `.ods`, `.odp`
- `.apk`, `.jar`

### Images (in archives)

- PNG, JPG, JPEG, GIF, WEBP, BMP

## 📄 License

MIT License
