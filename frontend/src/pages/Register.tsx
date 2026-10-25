import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import AuthLayout from './AuthLayout';
import PasswordField from '../components/PasswordField';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      return setError('Password needs 8+ characters with at least one letter and one number.');
    }
    setBusy(true);
    setError('');
    try {
      await register(form.name.trim(), form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="It takes under a minute.">
      <form onSubmit={submit} className="space-y-4" noValidate autoComplete="off">
        <Field label="Name" autoComplete="off" value={form.name} onChange={set('name')} />
        <Field label="Email" type="email" autoComplete="off" value={form.email} onChange={set('email')} />
        <PasswordField label="Password" value={form.password} onChange={set('password')} />
        {error && <p role="alert" className="text-sm font-semibold text-brake">{error}</p>}
        <button disabled={busy} className="w-full cursor-pointer rounded-md bg-pine py-2.5 font-bold text-white hover:bg-pine-dark disabled:opacity-60">
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-sm">
        Already registered? <Link to="/login" className="font-bold text-pine underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
