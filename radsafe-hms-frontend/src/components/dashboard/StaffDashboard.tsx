import { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Square, Activity, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../lib/api';
import { tr, translateAction } from '../../i18n/tr';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { ProgressBar } from '../ui/ProgressBar';
import { AlertBanner } from '../ui/AlertBanner';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

type Log = {
  id: number;
  username: string;
  area: string;
  action: string;
  time_in: string;
};

type MyExposure = {
  daily_minutes: number;
  max_minutes: number;
  remaining_minutes: number;
  is_inside: boolean;
  shift_started_at: string | null;
  current_area: string | null;
};

export const StaffDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<Log[]>([]);
  const [areas, setAreas] = useState<{ id: number; name: string }[]>([]);
  const [selectedArea, setSelectedArea] = useState(1);
  const [myExposure, setMyExposure] = useState<MyExposure>({
    daily_minutes: 0,
    max_minutes: 240,
    remaining_minutes: 240,
    is_inside: false,
    shift_started_at: null,
    current_area: null,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/dashboard/areas`).then((res) => {
      setAreas(res.data);
      if (res.data.length) setSelectedArea(res.data[0].id);
    }).catch(() => {});
  }, []);

  const refreshExposure = async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard/my-exposure`);
      setMyExposure(res.data);
    } catch { /* ignore */ }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard/live-logs`);
      setLogs(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    refreshExposure();
    fetchLogs();
    const interval = setInterval(() => {
      refreshExposure();
      fetchLogs();
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const myUsed = Math.round(myExposure.daily_minutes * 10) / 10;
  const myMax = myExposure.max_minutes;
  const myRemaining =
    myExposure.remaining_minutes ??
    Math.round(Math.max(myMax - myUsed, 0) * 10) / 10;
  const myPercent = Math.min((myUsed / myMax) * 100, 100);
  const isWarning = myPercent >= 80;
  const isAtLimit = myUsed >= myMax;

  const handleShiftStart = async () => {
    setBusy(true);
    try {
      const res = await axios.post(`${API_URL}/access/shift-start`, {
        area_id: selectedArea,
      });
      if (res.data.status === 'GRANTED') {
        toast(
          `${translateAction(res.data.message)} — ${tr.remaining}: ${Math.floor(res.data.remaining_minutes ?? 0)} dk`,
          'ok'
        );
      } else {
        toast(res.data.message || tr.accessDeniedAlert, 'err');
      }
      await refreshExposure();
      await fetchLogs();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast(typeof detail === 'string' ? detail : tr.accessDeniedAlert, 'err');
    } finally {
      setBusy(false);
    }
  };

  const handleShiftEnd = async () => {
    setBusy(true);
    try {
      const res = await axios.post(`${API_URL}/access/shift-end`);
      toast(
        `${translateAction(res.data.message)} — ${tr.remaining}: ${Math.floor(res.data.remaining_minutes ?? 0)} dk`,
        'ok'
      );
      await refreshExposure();
      await fetchLogs();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast(typeof detail === 'string' ? detail : tr.scanFailed, 'err');
    } finally {
      setBusy(false);
    }
  };

  const myLogs = logs.filter((l) => l.username === user?.username);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <PageHeader
        title={tr.myExposureTitle}
        description={tr.myExposureDesc}
        action={
          <Badge variant={myExposure.is_inside ? 'warning' : 'success'} pulse={myExposure.is_inside}>
            {myExposure.is_inside ? tr.shiftRunning : tr.outsideNow}
          </Badge>
        }
      />

      {isAtLimit && (
        <AlertBanner title={tr.limitExceeded} description={tr.limitExceededDesc} variant="danger" />
      )}
      {isWarning && !isAtLimit && (
        <AlertBanner
          title={`${tr.approachingLimit} — ${myRemaining} ${tr.remainingMin}`}
          description={tr.planExit}
          variant="warning"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title={tr.usedToday}
          value={myUsed}
          suffix="dk"
          icon={Activity}
          variant={isWarning ? 'warning' : 'default'}
        />
        <StatCard
          title={tr.remaining}
          value={myRemaining}
          suffix="dk"
          icon={Activity}
          variant={myRemaining === 0 ? 'danger' : 'default'}
        />
        <StatCard title={tr.dailyLimit} value={myMax} suffix="dk" icon={Activity} />
      </div>

      <Card className="mb-6 border-radsafe-primary/25" glow="primary">
        <p className="text-lg font-semibold text-white mb-1">{tr.cardSimTitle}</p>
        <p className="text-sm text-radsafe-textMuted mb-6">{tr.cardSimDesc}</p>

        {myExposure.is_inside && myExposure.shift_started_at && (
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-radsafe-warning/10 border border-radsafe-warning/25">
            <div className="flex items-center gap-2 text-sm text-radsafe-warning">
              <Clock className="h-4 w-4" />
              <span>
                {tr.shiftStartedAt}: <strong className="font-mono">{myExposure.shift_started_at}</strong>
              </span>
            </div>
            {myExposure.current_area && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4" />
                {myExposure.current_area}
              </div>
            )}
            <p className="text-xs text-slate-500 w-full">{tr.shiftRunning} — süre otomatik artıyor</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim mb-2">
              {tr.area}
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(Number(e.target.value))}
              disabled={myExposure.is_inside || busy}
              className="select-field w-full"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id} className="bg-radsafe-panel">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {!myExposure.is_inside ? (
            <button
              type="button"
              onClick={handleShiftStart}
              disabled={busy}
              className={cn(
                'btn-primary flex-1 sm:flex-none py-4 px-8 text-base',
                'bg-gradient-to-r from-emerald-600 to-radsafe-primary shadow-glow'
              )}
            >
              <Play className="h-6 w-6 fill-current" />
              {busy ? '...' : tr.shiftStart}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleShiftEnd}
              disabled={busy}
              className="flex-1 sm:flex-none py-4 px-8 text-base rounded-xl font-semibold text-white bg-gradient-to-r from-rose-600 to-radsafe-danger border border-radsafe-danger/30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Square className="h-5 w-5 fill-current" />
              {busy ? '...' : tr.shiftEnd}
            </button>
          )}
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">{tr.exposureBar}</h3>
          <Badge variant={isWarning ? 'warning' : 'success'}>
            {isWarning ? tr.approachingLimitBadge : tr.safeRange}
          </Badge>
        </div>
        <ProgressBar value={myUsed} max={myMax} />
        <p className="text-xs text-radsafe-textDim mt-2 text-right">{tr.legalLimit}</p>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white">{tr.myAccessLog}</h3>
          <Badge variant="success" pulse>
            {tr.liveFeedBadge}
          </Badge>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim border-b border-white/5">
                <th className="pb-3 px-2">{tr.area}</th>
                <th className="pb-3 px-2">{tr.action}</th>
                <th className="pb-3 px-2">{tr.time}</th>
                <th className="pb-3 px-2 text-right">{tr.status}</th>
              </tr>
            </thead>
            <tbody>
              {myLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-radsafe-textDim">
                    {tr.noLogsToday}
                  </td>
                </tr>
              ) : (
                myLogs.map((log) => {
                  const isDenied = log.action === 'DENIED';
                  const isExit = log.action === 'EXITED';
                  return (
                    <tr key={log.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="py-3.5 px-2 text-slate-300">{log.area}</td>
                      <td className="py-3.5 px-2">
                        <Badge variant={isDenied ? 'danger' : isExit ? 'neutral' : 'primary'}>
                          {translateAction(log.action)}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-2 font-mono text-xs text-radsafe-textDim">{log.time_in}</td>
                      <td className="py-3.5 px-2 text-right">
                        <Badge variant={isDenied ? 'danger' : 'success'}>
                          {isDenied ? tr.denied : tr.granted}
                        </Badge>
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
