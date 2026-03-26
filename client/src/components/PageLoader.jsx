import { ButtonSpinner } from './ui/Button';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-bg" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3">
        <ButtonSpinner size={32} className="text-primary" />
        <span className="text-body text-content-secondary">Loading...</span>
      </div>
    </div>
  );
}
