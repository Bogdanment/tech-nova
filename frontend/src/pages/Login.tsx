import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-[32px] p-8 lg:p-10">
        <div className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Admin access
        </div>
        <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 lg:text-5xl">
          Sign in to manage products, orders, and customer data.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
          Access the control panel used for inventory operations, order status updates, and Telegram notifications.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['JWT auth', 'Protected sessions with refresh token support.'],
            ['Role guard', 'Admin-only access to operational screens.'],
            ['Live catalog', 'Update stock and visibility in one place.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl bg-white/75 p-4 ring-1 ring-slate-200/70">
              <div className="text-sm font-semibold text-slate-950">{title}</div>
              <div className="mt-2 text-xs leading-6 text-slate-500">{description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface rounded-[32px] p-8">
        <h2 className="text-3xl font-semibold text-slate-950">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500">Log in to the Tech Nova admin interface.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
            />
          </div>

          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
