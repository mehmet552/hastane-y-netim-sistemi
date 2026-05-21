import { Bell, Circle } from 'lucide-react';
import { tr } from '../../i18n/tr';
import { Badge } from '../ui/Badge';

export const TopBar = () => (
  <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-radsafe-bg/70 px-6 sm:px-8 backdrop-blur-xl">
    <div className="flex items-center gap-3">
      <Badge variant="accent" className="!normal-case !tracking-normal !text-xs">
        <Circle className="h-2 w-2 fill-current" />
        {tr.sessionActive}
      </Badge>
      <span className="hidden sm:inline font-mono text-xs text-radsafe-textDim">{tr.terminal}</span>
    </div>
    <button
      type="button"
      className="relative rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
      aria-label="Bildirimler"
    >
      <Bell className="h-5 w-5" />
      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-radsafe-danger ring-2 ring-radsafe-bg" />
    </button>
  </header>
);
