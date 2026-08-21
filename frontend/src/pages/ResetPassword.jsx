import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../services/authService';
import LanguageSwitcher from '../components/LanguageSwitcher';

function ResetPassword() {
  const { t } = useTranslation();
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await resetPassword({ resetToken, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-bold text-[#043658] mb-6 text-center">{t('resetPassword.title')}</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        <fieldset disabled={submitting} className="disabled:opacity-60">
          <label className="block text-sm text-gray-700 mb-1">{t('resetPassword.resetToken')}</label>
          <input
            type="text"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            required
          />

          <label className="block text-sm text-gray-700 mb-1">{t('resetPassword.newPassword')}</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            required
          />
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#043658] text-white py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('resetPassword.submitting') : t('resetPassword.submit')}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          <Link to="/login" className="text-[#043658] font-medium">{t('resetPassword.backToLogin')}</Link>
        </p>
      </form>
    </div>
  );
}

export default ResetPassword;