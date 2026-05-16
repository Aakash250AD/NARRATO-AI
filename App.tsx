
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  History, 
  Settings as SettingsIcon, 
  Zap,
  User as UserIcon,
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import HistoryView from './components/History';
import ProfileView from './components/Profile';
import SettingsView from './components/Settings';
import Login from './components/Login';
import CinematicIntro from './components/CinematicIntro';
import { Report, User } from './types';

const NavLink = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -2 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-red-700/25 text-red-400 border border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.12)]' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium text-xs font-bold uppercase tracking-widest">{label}</span>
      {active && <motion.div layoutId="active-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-500 rounded-full" />}
    </motion.div>
  </Link>
);

const App: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('intro_seen'));

  const handleIntroDone = () => {
    sessionStorage.setItem('intro_seen', '1');
    setShowIntro(false);
  };

  useEffect(() => {
    const savedReports = localStorage.getItem('narrato_reports');
    if (savedReports) setReports(JSON.parse(savedReports));
    
    const savedUser = localStorage.getItem('narrato_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('narrato_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('narrato_user');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('narrato_user', JSON.stringify(updatedUser));
  };

  const saveReport = (report: Report) => {
    const updated = [report, ...reports];
    setReports(updated);
    localStorage.setItem('narrato_reports', JSON.stringify(updated));
  };

  const updateReport = (updatedReport: Report) => {
    const updated = reports.map(r => r.id === updatedReport.id ? updatedReport : r);
    setReports(updated);
    localStorage.setItem('narrato_reports', JSON.stringify(updated));
  };

  const deleteReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem('narrato_reports', JSON.stringify(updated));
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <CinematicIntro onComplete={handleIntroDone} />}
      </AnimatePresence>
      
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Router>
          <div className="flex flex-col h-screen bg-[#080000] text-gray-100 overflow-hidden">
            {/* Background ambient glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none no-print">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/15 blur-[140px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-red-800/10 blur-[120px] rounded-full" />
              <div className="absolute top-[50%] left-[50%] w-[20%] h-[20%] bg-red-950/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            <nav className="h-20 border-b border-red-900/20 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-50 no-print">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-700/30">
                  <Zap className="text-white" size={22} fill="currentColor" />
                </div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent"
                >
                  NarratoAI
                </motion.span>
              </div>

              <div className="flex items-center gap-2">
                <NavLocationAwareLink />
              </div>

              <div className="flex items-center gap-6">
                <NavProfileLink user={user} />
              </div>
            </nav>

            <main className="flex-1 relative overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard onReportGenerated={saveReport} user={user} onUpdateUser={handleUpdateUser} onUpdateReport={updateReport} />} />
                <Route path="/history" element={<HistoryView reports={reports} onDelete={deleteReport} user={user} onUpdateUser={handleUpdateUser} onUpdateReport={updateReport} />} />
                <Route path="/profile" element={<ProfileView user={user} reportCount={reports.length} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />} />
                <Route path="/settings" element={<SettingsView user={user} onUpdateSettings={(settings) => handleUpdateUser({...user, settings})} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      )}
    </>
  );
};

const NavProfileLink = ({ user }: { user: User }) => {
  const location = useLocation();
  const isActive = location.pathname === '/profile';
  return (
    <Link to="/profile">
      <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group ${isActive ? 'bg-white/5 border border-red-900/30' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-red-700/20 text-red-400 flex items-center justify-center font-bold text-xs uppercase group-hover:scale-110 transition-transform overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-bold text-gray-200 truncate">{user.name}</p>
          <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest">{user.plan} Plan</p>
        </div>
      </div>
    </Link>
  );
};

const NavLocationAwareLink = () => {
  const location = useLocation();
  return (
    <div className="flex items-center gap-2">
      <NavLink 
        to="/" 
        icon={LayoutDashboard} 
        label="Dashboard"
        active={location.pathname === '/'} 
      />
      <NavLink 
        to="/history" 
        icon={History} 
        label="History" 
        active={location.pathname === '/history'} 
      />
      <NavLink 
        to="/profile" 
        icon={UserIcon} 
        label="Account" 
        active={location.pathname === '/profile'} 
      />
      <NavLink 
        to="/settings" 
        icon={SettingsIcon} 
        label="Settings" 
        active={location.pathname === '/settings'} 
      />
    </div>
  );
};

export default App;
