<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# NarratoAI
**Intelligent Document & Report Generation Powered by Gemini**
</div>

## 📖 Overview

NarratoAI is a powerful, React-based web application that leverages the Google Gemini API to generate structured, professional reports and documents from user-provided data. Designed with a sleek, cinematic interface, the app features robust error handling, a multi-model fallback strategy, and an elegant Bring-Your-Own-Key (BYOK) system to ensure uninterrupted productivity.

## ✨ Features

- **AI-Powered Report Generation**: Seamlessly transform raw data into comprehensive, well-structured documents using advanced Google Gemini models.
- **BYOK (Bring Your Own Key)**: A built-in Settings UI allowing users to securely provide their own Gemini API keys, bypassing system-level quota limitations.
- **Smart Model Fallback**: Automatically rotates between high-performance Gemini models (`gemini-3.1-pro`, `gemini-3-flash`, etc.) when quota limits or model availability issues occur.
- **PDF Export**: Generate visually stunning reports and effortlessly export them to high-quality PDF format (powered by `jspdf` and `html2canvas`).
- **Cinematic UI/UX**: A state-of-the-art interactive user interface featuring Framer Motion micro-animations, glowing components, and a stunning entry sequence.
- **Modern Tech Stack**: Built for speed and reliability using React 19, Vite, TypeScript, and modern CSS practices.

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **AI Integration**: `@google/genai` SDK
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Document Export**: jsPDF + html2canvas
- **Routing**: React Router DOM

## 🚀 Getting Started

Follow these instructions to run NarratoAI in your local development environment.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aakash250AD/NARRATO-AI.git
   cd NARRATO-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: You can also use the in-app Settings to input your API key dynamically).*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:5173` (or the port specified by Vite) to view the application.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Aakash250AD/NARRATO-AI/issues).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
