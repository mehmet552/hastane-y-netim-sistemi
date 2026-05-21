import { useState } from 'react';
import { Lock, User, AlertTriangle, Radiation, Shield, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPortal = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('Erişim reddedildi: Geçersiz kullanıcı adı veya şifre.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-radsafe-bg">
      <div className="app-grid" aria-hidden />

      {/* Sol panel — marka */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 border-r border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-radsafe-primary/20 via-transparent to-radsafe-accent/10" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-radsafe-primary/10 blur-3xl" />
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-radsafe-accent/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-radsafe-primary to-teal-400 shadow-glow">
              <Radiation className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white tracking-wide">RADSAFE</h1>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-radsafe-primaryLight">
                Hastane Radyasyon Güvenliği
              </p>
            </div>
          </div>

          <h2 className="font-display text-4xl font-bold text-white leading-tight max-w-md mb-6">
            Personel maruziyetini gerçek zamanlı izleyin
          </h2>
          <p className="text-radsafe-textMuted text-lg max-w-sm leading-relaxed">
            RFID ve QR ile oda giriş–çıkışları, günlük limitler ve yasal uyumluluk tek panelde.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { icon: Shield, label: 'Rol tabanlı erişim' },
            { icon: Activity, label: 'Canlı telemetri' },
            { icon: Radiation, label: 'Limit kontrolü' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card !p-4 !rounded-xl">
              <Icon className="h-5 w-5 text-radsafe-primaryLight mb-2" />
              <p className="text-xs font-medium text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ panel — form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 relative">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-radsafe-primary to-teal-400 shadow-glow">
              <Radiation className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">RADSAFE</p>
              <p className="text-[10px] uppercase tracking-widest text-radsafe-textDim">Hastane RMS</p>
            </div>
          </div>

          <div className="glass-card p-8 sm:p-10 rounded-3xl">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-white">Hoş geldiniz</h2>
              <p className="text-sm text-radsafe-textMuted mt-1">Kurumsal hesabınızla giriş yapın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim mb-2">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pl-12"
                    placeholder="ör. admin"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-radsafe-danger/30 bg-radsafe-danger/10 p-3">
                  <AlertTriangle className="h-5 w-5 text-radsafe-danger shrink-0" />
                  <p className="text-sm text-radsafe-danger">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-radsafe-warning bg-radsafe-warning/10 px-3 py-1.5 rounded-lg border border-radsafe-warning/20">
                <Shield className="h-3.5 w-3.5" />
                Yalnızca yetkili personel
              </p>
              <p className="text-xs text-radsafe-textDim mt-3">
                Demo: admin / admin · mchen / pass
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] font-mono text-radsafe-textDim mt-6">
            RADSAFE v2.5 · Terminaller çevrimiçi
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;
