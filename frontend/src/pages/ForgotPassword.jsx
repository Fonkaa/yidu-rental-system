import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../services/authService';
import LanguageSwitcher from '../components/LanguageSwitcher';

function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await forgotPassword({ email });
      setMessage(res.data.message);
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-bold text-[#043658] mb-6 text-center">{t('forgotPassword.title')}</h1>

        {message && <p className="text-gray-700 text-sm mb-4">{message}</p>}
        {resetToken && (
          <p className="text-xs text-gray-500 mb-4 break-all">
            (Dev only, no email sending yet) Your reset token: {resetToken}
          </p>
        )}

        <fieldset disabled={submitting} className="disabled:opacity-60">
          <label className="block text-sm text-gray-700 mb-1">{t('forgotPassword.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            required
          />
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#043658] text-white py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          <Link to="/login" className="text-[#043658] font-medium">{t('forgotPassword.backToLogin')}</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;