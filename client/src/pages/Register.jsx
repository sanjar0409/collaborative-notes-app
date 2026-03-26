import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button, SocialButton, IconButton } from '../components/ui/Button';
import { AuthInput, PasswordStrength } from '../components/ui/Input';
import { AuthDivider } from '../components/ui/AuthDivider';
import { useIsMobile } from '../hooks/useMediaQuery';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Register() {
  useDocumentTitle('Create Account');
  const isMobile = useIsMobile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const { signup, googleLogin } = useAuth();
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

  const handleGoogleSignup = useCallback(async () => {
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
          setError(err.response?.data?.error || 'Google signup failed');
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
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center auth-mesh-bg px-4 pt-safe-top pb-safe-bottom">
      {isMobile && (
        <div className="w-full max-w-[420px] mb-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
        </div>
      )}

      <div className="w-full max-w-[420px] md:bg-white md:rounded-card-xl md:shadow-auth-card md:p-10">
        <div className="text-center mb-8">
          <div className="w-9 h-9 mx-auto mb-3 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">N</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className={isMobile ? 'text-page-heading-mobile font-bold' : 'text-page-heading font-bold'}>
            Create your account
          </h2>
          <p className="text-body text-content-secondary mt-1">
            Start collaborating in real-time with your team
          </p>
        </div>

        <div className="space-y-3">
          <SocialButton
            provider="google"
            size={btnSize}
            onClick={handleGoogleSignup}
            disabled={!googleReady && !!GOOGLE_CLIENT_ID}
          />
        </div>

        <AuthDivider />

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <AuthInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              size={inputSize}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error || undefined}
              required
            />

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

            <div>
              <AuthInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                size={inputSize}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <Button
            variant="gradient"
            size={btnSize}
            fullWidth
            loading={loading}
            htmlType="submit"
            className="mt-6"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-caption text-content-secondary mt-4">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>

        <p className="text-center text-body text-content-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
