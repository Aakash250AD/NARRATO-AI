
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Cloud, 
  ShieldCheck, 
  Key,
  Database,
  Info
} from 'lucide-react';
import { User, UserSettings } from '../types';

interface SettingsProps {
  user: User;
  onUpdateSettings: (settings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateSettings }) => {
  const toggleSetting = (key: keyof UserSettings) => {
    if (key === 'defaultExportFormat') return;
    onUpdateSettings({ ...user.settings, [key]: !user.settings[key] });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/10 rounded-2xl border border-red-900/20">
            <SettingsIcon className="text-red-500" size={28} />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">System Configuration</h1>
        </div>
        <p className="text-gray-400 font-medium text-lg">Fine-tune the AI analysis engine and global workspace parameters.</p>
      </header>

      <div className="grid gap-12">
        {/* Engine Settings */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500/60 flex items-center gap-3">
            <span className="w-8 h-px bg-red-500/20"></span>
            <Cpu size={14} />
            Analysis Engine
          </h3>
          <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] divide-y divide-white/5 overflow-hidden">
            {[
              { id: 'aiAccuracy', label: 'Precision Reasoning Mode', desc: 'Use additional passes for higher accuracy checks.', icon: Cpu },
              { id: 'realtimeSync', label: 'Quantum Sync Engine', desc: 'Instantaneous synchronization across all devices.', icon: Cloud },
              { id: 'weeklyReports', label: 'Automated Insight Digest', desc: 'Receive weekly performance metrics and data trends.', icon: ShieldCheck }
            ].map((setting) => (
              <div key={setting.id} className="p-8 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-red-500/10 group-hover:text-red-500 transition-all border border-transparent group-hover:border-red-900/20">
                    <setting.icon size={26} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-100 text-lg">{setting.label}</h4>
                    <p className="text-sm text-gray-500 max-w-sm">{setting.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSetting(setting.id as any)}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${user.settings[setting.id as keyof UserSettings] ? 'bg-red-700 shadow-[0_0_15px_rgba(185,28,28,0.4)]' : 'bg-gray-800'}`}
                >
                  <motion.div 
                    initial={false}
                    animate={{ x: user.settings[setting.id as keyof UserSettings] ? 28 : 4 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Maintenance Zone */}
        <section className="space-y-6 pt-6">
           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 flex items-center gap-3">
            <span className="w-8 h-px bg-red-900/30"></span>
            <Database size={14} />
            Data Maintenance
          </h3>
          <div className="bg-red-950/10 border border-red-900/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-red-400 text-xl">Purge Workspace Cache</h4>
              <p className="text-sm text-gray-500 mt-1 max-w-md">Instantly clear all locally stored reports, user data, and session states. This action is irreversible.</p>
            </div>
            <button 
              onClick={() => {
                if (confirm('Irreversible: All reports and settings will be deleted. Proceed?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-8 py-4 bg-red-900/20 hover:bg-red-900/40 text-red-500 font-black rounded-2xl border border-red-900/30 transition-all uppercase tracking-[0.2em] text-[10px] shrink-0 active:scale-95"
            >
              Execute Purge
            </button>
          </div>
        </section>
      </div>
      
      <div className="pt-12 text-center">
        <p className="text-[10px] font-mono tracking-widest text-gray-600 uppercase">
          NarratoAI System Core v2.0.4 • Security Protocol Active
        </p>
      </div>
    </div>
  );
};

export default Settings;
