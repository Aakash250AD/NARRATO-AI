
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Check, 
  Copy, 
  TrendingUp, 
  Lightbulb, 
  ListChecks, 
  FileSearch, 
  ChevronDown,
  FileCode,
  Printer,
  ChevronRight,
  Star,
  Edit3,
  Save,
  X,
  Plus,
  Trash,
  ClipboardCheck,
  Loader2,
  Volume2,
  Play,
  Square,
  Headphones,
  Music,
  Sparkles
} from 'lucide-react';
import { Report, User, StructuredReport } from '../types';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, pcmToAudioBuffer, encodeWAV } from '../utils/audioUtils';

interface ReportViewerProps {
  report: Report;
  user: User;
  onUpdateUser: (user: User) => void;
  onUpdateReport: (report: Report) => void;
}

type ViewMode = 'written' | 'audio';

const ReportViewer: React.FC<ReportViewerProps> = ({ report, user, onUpdateUser, onUpdateReport }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('written');
  const [copied, setCopied] = useState<'json' | 'md' | 'txt' | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [editedData, setEditedData] = useState<StructuredReport>(report.reportData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);
  const progressIntervalRef = useRef<number | null>(null);

  const { reportData } = report;
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedData(report.reportData);
    setIsEditing(false);
    stopSpeaking();
    setErrorMessage(null);
  }, [report]);

  const getFullTextForSpeech = () => {
    // Concise version for narration to prevent TTS overflow
    return `
      Summary for ${reportData.title}.
      ${reportData.executiveSummary}
      Key insights include: ${reportData.keyInsights.slice(0, 3).join('. ')}.
      We recommend: ${reportData.recommendations.slice(0, 3).join('. ')}.
      Final Conclusion: ${reportData.conclusion}
    `;
  };

  const handleStartSpeaking = async () => {
    if (isAudioLoading) return;
    setIsAudioLoading(true);
    setErrorMessage(null);

    try {
      const base64 = await generateSpeech(getFullTextForSpeech());
      const bytes = decodeBase64(base64);
      
      const samples = new Int16Array(bytes.buffer);
      const wav = encodeWAV(samples);
      setAudioBlob(wav);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const buffer = await pcmToAudioBuffer(bytes, audioContextRef.current);
      playBuffer(buffer);
    } catch (err: any) {
      console.error("Speech generation failed", err);
      setErrorMessage(err.message || "Speech synthesis failed. Please try again.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    stopSpeaking();
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setIsSpeaking(false);
      setAudioProgress(0);
      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
    };

    source.start(0);
    sourceNodeRef.current = source;
    setIsSpeaking(true);
    totalDurationRef.current = buffer.duration;
    startTimeRef.current = audioContextRef.current.currentTime;

    progressIntervalRef.current = window.setInterval(() => {
      if (audioContextRef.current) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        setAudioProgress(Math.min((elapsed / totalDurationRef.current) * 100, 100));
      }
    }, 100);
  };

  const stopSpeaking = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsSpeaking(false);
    setAudioProgress(0);
  };

  const downloadAudio = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NarratoAI_Voice_${report.filename.split('.')[0]}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDFDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloadingPDF(true);
    setShowExportOptions(false);
    const prevMode = viewMode;
    setViewMode('written');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#030712", logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`NarratoAI_${report.filename.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) { window.print(); } finally { 
      setIsDownloadingPDF(false);
      setViewMode(prevMode);
    }
  };

  const handleExport = (format: 'txt' | 'md' | 'pdf') => {
    const getPlainText = () => `REPORT: ${reportData.title}\nFILE: ${report.filename}\nDATE: ${new Date(report.createdAt).toLocaleString()}\n\nEXECUTIVE SUMMARY\n${reportData.executiveSummary}\n\nKEY INSIGHTS\n${reportData.keyInsights.join('\n')}\n\nRECOMMENDATIONS\n${reportData.recommendations.join('\n')}\n\nCONCLUSION\n${reportData.conclusion}`;
    const getMarkdownText = () => `# ${reportData.title}\n**File:** ${report.filename}\n\n## Summary\n${reportData.executiveSummary}`;

    if (format === 'txt') {
        const blob = new Blob([getPlainText()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `Report.txt`; a.click();
    } else if (format === 'md') {
        const blob = new Blob([getMarkdownText()], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `Report.md`; a.click();
    } else if (format === 'pdf') handlePDFDownload();
    setShowExportOptions(false);
  };

  return (
    <div className="space-y-6 pb-12 report-container">
      {/* Format Toggle Switcher */}
      <div className="flex justify-center no-print">
        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-1 backdrop-blur-md">
          <button 
            onClick={() => setViewMode('written')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${viewMode === 'written' ? 'bg-red-700 text-white shadow-lg shadow-red-700/25' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <FileText size={18} />
            Written Report
          </button>
          <button 
            onClick={() => setViewMode('audio')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${viewMode === 'audio' ? 'bg-red-900 text-white shadow-lg shadow-red-900/25' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Volume2 size={18} />
            Audio Experience
          </button>
        </div>
      </div>

      <div className="bg-black/70 border border-red-900/20 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl shadow-red-950/20 relative" ref={reportRef}>
        
        {/* Universal Header */}
        <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-black/20 no-print">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${viewMode === 'audio' ? 'bg-red-900/20 border-red-800/30' : 'bg-red-700/10 border-red-700/20'}`}>
              {viewMode === 'audio' ? <Headphones className="text-red-400" size={24} /> : <FileSearch className="text-red-400" size={24} />}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl leading-tight text-white">{reportData.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-gray-400 rounded border border-white/5 uppercase tracking-wider font-semibold">
                  {report.filename}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative no-print">
            <div className="relative">
              <button 
                disabled={isDownloadingPDF}
                onClick={() => setShowExportOptions(!showExportOptions)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-lg text-white active:scale-95 ${viewMode === 'audio' ? 'bg-red-900 hover:bg-red-800 shadow-red-900/20' : 'bg-red-700 hover:bg-red-600 shadow-red-700/20'}`}
              >
                {isDownloadingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                <span>Export</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${showExportOptions ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showExportOptions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExportOptions(false)} />
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-80 bg-[#111827] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden backdrop-blur-xl">
                      <div className="p-1.5 space-y-1">
                        {[{ id: 'pdf', label: 'Professional PDF', icon: Printer, color: 'text-red-400', bg: 'bg-red-500/10' }, { id: 'md', label: 'Markdown File', icon: FileCode, color: 'text-blue-400', bg: 'bg-blue-500/10' }, { id: 'txt', label: 'Raw Text File', icon: FileText, color: 'text-gray-400', bg: 'bg-gray-500/10' }].map(f => (
                          <button key={f.id} onClick={() => handleExport(f.id as any)} className="w-full px-4 py-3 flex items-center gap-3 rounded-xl hover:bg-white/5 transition-all group">
                            <div className={`p-2 rounded-lg ${f.bg} ${f.color} group-hover:scale-105 transition-transform`}><f.icon size={18} /></div>
                            <div className="text-left font-bold text-gray-200 text-sm">{f.label}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Dynamic Content Body */}
        <AnimatePresence mode="wait">
          {viewMode === 'written' ? (
            <motion.div 
              key="written-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 space-y-10"
            >
              <section className="space-y-4">
                <h3 className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-3"><span className="w-10 h-[1px] bg-red-400/30"></span>Executive Summary</h3>
                <p className="text-gray-200 text-xl leading-relaxed font-medium">{reportData.executiveSummary}</p>
              </section>

              <div className="grid md:grid-cols-2 gap-8">
                <section className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3 text-red-400 font-bold"><div className="p-2 bg-red-500/10 rounded-lg"><Lightbulb size={20} /></div><h4 className="text-lg">Key Insights</h4></div>
                  <ul className="space-y-4">
                    {reportData.keyInsights.map((insight, i) => (
                      <li key={i} className="flex gap-4 text-gray-400"><span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500" /><span className="text-sm">{insight}</span></li>
                    ))}
                  </ul>
                </section>
                <section className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3 text-red-300 font-bold"><div className="p-2 bg-red-400/10 rounded-lg"><TrendingUp size={20} /></div><h4 className="text-lg">Trends & Patterns</h4></div>
                  <ul className="space-y-4">
                    {reportData.trends.map((trend, i) => (
                      <li key={i} className="flex gap-4 text-gray-400"><span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400" /><span className="text-sm">{trend}</span></li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-red-400 font-bold"><div className="p-2 bg-red-500/10 rounded-lg"><ListChecks size={20} /></div><h4 className="text-lg">Strategic Recommendations</h4></div>
                <div className="grid gap-4">
                  {reportData.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-5 bg-red-950/20 border border-red-900/20 p-5 rounded-2xl group hover:bg-red-950/30 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-700/15 text-red-400 flex items-center justify-center font-bold text-sm border border-red-700/25">{i + 1}</div>
                      <p className="text-gray-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-8 border-t border-white/5 text-center italic">
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">"{reportData.conclusion}"</p>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="audio-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-12 flex flex-col items-center justify-center min-h-[500px] text-center space-y-12"
            >
              <div className="relative">
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-red-700 rounded-full blur-3xl -z-10"
                    />
                  )}
                </AnimatePresence>
                
                <div className={`w-40 h-40 rounded-[3rem] bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center shadow-2xl transition-all duration-500 ${isSpeaking ? 'scale-110 shadow-red-700/40' : 'scale-100'}`}>
                  {isAudioLoading ? (
                    <Loader2 size={60} className="text-white animate-spin" />
                  ) : isSpeaking ? (
                    <Volume2 size={60} className="text-white animate-pulse" />
                  ) : (
                    <Headphones size={60} className="text-white" />
                  )}
                </div>
              </div>

              <div className="space-y-4 max-w-lg">
                <h3 className="text-3xl font-bold text-white tracking-tight">Professional Narrator</h3>
                {errorMessage ? (
                    <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">{errorMessage}</p>
                ) : (
                    <p className="text-gray-400 leading-relaxed text-lg">
                        {isAudioLoading ? "Synthesizing narration..." : isSpeaking ? "Currently reading your report in a calm tone." : "Ready to provide a voice summary of your data."}
                    </p>
                )}
              </div>

              <div className="w-full max-w-xl space-y-6">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-inner">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 mt-10">
                    {isSpeaking ? (
                      <button 
                        onClick={stopSpeaking}
                        className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                      >
                        <Square size={24} fill="black" />
                      </button>
                    ) : (
                      <button 
                        onClick={handleStartSpeaking}
                        disabled={isAudioLoading}
                        className="w-20 h-20 rounded-full bg-red-700 text-white flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all shadow-2xl shadow-red-700/25 disabled:opacity-50"
                      >
                        {isAudioLoading ? <Loader2 className="animate-spin" size={32} /> : <Play size={32} fill="white" />}
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {audioBlob && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                      <button 
                        onClick={downloadAudio}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-bold text-sm"
                      >
                        <Download size={18} />
                        Download Voice Narration (WAV)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-10 py-5 bg-black/30 text-[10px] text-gray-500 flex justify-between uppercase tracking-widest no-print border-t border-white/5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div> Gemini 1.5 Flash Active</span>
          </div>
          <span>Report Generated: {new Date(report.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
