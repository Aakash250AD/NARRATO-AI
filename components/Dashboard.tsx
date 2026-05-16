
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateReport, generateReportFromBinary } from '../services/geminiService';
import { Report, FileData, User } from '../types';
import ReportViewer from './ReportViewer';

interface DashboardProps {
  onReportGenerated: (report: Report) => void;
  user: User;
  onUpdateUser: (user: User) => void;
  onUpdateReport: (report: Report) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onReportGenerated, user, onUpdateUser, onUpdateReport }) => {
  const [file, setFile] = useState<FileData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setIsUploading(true);

    const fileName = selectedFile.name.toLowerCase();
    const isPdf = selectedFile.type === 'application/pdf' || fileName.endsWith('.pdf');
    const isOffice = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.docx') || fileName.endsWith('.doc');
    const isBinary = isPdf || isOffice;
    
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFile({
        name: selectedFile.name,
        type: selectedFile.type || (isPdf ? 'application/pdf' : isOffice ? 'application/vnd.openxmlformats-officedocument' : 'text/plain'),
        content,
        size: selectedFile.size,
        isPdf: isBinary, // Reuse this flag to mean "handle as binary/multimodal"
      });
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setIsUploading(false);
    };

    if (isBinary) {
      reader.readAsDataURL(selectedFile);
    } else {
      reader.readAsText(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    setError(null);
    setIsUploading(true);

    const fileName = droppedFile.name.toLowerCase();
    const isPdf = droppedFile.type === 'application/pdf' || fileName.endsWith('.pdf');
    const isOffice = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.docx') || fileName.endsWith('.doc');
    const isBinary = isPdf || isOffice;

    const reader = new FileReader();

    reader.onload = (event) => {
      setFile({
        name: droppedFile.name,
        type: droppedFile.type || (isPdf ? 'application/pdf' : isOffice ? 'application/vnd.openxmlformats-officedocument' : 'text/plain'),
        content: event.target?.result as string,
        size: droppedFile.size,
        isPdf: isBinary,
      });
      setIsUploading(false);
    };
    reader.onerror = () => { setError("Failed to read file"); setIsUploading(false); };

    if (isBinary) {
      reader.readAsDataURL(droppedFile);
    } else {
      reader.readAsText(droppedFile);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsGenerating(true);
    setError(null);

    try {
      const reportData = file.isPdf
        ? await generateReportFromBinary(file.content, file.name, file.type)
        : await generateReport(file.content, file.name);

      const newReport: Report = {
        id: Math.random().toString(36).substr(2, 9),
        filename: file.name,
        reportData,
        createdAt: new Date().toISOString(),
        fileType: file.type
      };
      setReportResult(newReport);
      onReportGenerated(newReport);
    } catch (err: any) {
      setError(err.message || "An error occurred during generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setFile(null);
    setReportResult(null);
    setError(null);
  };

  const handleUpdate = (updatedReport: Report) => {
    setReportResult(updatedReport);
    onUpdateReport(updatedReport);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col gap-2">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-red-100 to-red-400 bg-clip-text text-transparent"
        >
          Generate a Report
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg"
        >
          Upload your data and let NarratoAI create a structured professional analysis.
        </motion.p>
      </header>

      <AnimatePresence mode="wait">
        {!file && !reportResult && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="group relative h-[400px] border-2 border-dashed border-red-900/30 rounded-3xl bg-red-950/5 hover:bg-red-950/10 hover:border-red-700/40 transition-all flex flex-col items-center justify-center p-12 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".csv,.json,.txt,.xlsx,.xls,.docx,.doc,.pdf"
            />
            <div className="w-20 h-20 rounded-full bg-red-700/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-700/20 transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
              <Upload className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Drag & drop files here</h3>
            <p className="text-gray-500 max-w-sm">
              Supports CSV, JSON, TXT, Excel, Word and PDF files. Maximum file size 50MB.
            </p>
          </motion.div>
        )}

        {file && !reportResult && (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/60 border border-red-900/25 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-700/15 rounded-2xl flex items-center justify-center border border-red-700/20">
                  <FileText className="text-red-400" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{file.name}</h3>
                  <p className="text-gray-500">{(file.size / 1024).toFixed(1)} KB • {file.type}</p>
                </div>
              </div>
              <button onClick={reset} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors text-sm">Change file</button>
            </div>
            <div className="bg-black/60 rounded-2xl p-6 mb-8 border border-red-900/15 max-h-48 overflow-y-auto font-mono text-sm text-gray-500">
               {file.isPdf
                 ? <span className="text-red-400/70 italic">📄 Document loaded — {(file.size / 1024).toFixed(1)} KB · ready for AI analysis.</span>
                 : <>{file.content.substring(0, 1000)}{file.content.length > 1000 && "... [truncated]"}</>
               }
            </div>
            <div className="flex justify-end">
              <button
                disabled={isGenerating}
                onClick={handleGenerate}
                className="relative px-8 py-4 bg-red-700 hover:bg-red-600 disabled:bg-red-900/40 text-white rounded-xl font-bold flex items-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-red-700/25"
              >
                {isGenerating 
                  ? <><Loader2 className="animate-spin" size={20} />Analyzing Data...</> 
                  : <><Sparkles size={20} />Generate Structured Report<ArrowRight size={18} /></>
                }
              </button>
            </div>
          </motion.div>
        )}

        {reportResult && (
          <motion.div key="report-viewer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="flex justify-between items-center bg-red-500/10 border border-red-500/25 p-4 rounded-2xl">
              <div className="flex items-center gap-3 text-red-400"><CheckCircle2 size={24} /><span className="font-semibold">Report Generated Successfully</span></div>
              <button onClick={reset} className="text-sm font-medium hover:underline text-red-400">Start New Project</button>
            </div>
            <ReportViewer report={reportResult} user={user} onUpdateUser={onUpdateUser} onUpdateReport={handleUpdate} />
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 p-4 rounded-2xl text-red-400">
            <AlertCircle size={20} /><p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
