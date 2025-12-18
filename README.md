# File Extractor Tool

A modern, powerful web application for extracting metadata and content from various file formats, with a focus on character card formats (PNG character cards, CHARX).

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Multi-File Support**: Drag & drop or select multiple files at once.
- **Format Support**:
  - **Text & Code**: JSON, JS, TS, HTML, CSS, XML, MD, YAML, etc.
  - **Archives**: ZIP, CHARX, EPUB, DOCX, APK, JAR, etc.
  - **Images**: PNG, JPG, WEBP, GIF (extracts metadata and embedded JSON).
- **Character Card Specialized**: Specifically optimized for extracting data from:
  - **PNG Cards**: Extracts embedded `chara` chunks (tEXt/iTXt) including base64 JSON.
  - **CHARX**: Extracts character data, regex scripts, and assets.
- **Deep Extraction**: Recursively inspects nested ZIPs and objects.
- **Smart Search**: Real-time filtering and highlighting of metadata keys and values.
- **Premium UI**:
  - Glassmorphism aesthetic with animated backgrounds.
  - Horizontal scrolling for wide data tables.
  - Syntax-highlighted JSON viewer.
  - Dark mode optimized.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/file-extract.git
    cd file-extract
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the development server:

    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 🛠️ Usage

1.  **Upload**: Drag files into the glass-card area or click to browse.
2.  **Toggle Mode**: Use the switch to choose between "Full Extract" (content + metadata) or "Metadata Only" (faster, just info).
3.  **Review**: See your selected files in the grid list.
4.  **Extract**: Click "Extract Metadata" to process.
5.  **Explore**:
    - **Table View**: Browse structured data. Expand objects, view images, and copy values.
    - **JSON View**: See the raw output with syntax highlighting.
6.  **Export**: Download the full result as a JSON file.

## 🏗️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, DaisyUI
- **Icons**: Lucide React
- **File Handling**: JSZip

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
