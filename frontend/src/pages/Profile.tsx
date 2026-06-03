import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setBirthDate(user.birthDate ? user.birthDate.slice(0, 10) : '');
    setPhone(user.phone || '');
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.patch('/users/me', { firstName, lastName, birthDate, phone });
      setMessage('Profile updated');
    } catch {
      setError('Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="surface rounded-[32px] p-8 lg:p-10">
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Profile</div>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Account details</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Keep your delivery contact details up to date so order notifications and shipping information stay accurate.
        </p>

        <div className="mt-8 space-y-4 rounded-[28px] bg-slate-50 p-5 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-3">
            <span>Email</span>
            <span className="font-semibold text-slate-950">{user?.email || '-'}</span>
          </div>
          {user?.role === 'ADMIN' && (
            <div className="flex items-center justify-between gap-3">
              <span>Role</span>
              <span className="font-semibold text-slate-950">{user?.role || '-'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="surface rounded-[32px] p-8">
        <h2 className="text-3xl font-semibold text-slate-950">Update profile</h2>
        <p className="mt-2 text-sm text-slate-500">Edit your public and delivery information.</p>

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

          {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
