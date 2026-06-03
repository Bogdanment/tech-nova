import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, firstName, lastName, birthDate, phone);
      navigate('/');
    } catch {
      setError('Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel rounded-[32px] p-8 lg:p-10">
        <div className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Customer account
        </div>
        <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 lg:text-5xl">
          Create an account for faster checkout and order tracking.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 lg:text-base">
          Keep delivery details ready, view purchases, and simplify support communications after your first order.
        </p>

        <div className="mt-8 space-y-4 text-sm text-slate-600">
          <div className="rounded-2xl bg-white/75 p-4 ring-1 ring-slate-200/70">Use real contact data for shipping notifications.</div>
          <div className="rounded-2xl bg-white/75 p-4 ring-1 ring-slate-200/70">Accounts are secured with JWT access and refresh tokens.</div>
          <div className="rounded-2xl bg-white/75 p-4 ring-1 ring-slate-200/70">Profile edits sync back to the backend immediately.</div>
        </div>
      </div>

      <div className="surface rounded-[32px] p-8">
        <h2 className="text-3xl font-semibold text-slate-950">Create an account</h2>
        <p className="mt-2 text-sm text-slate-500">Register a customer profile for the storefront.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </div>
          </div>

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
            <label className="text-sm font-semibold text-slate-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Date of birth</label>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
            <div>
              <label className="text-sm font-semibold text-slate-700">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </div>
          </div>

          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
