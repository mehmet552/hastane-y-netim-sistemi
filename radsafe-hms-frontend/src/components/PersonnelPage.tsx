import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserPlus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/api';
import { tr, translateRole } from '../i18n/tr';
import { PageHeader } from './ui/PageHeader';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

type Employee = {
  id: number;
  username: string;
  rfid_tag?: string;
  role_id: number;
  role_name: string;
  first_name: string;
  last_name: string;
  department_name: string;
  max_daily_radiation_limit_minutes: number;
  is_active: boolean;
};

type Meta = {
  roles: { id: number; name: string }[];
  departments: { id: number; name: string }[];
};

const emptyForm = {
  username: '',
  password: '',
  first_name: '',
  last_name: '',
  rfid_tag: '',
  role_id: 2,
  department_id: 1,
  max_daily_radiation_limit_minutes: 240,
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim mb-2">
      {label}
    </label>
    {children}
  </div>
);

const PersonnelPage = () => {
  const { user } = useAuth();
  const hasAccess = user?.role?.permissions?.some(
    (p: { name: string }) => p.name === 'manage_users'
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<Meta>({ roles: [], departments: [] });
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const [listRes, metaRes] = await Promise.all([
        axios.get(`${API_URL}/personnel`),
        axios.get(`${API_URL}/personnel/meta`),
      ]);
      setEmployees(listRes.data);
      setMeta(metaRes.data);
      if (metaRes.data.roles.length) {
        const doctor = metaRes.data.roles.find((r: { name: string }) => r.name === 'Doctor');
        if (doctor) setForm((f) => ({ ...f, role_id: doctor.id }));
      }
      if (metaRes.data.departments.length) {
        setForm((f) => ({ ...f, department_id: metaRes.data.departments[0].id }));
      }
    } catch {
      setMessage({ type: 'err', text: tr.createError });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) load();
  }, [hasAccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await axios.post(`${API_URL}/personnel`, form);
      setMessage({ type: 'ok', text: tr.createSuccess });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail;
      setMessage({ type: 'err', text: typeof detail === 'string' ? detail : tr.createError });
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center border-radsafe-danger/25" glow="danger">
          <AlertTriangle className="w-12 h-12 text-radsafe-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{tr.forbidden403}</h2>
          <p className="text-sm text-radsafe-textMuted">{tr.forbidden403Desc}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <PageHeader
        title={tr.staffTitle}
        description={tr.staffDesc}
        action={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            <UserPlus className="h-5 w-5" />
            {tr.addEmployee}
          </button>
        }
      />

      {message && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === 'ok'
              ? 'border-radsafe-success/30 bg-radsafe-success/10 text-radsafe-success'
              : 'border-radsafe-danger/30 bg-radsafe-danger/10 text-radsafe-danger'
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <Card className="mb-8 border-radsafe-primary/20" glow="primary">
          <h3 className="font-semibold text-white mb-6">{tr.addEmployee}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label={tr.username}>
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="input-field"
                />
              </Field>
              <Field label={tr.password}>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                />
              </Field>
              <Field label={tr.rfidTag}>
                <input
                  required
                  placeholder="RFID-003"
                  value={form.rfid_tag}
                  onChange={(e) => setForm({ ...form, rfid_tag: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
              <Field label={tr.firstName}>
                <input
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="input-field"
                />
              </Field>
              <Field label={tr.lastName}>
                <input
                  required
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="input-field"
                />
              </Field>
              <Field label={tr.role}>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
                  className="select-field"
                >
                  {meta.roles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-radsafe-panel">
                      {translateRole(r.name)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={tr.department}>
                <select
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })}
                  className="select-field"
                >
                  {meta.departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-radsafe-panel">
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={tr.dailyLimitMin}>
                <input
                  required
                  type="number"
                  min={1}
                  max={480}
                  value={form.max_daily_radiation_limit_minutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      max_daily_radiation_limit_minutes: Number(e.target.value),
                    })
                  }
                  className="input-field"
                />
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn-primary">
                {tr.save}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                {tr.cancel}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-radsafe-primaryLight" />
          <h3 className="text-lg font-semibold text-white">{tr.employeeList}</h3>
          <Badge variant="accent">{employees.length} kayıt</Badge>
        </div>
        {loading ? (
          <p className="text-center py-16 text-radsafe-textDim">{tr.loading}</p>
        ) : employees.length === 0 ? (
          <p className="text-center py-16 text-radsafe-textDim">
            Henüz çalışan yok. Yukarıdan ekleyin.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-radsafe-textDim border-b border-white/5">
                  <th className="pb-3 px-2">Ad Soyad</th>
                  <th className="pb-3 px-2">Kullanıcı</th>
                  <th className="pb-3 px-2">RFID</th>
                  <th className="pb-3 px-2">Rol</th>
                  <th className="pb-3 px-2">Departman</th>
                  <th className="pb-3 px-2 text-right">Limit</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-radsafe-elevated text-sm font-bold text-white">
                          {emp.first_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">
                          {emp.first_name} {emp.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-slate-400">{emp.username}</td>
                    <td className="py-4 px-2 font-mono text-xs text-radsafe-accent">
                      {emp.rfid_tag || '—'}
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant="primary">{translateRole(emp.role_name)}</Badge>
                    </td>
                    <td className="py-4 px-2 text-slate-400">{emp.department_name}</td>
                    <td className="py-4 px-2 text-right font-mono text-white">
                      {emp.max_daily_radiation_limit_minutes} dk
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PersonnelPage;
