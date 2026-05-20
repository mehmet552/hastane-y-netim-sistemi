import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertTriangle, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-[#020202] flex items-center justify-center relative overflow-hidden text-slate-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radsafe-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radsafe-danger/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 p-4">
        <div className="premium-glass p-10 rounded-[2rem] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-radsafe-primary to-radsafe-accent flex items-center justify-center shadow-neon mb-6">
              <Zap className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-widest uppercase mb-2">RADSAFE</h1>
            <p className="text-xs font-bold text-radsafe-textMuted tracking-widest uppercase">Hastane Radyasyon Güvenliği</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Kullanıcı Adı</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-radsafe-primary focus:bg-white/5 transition-all text-white placeholder:text-slate-600"
                  placeholder="Sistem kullanıcı adınız"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-radsafe-primary focus:bg-white/5 transition-all text-white placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-radsafe-danger/10 border border-radsafe-danger/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-radsafe-danger shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-radsafe-danger">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-2 text-radsafe-warning bg-radsafe-warning/10 px-3 py-1.5 rounded-lg border border-radsafe-warning/20">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Yalnızca Yetkili Personel</span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-4">
              Tüm işlemler kayıt altındadır.
              <br />
              Yetkisiz erişim yasaktır.
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-slate-600 text-xs font-mono">Sistem v2.4.1 • Terminaller çevrimiçi</div>
      </div>
    </div>
  );
};

export default LoginPortal;
