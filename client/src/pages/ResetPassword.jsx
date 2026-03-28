import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button, IconButton } from '../components/ui/Button';
import { AuthInput, PasswordStrength } from '../components/ui/Input';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function ResetPassword() {
  useDocumentTitle('Reset Password');
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputSize = isMobile ? 'mobile' : 'default';
  const btnSize = isMobile ? 'xl' : 'lg';

  if (!token || !email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center auth-mesh-bg auth-dot-bg px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="w-full max-w-[420px] md:bg-surface-main md:rounded-card-xl md:shadow-auth-card md:p-10 text-center"
        >
          <h2 className="font-serif text-page-heading font-bold text-content-primary mb-2">
            Invalid reset link
          </h2>
          <p className="text-body text-content-secondary mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password">
            <Button variant="gradient" size={btnSize} fullWidth>
              Request a new link
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center auth-mesh-bg auth-dot-bg px-4 pt-safe-top pb-safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-[420px] md:bg-surface-main md:rounded-card-xl md:shadow-auth-card md:p-10"
      >
        <div className="text-center mb-8">
          <div className="w-9 h-9 mx-auto mb-3 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-serif font-bold">N</span>
          </div>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-serif text-page-heading font-bold text-content-primary mb-2">
              Password reset!
            </h2>
            <p className="text-body text-content-secondary mb-6">
              Your password has been updated. Redirecting to sign in...
            </p>
            <Link to="/login">
              <Button variant="gradient" size={btnSize} fullWidth>
                Sign In Now
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className={`font-serif ${isMobile ? 'text-page-heading-mobile font-bold' : 'text-page-heading font-bold'}`}>
                Set new password
              </h2>
              <p className="text-body text-content-secondary mt-1">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <AuthInput
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    size={inputSize}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={error || undefined}
                    required
                    rightElement={
                      <IconButton
                        icon={showPassword ? <EyeOff /> : <Eye />}
                        size="xs"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((p) => !p)}
                      />
                    }
                  />
                  <PasswordStrength password={password} />
                </div>

                <AuthInput
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  size={inputSize}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={password && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                  required
                />
              </div>

              <Button
                variant="gradient"
                size={btnSize}
                fullWidth
                loading={loading}
                htmlType="submit"
                className="mt-6"
              >
                Reset Password
              </Button>
            </form>

            <p className="text-center text-body text-content-secondary mt-6">
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
