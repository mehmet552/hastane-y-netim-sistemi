import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Users,
  ScanLine,
  Settings,
  Shield,
  LogOut,
  Radiation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tr, translateRole } from '../../i18n/tr';
import { cn } from '../../lib/cn';

const NavLink = ({
  to,
  icon: Icon,
  label,
  external,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
}) => {
  const location = useLocation();
  const active = !external && location.pathname === to;

  return (
    <Link
      to={to}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-radsafe-primary/15 text-white border border-radsafe-primary/25 shadow-glow'
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      )}
    >
      <Icon className={cn('h-5 w-5', active ? 'text-radsafe-primaryLight' : '')} />
      {label}
    </Link>
  );
};

export const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const permissions = user.role.permissions.map((p: { name: string }) => p.name);
  const canViewLogs = permissions.includes('view_logs');
  const canManageSettings = permissions.includes('manage_settings');

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-white/[0.06] bg-radsafe-surface/90 backdrop-blur-2xl">
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-radsafe-primary to-teal-400 shadow-glow">
            <Radiation className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white tracking-wide">{tr.brand}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-radsafe-primaryLight">
              {translateRole(user.role.name)}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim">
            {tr.mainMenu}
          </p>
          <div className="space-y-1">
            {canViewLogs ? (
              <>
                <NavLink to="/" icon={Activity} label={tr.overview} />
                <NavLink to="/personnel" icon={Users} label={tr.staffDir} />
              </>
            ) : (
              <NavLink to="/" icon={Activity} label={tr.myExposure} />
            )}
          </div>
        </div>

        {(canManageSettings || canViewLogs) && (
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim">
              {tr.system}
            </p>
            <div className="space-y-1">
              {canViewLogs && (
                <NavLink to="/kiosk" icon={ScanLine} label={tr.kiosk} external />
              )}
              {canViewLogs && (
                <span className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-600 cursor-not-allowed">
                  <Shield className="h-5 w-5" />
                  {tr.accessControl}
                  <span className="ml-auto text-[9px] font-bold uppercase text-slate-600">Yakında</span>
                </span>
              )}
              {canManageSettings && (
                <span className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-600 cursor-not-allowed">
                  <Settings className="h-5 w-5" />
                  {tr.config}
                  <span className="ml-auto text-[9px] font-bold uppercase text-slate-600">Yakında</span>
                </span>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="glass-card p-3 mb-3 !rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-radsafe-primary to-radsafe-accent p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-radsafe-panel text-sm font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-radsafe-panel bg-radsafe-success" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.username}</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-radsafe-textDim">
                {translateRole(user.role.name)}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="btn-ghost w-full justify-center text-radsafe-danger hover:bg-radsafe-danger/10 hover:text-radsafe-danger"
        >
          <LogOut className="h-4 w-4" />
          {tr.signOut}
        </button>
      </div>
    </aside>
  );
};
