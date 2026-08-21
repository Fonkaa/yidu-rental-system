import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login({ email, password });
      loginUser(res.data.token, res.data.user);
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong logging in');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-bold text-[#043658] mb-6 text-center">{t('login.title')}</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <fieldset disabled={submitting} className="disabled:opacity-60">
          <label className="block text-sm text-gray-700 mb-1">{t('login.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            required
          />

          <label className="block text-sm text-gray-700 mb-1">{t('login.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            required
          />
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#043658] text-white py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('login.submitting') : t('login.submit')}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          {t('login.noAccount')} <Link to="/register" className="text-[#043658] font-medium">{t('login.register')}</Link>
        </p>
        <p className="text-sm text-gray-600 mt-2 text-center">
          <Link to="/forgot-password" className="text-[#043658] font-medium">{t('login.forgotPassword')}</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;