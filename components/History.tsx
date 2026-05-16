
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, ChevronRight, Trash2, Search, ExternalLink } from 'lucide-react';
import { Report, User } from '../types';
import ReportViewer from './ReportViewer';

interface HistoryProps {
  reports: Report[];
  onDelete: (id: string) => void;
  user: User;
  onUpdateUser: (user: User) => void;
  onUpdateReport: (report: Report) => void;
}

const History: React.FC<HistoryProps> = ({ reports, onDelete, user, onUpdateUser, onUpdateReport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter(r => 
    r.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reportData.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">History</h1>
          <p className="text-gray-400">Manage and review your generated structured reports.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-full md:w-80 transition-all"
          />
        </div>
      </header>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredReports.length > 0 ? (
            filteredReports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex items-center gap-6 transition-all hover:bg-white/[0.08]"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{report.reportData.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-white/5 rounded border border-white/5">{report.filename}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setSelectedReport(report)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(report.id)}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500/70 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="p-2">
                   <ChevronRight className="text-gray-600 group-hover:text-gray-400 transition-colors" size={20} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search size={32} />
              </div>
              <p className="text-lg">No reports found.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#030712] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl relative"
            >
              <div className="sticky top-0 right-0 p-6 flex justify-end z-10 no-print">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 backdrop-blur-md transition-all font-bold text-xs"
                >
                  Close Viewer
                </button>
              </div>
              <div className="px-8 pb-8 -mt-16">
                <ReportViewer 
                  key={selectedReport.id}
                  report={selectedReport} 
                  user={user} 
                  onUpdateUser={onUpdateUser} 
                  onUpdateReport={(updated) => {
                    setSelectedReport(updated);
                    onUpdateReport(updated);
                  }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
