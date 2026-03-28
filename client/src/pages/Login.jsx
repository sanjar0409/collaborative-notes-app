import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button, SocialButton, IconButton } from '../components/ui/Button';
import { AuthInput } from '../components/ui/Input';
import { AuthDivider } from '../components/ui/AuthDivider';
import { useIsMobile } from '../hooks/useMediaQuery';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  useDocumentTitle('Sign In');
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const inputSize = isMobile ? 'mobile' : 'default';
  const btnSize = isMobile ? 'xl' : 'lg';

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    if (!googleReady || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        setError('');
        setLoading(true);
        try {
          await googleLogin(response.credential);
          navigate('/');
        } catch (err) {
          setError(err.response?.data?.error || 'Google login failed');
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.prompt();
  }, [googleReady, googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
          <h1 className="text-app-title font-serif text-content-primary">
            Real-time Collaborative Notes App
          </h1>
        </div>

        <div className="text-center mb-6">
          <h2 className={`font-serif ${isMobile ? 'text-page-heading-mobile font-bold' : 'text-page-heading font-bold'}`}>
            Welcome back
          </h2>
          <p className="text-body text-content-secondary mt-1">
            Sign in to continue collaborating
          </p>
        </div>

        <div className="space-y-3">
          <SocialButton
            provider="google"
            size={btnSize}
            onClick={handleGoogleLogin}
            disabled={!googleReady && !!GOOGLE_CLIENT_ID}
          />
        </div>

        <AuthDivider />

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

            <AuthInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              size={inputSize}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error ? ' ' : undefined}
              required
              rightLabel={
                <Link to="/forgot-password" tabIndex={-1}>
                  <Button variant="ghost" size="xs" className="text-primary text-body">
                    Forgot?
                  </Button>
                </Link>
              }
              rightElement={
                <IconButton
                  icon={showPassword ? <EyeOff /> : <Eye />}
                  size="xs"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((p) => !p)}
                />
              }
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
            Sign In
          </Button>
        </form>

        <p className="text-center text-body text-content-secondary mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>

      <p className="mt-8 text-caption text-content-secondary">
        &copy; 2026 CollabNotes &middot; Privacy &middot; Terms &middot; Help
      </p>
    </div>
  );
}
