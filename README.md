# DocDiff AI

**AI-Powered Document Intelligence**

DocDiff AI is a modern, intelligent document comparison tool. It goes beyond simple text differencing by using Google Gemini 2.0 Flash to provide concise, context-aware summaries of what changed and why.

## 🌐 Live Demo
For the easy testing

**[Click here to view the Live Application](https://docdiff-ai.vercel.app/)**


---

## Features

- **Multi-Format Support:** Compare text, .docx, and .pdf files instantly.
- **AI-Powered Analysis:** Uses Google Gemini 2.0 Flash to generate smart summaries of changes, filtering out noise.
- **Visual Diff:** Side-by-side or Unified view with color-coded additions/deletions.
- **Statistics Dashboard:** Real-time metrics on change impact percentage, lines added/removed, histories of previous comparision , example run to show the ability of application and processing time.
- **Dark Mode:** Fully responsive UI with a professional dark theme.
- **Local History:** Automatically saves your recent comparisons locally (privacy-focused).
- **Export & Share:** Copy detailed reports to clipboard with one click.

---

## Technical Stack & Tools

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Library:** React 18+
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **PDF Handling:** pdfjs-dist (Client-side rendering)

### Backend
- **Runtime:** Node.js (via Next.js API Routes)
- **File Parsing:** mammoth.js (Server-side DOCX processing)
- **Diff Engine:** diff (jsdiff) library for precise text comparison

### AI & APIs
- **Primary AI Provider:** Google Gemini API
- **Model Used:** gemini-2.0-flash-exp

### Planning & Development Tools
- **Planning:** Claude AI (Sonnet 4.5)
- **Development Environment:** Cursor AI
- **Coding Assistants:** Gemini 3 and GPT 5.1 (via Cursor)

---

## Getting Started

Follow these steps to run the application locally.

### 1. Prerequisites
- Node.js 18+ installed.
- A Google Gemini API Key.

### 2. Installation

Clone the repository and install dependencies:

```bash

git clone https://github.com/greeshma-prabhu/docdiff-ai.git
cd docdiff-ai
npm install
```

### 3. Environment Setup

Create a .env.local file in the root directory and add your API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run the App

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

