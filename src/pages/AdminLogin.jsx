import { signInWithEmailAndPassword } from 'firebase/auth';
import { Dumbbell, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (auth.currentUser) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (loginError) {
      console.error(loginError);
      setError('E-mail ou senha inválidos. Verifique os dados do administrador.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#05070a,#101923)] px-4 py-12">
      <form className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-7 shadow-lift backdrop-blur" onSubmit={handleSubmit}>
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-volt text-graphite">
          <Dumbbell size={28} />
        </div>
        <h1 className="mt-6 text-2xl font-black text-white">Acesso administrativo</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Entre com o usuário criado no Firebase Authentication.</p>

        <div className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">E-mail</span>
            <input
              className="input-del"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              autoComplete="email"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">Senha</span>
            <input
              className="input-del"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              autoComplete="current-password"
              required
            />
          </label>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-500/12 p-3 text-sm font-semibold text-red-200">{error}</p>}

        <button className="btn-primary mt-6 w-full" type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
          Entrar
        </button>
        <Link className="mt-5 block text-center text-sm font-semibold text-slate-400 hover:text-electric" to="/">
          Voltar para o site
        </Link>
      </form>
    </main>
  );
}
