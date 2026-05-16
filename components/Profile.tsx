
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  CreditCard, 
  Bell, 
  LogOut, 
  TrendingUp,
  FileText,
  Clock,
  Zap,
  Activity,
  Award,
  Globe,
  Loader2,
  CheckCircle2,
  X,
  Camera
} from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  user: UserType;
  reportCount: number;
  onLogout: () => void;
  onUpdateUser: (user: UserType) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, reportCount, onLogout, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reportLimit = user.plan === 'Enterprise' ? 1000 : 5;
  const usagePercentage = Math.min((reportCount / reportLimit) * 100, 100);

  const stats = [
    { label: 'Total Reports', value: reportCount, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Current Usage', value: `${usagePercentage.toFixed(0)}%`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Session Active', value: 'Live', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...user, name: editName, email: editEmail });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpgrade = () => {
    setIsUpgrading(true);
    // Simulate payment processing
    setTimeout(() => {
      onUpdateUser({ ...user, plan: 'Enterprise' });
      setIsUpgrading(false);
      setUpgradeSuccess(true);
      setTimeout(() => setUpgradeSuccess(false), 3000);
    }, 2000);
  };

  const togglePreference = (key: keyof typeof user.settings) => {
    const updatedSettings = { ...user.settings, [key]: !user.settings[key] };
    onUpdateUser({ ...user, settings: updatedSettings });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              className="hidden" 
              accept="image/*"
            />
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]">
              <Camera className="text-white" size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#030712] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight">{user.name}</h1>
              <motion.span 
                key={user.plan}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              >
                {user.plan}
              </motion.span>
            </div>
            <p className="text-gray-500 flex items-center gap-2 mt-1 font-medium">
              <Mail size={14} className="text-gray-600" />
              {user.email}
              <span className="opacity-20">•</span>
              <span className="text-gray-600 flex items-center gap-1.5">
                <Globe size={14} />
                San Francisco Hub
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-all border border-white/10 text-xs uppercase tracking-widest"
          >
            Edit Profile
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-all border border-red-500/20 text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-5 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-200">Workspace Usage</h3>
                <p className="text-xs text-gray-500">Real-time report generation limit</p>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <TrendingUp size={20} />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                <span>Active Reports</span>
                <span className="text-gray-300">{reportCount} / {reportLimit}</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${usagePercentage > 80 ? 'from-red-500 to-orange-500' : 'from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}
                />
              </div>
              <p className="text-[10px] text-gray-600 italic">Resets on next billing cycle</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-300">
                <Shield size={18} className="text-blue-400" />
                <h3 className="font-bold">Security & Identity</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 uppercase tracking-widest">VERIFIED</span>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Award size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200">Identity Verified</p>
                  <p className="text-xs text-gray-500">Your account is in good standing.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <CreditCard size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200">Default Payment</p>
                  <p className="text-xs text-gray-500">Corporate Card ending in 8802</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-gradient-to-br border border-white/10 rounded-3xl p-8 relative overflow-hidden group shadow-2xl transition-all duration-500 ${user.plan === 'Enterprise' ? 'from-emerald-900 to-black' : 'from-[#1e293b] to-[#0f172a]'}`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Zap size={140} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${user.plan === 'Enterprise' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
                {user.plan === 'Enterprise' ? <CheckCircle2 className="text-white" size={24} /> : <Zap className="text-white" size={24} fill="currentColor" />}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{user.plan === 'Enterprise' ? 'Enterprise Active' : 'Switch to Enterprise'}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
                  {user.plan === 'Enterprise' 
                    ? 'Enjoying unlimited reports, dedicated nodes, and priority Gemini integration.'
                    : 'Power your entire organization with dedicated Gemini 3 Pro nodes and custom AI model fine-tuning.'}
                </p>
              </div>
              
              <button 
                onClick={handleUpgrade}
                disabled={isUpgrading || user.plan === 'Enterprise'}
                className={`w-full py-4 font-extrabold rounded-2xl transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 ${
                  user.plan === 'Enterprise' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {isUpgrading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : 
                 upgradeSuccess ? <><CheckCircle2 size={20} /> Upgraded!</> : 
                 user.plan === 'Enterprise' ? 'Current Plan' : 'Upgrade Workspace'}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6"
          >
             <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-500/10 rounded-lg">
                  <Bell size={18} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-200 uppercase tracking-widest text-xs">Live Preferences</h3>
             </div>
             <div className="space-y-3">
                {[
                  { id: 'aiAccuracy', label: 'AI Accuracy Boost' },
                  { id: 'realtimeSync', label: 'Real-time Syncing' },
                  { id: 'weeklyReports', label: 'Weekly Summary' }
                ].map(setting => (
                  <label key={setting.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl cursor-pointer hover:bg-black/30 transition-all group">
                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-200 transition-colors uppercase tracking-widest">{setting.label}</span>
                    <button 
                      onClick={() => togglePreference(setting.id as any)}
                      className={`w-10 h-6 rounded-full relative transition-colors ${user.settings[setting.id as keyof typeof user.settings] ? 'bg-blue-600' : 'bg-gray-800'}`}
                    >
                       <motion.div 
                        initial={false}
                        animate={{ x: user.settings[setting.id as keyof typeof user.settings] ? 18 : 2 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md pointer-events-none"
                       />
                    </button>
                  </label>
                ))}
             </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#030712] border border-white/10 rounded-[2rem] w-full max-w-md p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full" />
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Edit Workspace Identity</h3>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
