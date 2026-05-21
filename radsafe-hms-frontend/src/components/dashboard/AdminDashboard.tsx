import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users,
  Activity,
  AlertTriangle,
  Shield,
  Radio,
  ScanLine,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../lib/api';
import { tr, translateAction } from '../../i18n/tr';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';
import { LivePersonnelPanel } from './LivePersonnelPanel';

type Log = {
  id: number;
  username: string;
  personnel_name: string;
  personnel_code: string;
  department: string;
  area: string;
  action: string;
  time_in: string;
  daily_minutes: number;
  max_minutes: number;
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const hasManageUsers = user?.role?.permissions?.some(
    (p: { name: string }) => p.name === 'manage_users'
  );

  const [stats, setStats] = useState({
    active_personnel: 0,
    limit_warnings: 0,
    total_scans: 0,
    denied_accesses: 0,
  });
  const [logs, setLogs] = useState<Log[]>([]);
  const [simRfid, setSimRfid] = useState('RFID-001');
  const [rfidOptions, setRfidOptions] = useState<{ tag: string; label: string }[]>([]);
  const [areas, setAreas] = useState<{ id: number; name: string }[]>([]);
  const [selectedArea, setSelectedArea] = useState(1);

  useEffect(() => {
    axios.get(`${API_URL}/dashboard/areas`).then((res) => {
      setAreas(res.data);
      if (res.data.length) setSelectedArea(res.data[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasManageUsers) return;
    axios.get(`${API_URL}/personnel`).then((res) => {
      const opts = res.data
        .filter((e: { rfid_tag?: string }) => e.rfid_tag)
        .map((e: { rfid_tag: string; first_name: string; last_name: string }) => ({
          tag: e.rfid_tag,
          label: `${e.first_name} ${e.last_name}`,
        }));
      setRfidOptions(opts);
      if (opts.length) setSimRfid(opts[0].tag);
    }).catch(() => {});
  }, [hasManageUsers]);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`),
        axios.get(`${API_URL}/dashboard/live-logs`),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    try {
      const res = await axios.post(`${API_URL}/access/scan`, {
        rfid_tag: simRfid,
        area_id: selectedArea,
      });
      toast(
        `${translateAction(res.data.message)} — ${res.data.personnel_name} · ${tr.remaining}: ${Math.floor(res.data.remaining_minutes)} dk`,
        res.data.status === 'GRANTED' ? 'ok' : 'err'
      );
      fetchData();
    } catch {
      toast(tr.scanFailed, 'err');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title={tr.facilityOverview}
        description={tr.facilityDesc}
        action={
          hasManageUsers && (
            <Card className="!p-3 !rounded-xl flex flex-wrap items-center gap-2 border-radsafe-primary/20">
              <div className="flex items-center gap-2 px-2 border-r border-white/10">
                <Radio className="h-4 w-4 text-radsafe-accent animate-pulse-slow" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {tr.emulator}
                </span>
              </div>
              <select
                value={simRfid}
                onChange={(e) => setSimRfid(e.target.value)}
                className="bg-transparent text-sm text-white border-none focus:outline-none cursor-pointer max-w-[140px]"
              >
                {rfidOptions.map((o) => (
                  <option key={o.tag} value={o.tag} className="bg-radsafe-panel">
                    {o.label}
                  </option>
                ))}
                <option value="RFID-INVALID" className="bg-radsafe-panel">
                  Geçersiz Etiket
                </option>
              </select>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(Number(e.target.value))}
                className="select-field !py-2 !px-3 text-xs min-w-[130px]"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id} className="bg-radsafe-panel">
                    {a.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleScan} className="btn-primary !py-2 !px-4 text-xs">
                <ScanLine className="h-4 w-4" />
                {tr.scanTag}
              </button>
            </Card>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title={tr.activeInside} value={stats.active_personnel} icon={Users} />
        <StatCard title={tr.criticalLimits} value={stats.limit_warnings} icon={AlertTriangle} variant="danger" />
        <StatCard title={tr.totalTelemetry} value={stats.total_scans} icon={Activity} />
        <StatCard title={tr.deniedEntries} value={stats.denied_accesses} icon={Shield} variant="warning" />
      </div>

      <LivePersonnelPanel />

      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-radsafe-accent" />
            <h3 className="text-lg font-semibold text-white">{tr.liveFeed}</h3>
          </div>
          <Badge variant="success" pulse>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {tr.systemOnline}
          </Badge>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim border-b border-white/5">
                <th className="pb-3 px-2">{tr.personnel}</th>
                <th className="pb-3 px-2">{tr.sector}</th>
                <th className="pb-3 px-2">{tr.action}</th>
                <th className="pb-3 px-2">{tr.timestamp}</th>
                <th className="pb-3 px-2">{tr.exposureLevel}</th>
                <th className="pb-3 px-2 text-center">{tr.reset}</th>
                <th className="pb-3 px-2 text-right">{tr.status}</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-radsafe-textDim">
                    {tr.awaitingData}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const percent = (log.daily_minutes / log.max_minutes) * 100;
                  const isWarning = percent >= 80;
                  const isDenied = log.action === 'DENIED';
                  const isExit = log.action === 'EXITED';

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white',
                              isWarning
                                ? 'bg-gradient-to-br from-radsafe-warning to-orange-600'
                                : 'bg-radsafe-elevated'
                            )}
                          >
                            {log.personnel_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{log.personnel_name}</p>
                            <p className="font-mono text-[10px] text-radsafe-textDim">
                              {log.personnel_code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-slate-400">{log.department}</td>
                      <td className="py-4 px-2">
                        <Badge variant={isDenied ? 'danger' : isExit ? 'neutral' : 'primary'}>
                          {translateAction(log.action)}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 font-mono text-xs text-radsafe-textDim">
                        {log.time_in}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-radsafe-surface">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                isWarning ? 'bg-radsafe-warning' : 'bg-gradient-to-r from-radsafe-primary to-radsafe-accent'
                              )}
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              'font-mono text-[10px] font-bold shrink-0',
                              isWarning ? 'text-radsafe-warning' : 'text-radsafe-textDim'
                            )}
                          >
                            {log.daily_minutes}/{log.max_minutes}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        {log.username && (
                          <button
                            type="button"
                            title={tr.reset}
                            onClick={async () => {
                              if (!confirm(`${log.personnel_name} — ${tr.resetConfirm}`)) return;
                              await axios.post(
                                `${API_URL}/access/reset-exposure/${log.username}`
                              );
                              toast('Maruziyet kaydı sıfırlandı', 'ok');
                              fetchData();
                            }}
                            className="rounded-lg p-2 text-radsafe-textDim hover:bg-radsafe-warning/10 hover:text-radsafe-warning transition-colors"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                              <path d="M3 3v5h5" />
                            </svg>
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        {isDenied ? (
                          <Badge variant="danger">{tr.denied}</Badge>
                        ) : (
                          <Badge variant={isWarning ? 'warning' : 'success'}>
                            {isWarning ? tr.warning : tr.granted}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
