import { useState, useEffect } from 'react';
import { loginCitizen, registerCitizen } from '../services/api';
import { setCitizenAuth } from '../utils/auth';

export default function CitizenLogin({ 
  onLoginSuccess, 
  onBack 
}: { 
  onLoginSuccess: () => void, 
  onBack: () => void 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirectedFromReport, setIsRedirectedFromReport] = useState(false);

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('citizen_login_redirect');
    if (redirectPath && redirectPath.startsWith('/report')) {
      setIsRedirectedFromReport(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    
    if (isRegistering) {
      if (!fullName.trim()) {
        setError('Full Name is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsAuthenticating(true);
    setError(null);

    if (isRegistering) {
      const result = await registerCitizen({ name: fullName, email, password });
      setIsAuthenticating(false);
      if (result.success && result.token && result.user) {
        setCitizenAuth(result.user.id, result.token);
        onLoginSuccess();
      } else {
        setError(result.error || 'Registration failed.');
      }
    } else {
      const result = await loginCitizen({ email, password });
      setIsAuthenticating(false);
      if (result.success && result.token && result.user) {
        setCitizenAuth(result.user.id, result.token);
        onLoginSuccess();
      } else {
        setError(result.error || 'Invalid credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#18261C] font-sans selection:bg-[#18261C] selection:text-[#F4EFE6] flex flex-col">
      {/* Header */}
      <header className="w-full px-8 md:px-16 py-8 border-b border-[#18261C]/10 flex items-center justify-between bg-[#F4EFE6] z-10 sticky top-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onBack()}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#18261C] opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
            <img src="/images/vanlife-logo.png" alt="वनLIFE Logo" className="w-full h-full object-cover scale-[1.15]" />
          </div>
          <span className="font-serif font-medium tracking-[0.15em] text-xl text-[#18261C] opacity-90 group-hover:opacity-100 transition-opacity">वनLIFE</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-12 md:py-24 flex flex-col justify-center">
        
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight mb-4 text-[#18261C]">
            {isRegistering ? 'CREATE ACCOUNT' : 'WELCOME'}
          </h1>
          {isRedirectedFromReport ? (
            <p className="text-lg text-[#D35400] font-medium max-w-md bg-[#D35400]/10 p-3 rounded-sm border border-[#D35400]/20">
              {isRegistering 
                ? 'Register to submit and track your wildlife report.' 
                : 'Sign in to submit and track your wildlife report.'}
            </p>
          ) : (
            <p className="text-lg text-[#18261C]/70 font-light max-w-md">
              {isRegistering 
                ? 'Join the conservation effort by registering for an account.' 
                : 'Sign in to manage your reports and join the conservation effort.'}
            </p>
          )}
        </div>

        <div className="bg-white border border-[#18261C]/10 p-8 md:p-12 rounded-sm shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="fullName" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/60">FULL NAME</label>
                <input 
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full bg-[#F4EFE6] border border-[#18261C]/20 text-[#18261C] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#18261C]/30"
                  placeholder="Your Full Name"
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/60">EMAIL ADDRESS</label>
              <input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isAuthenticating}
                className="w-full bg-[#F4EFE6] border border-[#18261C]/20 text-[#18261C] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#18261C]/30"
                placeholder="citizen@example.com"
                autoComplete="email"
              />
            </div>

            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/60">PHONE NUMBER (OPTIONAL)</label>
                <input 
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full bg-[#F4EFE6] border border-[#18261C]/20 text-[#18261C] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#18261C]/30"
                  placeholder="+91"
                />
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/60">PASSWORD</label>
              <input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isAuthenticating}
                className="w-full bg-[#F4EFE6] border border-[#18261C]/20 text-[#18261C] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#18261C]/30"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/60">CONFIRM PASSWORD</label>
                <input 
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full bg-[#F4EFE6] border border-[#18261C]/20 text-[#18261C] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#18261C]/30"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-2 p-4 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-sm flex items-start gap-3">
                <svg className="w-5 h-5 text-[#E74C3C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[#E74C3C] text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button 
              type="submit"
              disabled={isAuthenticating || !email || !password || (isRegistering && (!fullName || !confirmPassword))}
              className={`w-full mt-4 py-5 text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE6] focus-visible:ring-[#18261C]
                ${(isAuthenticating || !email || !password || (isRegistering && (!fullName || !confirmPassword)))
                  ? 'bg-[#18261C]/10 text-[#18261C]/40 cursor-not-allowed' 
                  : 'bg-[#18261C] text-[#F4EFE6] hover:bg-[#2A3F2E] hover:-translate-y-[2px] hover:shadow-lg'
                }`}
            >
              {isAuthenticating ? (isRegistering ? 'REGISTERING...' : 'SIGNING IN...') : (isRegistering ? 'CREATE ACCOUNT \u2192' : 'SIGN IN \u2192')}
            </button>

          </form>

          {/* Registration Toggle */}
          <div className="mt-8 pt-6 border-t border-[#18261C]/10 text-center">
            <p className="text-sm text-[#18261C]/70">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                disabled={isAuthenticating}
                className="font-bold text-[#B5966B] hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:underline uppercase tracking-wide disabled:opacity-50"
              >
                {isRegistering ? 'SIGN IN \u2192' : 'REGISTER \u2192'}
              </button>
            </p>
          </div>

        </div>

        {/* Footer/Navigation */}
        <div className="mt-12 flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={onBack}
            className="text-[10px] tracking-[0.25em] font-bold uppercase text-[#18261C]/40 hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            &larr; BACK TO HOME
          </button>
        </div>

      </main>

      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .hover\\:-translate-y-\\[2px\\]:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
