import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import AuthLayout from './AuthLayout';
import PasswordField from '../components/PasswordField';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back.">
      <form onSubmit={submit} className="space-y-4" noValidate autoComplete="off">
        <Field label="Email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p role="alert" className="text-sm font-semibold text-brake">{error}</p>}
        <button disabled={busy} className="w-full cursor-pointer rounded-md bg-pine py-2.5 font-bold text-white hover:bg-pine-dark disabled:opacity-60">
          {busy ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="mt-5 text-sm">
        New here? <Link to="/register" className="font-bold text-pine underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
