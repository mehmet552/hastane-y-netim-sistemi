import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Clock } from 'lucide-react';
import { API_URL } from '../../lib/api';
import { tr, translateRole } from '../../i18n/tr';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { cn } from '../../lib/cn';

export type LivePerson = {
  personnel_id: number;
  username: string;
  personnel_name: string;
  department: string;
  role_name: string;
  daily_minutes: number;
  max_minutes: number;
  remaining_minutes: number;
  percent: number;
  is_inside: boolean;
  shift_started_at: string | null;
  current_area: string | null;
};

export const LivePersonnelPanel = () => {
  const [people, setPeople] = useState<LivePerson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const res = await axios.get<LivePerson[]>(`${API_URL}/dashboard/live-personnel`);
      setPeople(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="mb-8 border-radsafe-accent/20" glow="accent">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-radsafe-accent/15 border border-radsafe-accent/25">
            <Users className="h-5 w-5 text-radsafe-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{tr.livePersonnel}</h3>
            <p className="text-xs text-radsafe-textMuted">{tr.livePersonnelDesc}</p>
          </div>
        </div>
        <Badge variant="success" pulse>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {tr.liveFeedBadge}
        </Badge>
      </div>

      {loading ? (
        <p className="text-center py-8 text-radsafe-textDim">{tr.loading}</p>
      ) : people.length === 0 ? (
        <p className="text-center py-8 text-radsafe-textDim">{tr.awaitingData}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {people.map((p) => {
            const isWarning = p.percent >= 80;
            const isDanger = p.remaining_minutes <= 0 && p.daily_minutes >= p.max_minutes;
            return (
              <div
                key={p.personnel_id}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  p.is_inside
                    ? 'border-radsafe-warning/40 bg-radsafe-warning/5 shadow-[0_0_20px_rgba(251,191,36,0.08)]'
                    : 'border-white/[0.06] bg-radsafe-surface/50'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{p.personnel_name}</p>
                    <p className="text-[10px] text-radsafe-textDim truncate">
                      {p.department} · {translateRole(p.role_name)}
                    </p>
                  </div>
                  <Badge variant={p.is_inside ? 'warning' : 'neutral'} pulse={p.is_inside}>
                    {p.is_inside ? tr.activeShift : tr.noActiveShift}
                  </Badge>
                </div>

                {p.is_inside && p.shift_started_at && (
                  <div className="flex items-center gap-2 text-xs text-radsafe-warning mb-3 font-mono">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {tr.shiftStartedAt}: <strong>{p.shift_started_at}</strong>
                      {p.current_area && ` · ${p.current_area}`}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                  <div className="rounded-lg bg-black/20 py-2 px-1">
                    <p className="text-[9px] uppercase tracking-wider text-radsafe-textDim">
                      {tr.usedShort}
                    </p>
                    <p
                      className={cn(
                        'text-lg font-bold tabular-nums',
                        isWarning ? 'text-radsafe-warning' : 'text-white'
                      )}
                    >
                      {p.daily_minutes}
                      <span className="text-xs font-normal text-slate-500"> dk</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/20 py-2 px-1">
                    <p className="text-[9px] uppercase tracking-wider text-radsafe-textDim">
                      {tr.remainingShort}
                    </p>
                    <p
                      className={cn(
                        'text-lg font-bold tabular-nums',
                        isDanger ? 'text-radsafe-danger' : 'text-radsafe-primaryLight'
                      )}
                    >
                      {p.remaining_minutes}
                      <span className="text-xs font-normal text-slate-500"> dk</span>
                    </p>
                  </div>
                </div>

                <ProgressBar value={p.daily_minutes} max={p.max_minutes} />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
