import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Users, Activity, AlertTriangle, Settings, LogOut, Bell, Radio, Zap, ScanLine } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPortal from './components/LoginPortal';
import KioskScanner from './components/KioskScanner';
import PersonnelPage from './components/PersonnelPage';
import { API_URL } from './lib/api';
import { tr, translateAction, translateRole } from './i18n/tr';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  const permissions = user.role.permissions.map((p: any) => p.name);
  const canManageUsers = permissions.includes('manage_users');
  const canViewLogs = permissions.includes('view_logs');
  const canManageSettings = permissions.includes('manage_settings');

  return (
    <div className="w-72 premium-glass h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-white/5">
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-radsafe-primary to-radsafe-accent flex items-center justify-center shadow-neon">
          <Zap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase">{tr.brand}</h1>
          <p className="text-[10px] font-bold text-radsafe-accent tracking-widest uppercase mt-1">{translateRole(user.role.name)}</p>
        </div>
      </div>
      
      <div className="px-6 pb-4 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-4">{tr.mainMenu}</p>
        <nav className="space-y-2">
          {canViewLogs && <NavItem to="/" icon={<Activity />} label={tr.overview} active={location.pathname === '/'} />}
          {canManageUsers && <NavItem to="/personnel" icon={<Users />} label={tr.staffDir} active={location.pathname === '/personnel'} />}
          {canViewLogs && <NavItem to="/" icon={<AlertTriangle />} label={tr.liveIncidents} active={false} alert />}
          
          {!canViewLogs && <NavItem to="/" icon={<Activity />} label={tr.myExposure} active={location.pathname === '/'} />}
          {!canViewLogs && <NavItem to="/" icon={<Users />} label={tr.myLogs} active={location.pathname === '/'} />}
        </nav>

        {(canManageSettings || canViewLogs) && (
          <>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">{tr.system}</p>
            <nav className="space-y-2">
              {canViewLogs && <NavItem to="/kiosk" icon={<ScanLine />} label={tr.kiosk} target="_blank" />}
              {canViewLogs && <NavItem to="#" icon={<Shield />} label={tr.accessControl} />}
              {canManageSettings && <NavItem to="#" icon={<Settings />} label={tr.config} />}
            </nav>
          </>
        )}
      </div>
      
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="premium-glass p-4 rounded-2xl flex items-center gap-3 mb-4 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-radsafe-primary to-radsafe-accent p-0.5 relative shrink-0">
            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-bold text-white text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-radsafe-success rounded-full border-2 border-radsafe-panel"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.username}</p>
            <p className="text-[10px] uppercase tracking-wider text-radsafe-textMuted truncate">{translateRole(user.role.name)}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center justify-center gap-2 text-radsafe-danger hover:text-white transition-colors w-full p-3 rounded-xl hover:bg-radsafe-danger/20 border border-transparent hover:border-radsafe-danger/30">
          <LogOut className="w-4 h-4" />
          <span className="font-bold text-xs uppercase tracking-wider">{tr.signOut}</span>
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, active = false, alert = false, target }: any) => (
  <Link to={to} target={target} className={`flex items-center justify-between w-full p-3.5 rounded-xl transition-all duration-300 group ${active ? 'bg-gradient-to-r from-radsafe-primary/20 to-transparent border-l-2 border-radsafe-primary text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
    <div className="flex items-center gap-3">
      {React.cloneElement(icon, { className: `w-5 h-5 transition-colors ${active ? 'text-radsafe-primary' : 'group-hover:text-radsafe-accent'}` })}
      <span className={`font-medium text-sm ${active ? 'text-white' : ''}`}>{label}</span>
    </div>
    {alert && <div className="w-2 h-2 rounded-full bg-radsafe-danger animate-pulse-slow shadow-neon-danger"></div>}
  </Link>
);

const StatCard = ({ title, value, icon, danger = false }: any) => (
  <div className="premium-glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
    <div className={`absolute -right-6 -top-6 w-32 h-32 blur-[50px] opacity-30 rounded-full ${danger ? 'bg-radsafe-danger' : 'bg-radsafe-accent'} group-hover:opacity-50 transition-opacity duration-500`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-4xl font-display font-black text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3.5 rounded-2xl ${danger ? 'bg-radsafe-danger/10 text-radsafe-danger border border-radsafe-danger/20' : 'bg-radsafe-accent/10 text-radsafe-accent border border-radsafe-accent/20'}`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ active_personnel: 0, limit_warnings: 0, total_scans: 0, denied_accesses: 0 });
  const [logs, setLogs] = useState([]);
  const [simRfid, setSimRfid] = useState('RFID-001');
  const [rfidOptions, setRfidOptions] = useState<{ tag: string; label: string }[]>([]);
  const [areas, setAreas] = useState<{ id: number; name: string }[]>([]);
  const [selectedArea, setSelectedArea] = useState(1);
  const [myExposure, setMyExposure] = useState({ daily_minutes: 0, max_minutes: 240, is_inside: false });

  const hasViewLogs = user.role.permissions.some((p: { name: string }) => p.name === 'view_logs');
  const hasManageUsers = user.role.permissions.some((p: { name: string }) => p.name === 'manage_users');

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/areas`);
        setAreas(res.data);
        if (res.data.length) setSelectedArea(res.data[0].id);
      } catch {}
    };
    loadAreas();
  }, []);

  useEffect(() => {
    if (!hasManageUsers) return;
    const loadStaff = async () => {
      try {
        const res = await axios.get(`${API_URL}/personnel`);
        const opts = res.data
          .filter((e: { rfid_tag?: string }) => e.rfid_tag)
          .map((e: { rfid_tag: string; first_name: string; last_name: string }) => ({
            tag: e.rfid_tag,
            label: `${e.first_name} ${e.last_name}`,
          }));
        setRfidOptions(opts);
        if (opts.length) setSimRfid(opts[0].tag);
      } catch {}
    };
    loadStaff();
  }, [hasManageUsers]);

  useEffect(() => {
    if (hasViewLogs) return;
    const fetchMyExposure = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/my-exposure`);
        setMyExposure(res.data);
      } catch {}
    };
    fetchMyExposure();
    const interval = setInterval(fetchMyExposure, 2000);
    return () => clearInterval(interval);
  }, [hasViewLogs]);

  const fetchData = async () => {
    try {
      const statsRes = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(statsRes.data);
      const logsRes = await axios.get(`${API_URL}/dashboard/live-logs`);
      setLogs(logsRes.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        // Handle forbidden properly if needed
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // 2s refresh for real-time feel
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    try {
      const res = await axios.post(`${API_URL}/access/scan`, {
        rfid_tag: simRfid,
        area_id: selectedArea,
      });
      alert(
        `${tr.scanResult}: ${translateAction(res.data.message)}\n${res.data.personnel_name}\n${tr.remaining}: ${Math.floor(res.data.remaining_minutes)} dk`
      );
      fetchData();
    } catch {
      alert(tr.scanFailed);
    }
  };

  if (!hasViewLogs) {
    const myUsed = Math.round(myExposure.daily_minutes * 10) / 10;
    const myMax = myExposure.max_minutes;
    const myPercent = Math.min((myUsed / myMax) * 100, 100);
    const myRemaining = Math.round(Math.max(myMax - myUsed, 0) * 10) / 10;
    const isWarning = myPercent >= 80;
    const isAtLimit = myUsed >= myMax;

    return (
      <div className="p-10 max-w-[1600px] mx-auto">

        {/* Limit Alert Banner */}
        {isAtLimit && (
          <div className="mb-6 p-5 rounded-2xl bg-radsafe-danger/10 border border-radsafe-danger/40 flex items-center gap-4 animate-pulse-slow">
            <AlertTriangle className="w-8 h-8 text-radsafe-danger shrink-0" />
            <div>
              <p className="text-radsafe-danger font-black text-lg uppercase tracking-wide">⚠ {tr.limitExceeded}</p>
              <p className="text-slate-300 text-sm">{tr.limitExceededDesc}</p>
            </div>
          </div>
        )}
        {isWarning && !isAtLimit && (
          <div className="mb-6 p-5 rounded-2xl bg-radsafe-warning/10 border border-radsafe-warning/40 flex items-center gap-4">
            <AlertTriangle className="w-7 h-7 text-radsafe-warning shrink-0" />
            <div>
              <p className="text-radsafe-warning font-bold text-base">{tr.approachingLimit} — <span className="font-black">{myRemaining} {tr.remainingMin}</span>.</p>
              <p className="text-slate-400 text-sm">{tr.planExit}</p>
            </div>
          </div>
        )}
        <h2 className="text-3xl font-display font-bold text-white mb-2">{tr.myExposureTitle}</h2>
        <p className="text-radsafe-textMuted font-medium mb-2">{tr.myExposureDesc}</p>
        <p className={`text-sm font-bold mb-10 ${myExposure.is_inside ? 'text-radsafe-warning' : 'text-radsafe-success'}`}>
          {myExposure.is_inside ? tr.insideNow : tr.outsideNow}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="premium-glass p-6 rounded-2xl relative overflow-hidden">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{tr.usedToday}</p>
            <h3 className={`text-4xl font-black tracking-tight ${isWarning ? 'text-radsafe-warning' : 'text-white'}`}>{myUsed}<span className="text-lg text-slate-500"> dk</span></h3>
          </div>
          <div className="premium-glass p-6 rounded-2xl relative overflow-hidden">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{tr.remaining}</p>
            <h3 className={`text-4xl font-black tracking-tight ${myRemaining === 0 ? 'text-radsafe-danger' : 'text-white'}`}>{myRemaining}<span className="text-lg text-slate-500"> dk</span></h3>
          </div>
          <div className="premium-glass p-6 rounded-2xl relative overflow-hidden">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{tr.dailyLimit}</p>
            <h3 className="text-4xl font-black text-white tracking-tight">{myMax}<span className="text-lg text-slate-500"> dk</span></h3>
          </div>
        </div>

        {/* Scan My Card Button */}
        <div className="premium-glass rounded-3xl p-6 mb-6 border border-radsafe-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-radsafe-primary to-radsafe-accent flex items-center justify-center shadow-neon shrink-0">
                <ScanLine className="text-white w-7 h-7" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{tr.roomEntry}</p>
                <p className="text-slate-400 text-sm">{tr.roomEntryDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(Number(e.target.value))}
                className="bg-radsafe-panel border border-white/10 text-white rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-radsafe-primary flex-1 sm:flex-none"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id} className="bg-radsafe-panel">
                    {a.name}
                  </option>
                ))}
              </select>
              <button
                onClick={async () => {
                  if (!user.rfid_tag) {
                    alert(tr.noRfid);
                    return;
                  }
                  try {
                    const res = await axios.post(`${API_URL}/access/scan`, {
                      rfid_tag: user.rfid_tag,
                      area_id: selectedArea,
                    });
                    alert(
                      `✅ ${translateAction(res.data.message)}\n${res.data.personnel_name}\n${tr.remaining}: ${Math.floor(res.data.remaining_minutes)} dk`
                    );
                    const exp = await axios.get(`${API_URL}/dashboard/my-exposure`);
                    setMyExposure(exp.data);
                    fetchData();
                  } catch {
                    alert(tr.accessDeniedAlert);
                    fetchData();
                  }
                }}
                className="btn-primary px-6 py-3 shrink-0"
              >
                <ScanLine className="w-5 h-5" />
                <span>{tr.scan}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="premium-glass rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">{tr.exposureBar}</h3>
            <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${isWarning ? 'text-radsafe-warning bg-radsafe-warning/10 border-radsafe-warning/20' : 'text-radsafe-success bg-radsafe-success/10 border-radsafe-success/20'}`}>
              {isWarning ? `⚠ ${tr.approachingLimitBadge}` : `✓ ${tr.safeRange}`}
            </span>
          </div>
          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isWarning ? 'bg-radsafe-warning' : 'bg-radsafe-accent'}`}
              style={{ width: `${myPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
            <span>{myUsed} dk</span>
            <span>{myMax} dk ({tr.legalLimit})</span>
          </div>
        </div>

        {/* My Access Log Table */}
        <div className="premium-glass rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-radsafe-accent rounded-full"></div>
              <h3 className="text-xl font-display font-bold text-white">{tr.myAccessLog}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-radsafe-success bg-radsafe-success/10 px-3 py-1.5 rounded-lg border border-radsafe-success/20">
              <div className="w-2 h-2 rounded-full bg-radsafe-success animate-pulse"></div>
              {tr.liveFeedBadge}
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="pb-4">{tr.area}</th>
                <th className="pb-4">{tr.action}</th>
                <th className="pb-4">{tr.time}</th>
                <th className="pb-4 text-right">{tr.status}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {logs.filter((l: { username: string }) => l.username === user.username).length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-slate-500">{tr.noLogsToday}</td></tr>
              )}
              {logs.filter((l: { username: string }) => l.username === user.username).map((log: { id: number; area: string; action: string; time_in: string }) => {
                const isDenied = log.action === 'DENIED';
                const isExit = log.action === 'EXITED';
                return (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 text-slate-300 font-medium">{log.area}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-md text-xs border font-bold ${isExit ? 'bg-slate-800/50 text-slate-400 border-slate-700' : (isDenied ? 'bg-radsafe-danger/10 text-radsafe-danger border-radsafe-danger/20' : 'bg-radsafe-primary/10 text-radsafe-primary border-radsafe-primary/20')}`}>
                        {translateAction(log.action)}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 font-mono text-xs">{log.time_in}</td>
                    <td className="py-4 text-right">
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${isDenied ? 'text-radsafe-danger bg-radsafe-danger/10 border-radsafe-danger/20' : 'text-radsafe-success bg-radsafe-success/10 border-radsafe-success/20'}`}>
                        {isDenied ? tr.denied : tr.granted}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">{tr.facilityOverview}</h2>
          <p className="text-radsafe-textMuted font-medium">{tr.facilityDesc}</p>
        </div>
        
        {hasManageUsers && (
          <div className="premium-glass p-2 rounded-2xl flex flex-wrap items-center gap-2 pr-2">
            <div className="px-4 flex items-center gap-2 border-r border-white/10">
              <Radio className="w-5 h-5 text-radsafe-accent animate-pulse-slow" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{tr.emulator}</span>
            </div>
            <select
              value={simRfid}
              onChange={(e) => setSimRfid(e.target.value)}
              className="bg-transparent border-none text-white p-2 text-sm focus:outline-none cursor-pointer font-medium"
            >
              {rfidOptions.map((o) => (
                <option key={o.tag} className="bg-radsafe-panel" value={o.tag}>
                  {o.label}
                </option>
              ))}
              <option className="bg-radsafe-panel" value="RFID-INVALID">Geçersiz Etiket</option>
            </select>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(Number(e.target.value))}
              className="bg-radsafe-panel border border-white/10 text-white rounded-xl px-3 py-2 text-sm"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button onClick={handleScan} className="btn-primary">
              <ScanLine className="w-4 h-4" />
              <span>{tr.scanTag}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title={tr.activeInside} value={stats.active_personnel} icon={<Users />} />
        <StatCard title={tr.criticalLimits} value={stats.limit_warnings} icon={<AlertTriangle />} danger />
        <StatCard title={tr.totalTelemetry} value={stats.total_scans} icon={<Activity />} />
        <StatCard title={tr.deniedEntries} value={stats.denied_accesses} icon={<Shield />} />
      </div>

      <div className="premium-glass rounded-3xl p-8 relative overflow-hidden">
        {/* Glow effect for the table container */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-radsafe-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-radsafe-accent rounded-full"></div>
            <h3 className="text-xl font-display font-bold text-white">{tr.liveFeed}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-radsafe-success bg-radsafe-success/10 px-3 py-1.5 rounded-lg border border-radsafe-success/20">
            <div className="w-2 h-2 rounded-full bg-radsafe-success animate-pulse"></div>
            {tr.systemOnline}
          </div>
        </div>
        
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="pb-4 pl-4">{tr.personnel}</th>
                <th className="pb-4">{tr.sector}</th>
                <th className="pb-4">{tr.action}</th>
                <th className="pb-4">{tr.timestamp}</th>
                <th className="pb-4">{tr.exposureLevel}</th>
                <th className="pb-4 text-center">{tr.reset}</th>
                <th className="pb-4 pr-4 text-right">{tr.status}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {logs.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-500 font-medium">{tr.awaitingData}</td></tr>
              )}
              {logs.map((log: any) => {
                const percent = (log.daily_minutes / log.max_minutes) * 100;
                const isWarning = percent >= 80;
                const isDenied = log.action === 'DENIED';
                const isExit = log.action === 'EXITED';
                
                return (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg ${isWarning ? 'bg-gradient-to-br from-radsafe-warning to-orange-600' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                          {log.personnel_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-radsafe-accent transition-colors">{log.personnel_name}</p>
                          <p className="text-[11px] font-medium tracking-wider text-slate-500 font-mono">{log.personnel_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400 font-medium">{log.department}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-md text-xs border font-bold tracking-wide ${isExit ? 'bg-slate-800/50 text-slate-400 border-slate-700' : (isDenied ? 'bg-radsafe-danger/10 text-radsafe-danger border-radsafe-danger/20' : 'bg-radsafe-primary/10 text-radsafe-primary border-radsafe-primary/20')}`}>
                        {translateAction(log.action)}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 font-mono text-xs">{log.time_in}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full relative ${isWarning ? 'bg-radsafe-warning shadow-neon-danger' : 'bg-radsafe-accent shadow-neon-accent'}`} style={{ width: `${Math.min(percent, 100)}%` }}>
                            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px]"></div>
                          </div>
                        </div>
                        <span className={`text-xs font-mono font-bold ${isWarning ? 'text-radsafe-warning' : 'text-slate-400'}`}>
                          {log.daily_minutes}/{log.max_minutes} dk
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      {log.username && (
                        <button
                          onClick={async () => {
                            if (!confirm(`${log.personnel_name} — ${tr.resetConfirm}`)) return;
                            await axios.post(`${API_URL}/access/reset-exposure/${log.username}`);
                            fetchData();
                          }}
                          title={tr.reset}
                          className="p-2 rounded-lg text-slate-500 hover:text-radsafe-warning hover:bg-radsafe-warning/10 border border-transparent hover:border-radsafe-warning/30 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        </button>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      {isDenied ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-radsafe-danger/10 text-radsafe-danger rounded-lg text-xs font-bold uppercase tracking-wider border border-radsafe-danger/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                          <Shield className="w-3 h-3" /> {tr.denied}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${isWarning ? 'bg-radsafe-warning/10 text-radsafe-warning border-radsafe-warning/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-radsafe-success/10 text-radsafe-success border-radsafe-success/20'}`}>
                          {isWarning ? <AlertTriangle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {isWarning ? tr.warning : tr.granted}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-[#020202] flex items-center justify-center"><div className="w-10 h-10 border-4 border-radsafe-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isKiosk = location.pathname === '/kiosk';
  
  if (isKiosk) {
    return (
      <Routes>
        <Route path="/kiosk" element={<KioskScanner />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-radsafe-bg text-radsafe-text flex">
      {user && <Sidebar />}
      <main className={`flex-1 flex flex-col relative ${user ? 'ml-72' : ''}`}>
        
        {/* Top Header Navigation */}
        {user && (
          <header className="h-20 premium-glass border-x-0 border-t-0 flex items-center justify-between px-10 sticky top-0 z-40 bg-radsafe-bg/60 backdrop-blur-3xl">
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{tr.terminal}</span>
              <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hidden sm:block">{tr.sessionActive}</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-radsafe-danger rounded-full shadow-neon-danger"></span>
              </button>
            </div>
          </header>
        )}

        {/* Page Content */}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPortal />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/personnel" element={<ProtectedRoute><PersonnelPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
