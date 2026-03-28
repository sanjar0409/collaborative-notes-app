import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/ui/Button';
import { AuthInput } from '../components/ui/Input';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function ForgotPassword() {
  useDocumentTitle('Forgot Password');
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const inputSize = isMobile ? 'mobile' : 'default';
  const btnSize = isMobile ? 'xl' : 'lg';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-serif text-page-heading font-bold text-content-primary mb-2">
              Check your email
            </h2>
            <p className="text-body text-content-secondary mb-6">
              We sent a password reset link to <span className="font-semibold text-content-primary">{email}</span>. It expires in 1 hour.
            </p>
            <p className="text-caption text-content-secondary mb-6">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => { setSent(false); setError(''); }}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                try again
              </button>
            </p>
            <Link to="/login">
              <Button variant="outline" size={btnSize} fullWidth icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className={`font-serif ${isMobile ? 'text-page-heading-mobile font-bold' : 'text-page-heading font-bold'}`}>
                Forgot your password?
              </h2>
              <p className="text-body text-content-secondary mt-1">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <AuthInput
                  label="Email"
                  type="email"
                  placeholder="name@company.com"
                  size={inputSize}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error || undefined}
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
                Send Reset Link
              </Button>
            </form>

            <p className="text-center text-body text-content-secondary mt-6">
              <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
