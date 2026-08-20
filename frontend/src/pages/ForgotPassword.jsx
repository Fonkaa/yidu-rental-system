import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

function ForgotPassword() {
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
        <h1 className="text-2xl font-bold text-purple-600 mb-6 text-center">Forgot Password</h1>

        {message && <p className="text-gray-700 text-sm mb-4">{message}</p>}
        {resetToken && (
          <p className="text-xs text-gray-500 mb-4 break-all">
            (Dev only, no email sending yet) Your reset token: {resetToken}
          </p>
        )}

        <fieldset disabled={submitting} className="disabled:opacity-60">
          <label className="block text-sm text-gray-700 mb-1">Email</label>
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
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          <Link to="/login" className="text-purple-600">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;