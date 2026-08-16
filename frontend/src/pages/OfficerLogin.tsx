import { useState } from 'react';
import { loginOfficer, registerOfficer } from '../services/api';
import { setOfficerAuth } from '../utils/auth';

export default function OfficerLogin({ 
  onLoginSuccess, 
  onBack 
}: { 
  onLoginSuccess: () => void, 
  onBack: () => void 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  
  // Registration fields
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [fullName, setFullName] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid official email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    if (isRegistering) {
      if (!fullName.trim() || !officerId.trim() || !designation.trim() || !department.trim() || !jurisdiction.trim()) {
        setError('All required official identity fields must be provided.');
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
      const result = await registerOfficer({ name: fullName, email, password });
      setIsAuthenticating(false);
      if (result.success) {
        setIsPendingVerification(true);
      } else {
        setError(result.error || 'Registration failed.');
      }
    } else {
      const result = await loginOfficer({ email, password });
      setIsAuthenticating(false);
      if (result.success && result.token && result.user) {
        setOfficerAuth(result.user.id, result.token, result.user.name);
        onLoginSuccess();
      } else {
        setError(result.error || 'Invalid officer credentials.');
      }
    }
  };

  if (isPendingVerification) {
    return (
      <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-full flex items-center justify-center mb-8 animate-fade-in-up">
          <svg className="w-10 h-10 text-[#E74C3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>REGISTRATION SUBMITTED</h1>
        <p className="text-lg text-[#F4EFE6]/70 mb-8 max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Your officer access request is pending verification by the command center.
        </p>
        
        <div className="bg-[#0A110C] border border-[#F4EFE6]/10 px-8 py-6 rounded-sm mb-12 animate-fade-in-up text-left inline-flex flex-col gap-4 min-w-[300px]" style={{ animationDelay: '0.3s' }}>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">OFFICER ID</span>
            <span className="block text-sm font-medium text-[#F4EFE6]">{officerId}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">OFFICIAL EMAIL</span>
            <span className="block text-sm font-medium text-[#F4EFE6]">{email}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">DEPARTMENT</span>
            <span className="block text-sm font-medium text-[#F4EFE6]">{department}</span>
          </div>
          <div className="pt-2 border-t border-[#F4EFE6]/10">
            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">STATUS</span>
            <span className="inline-block text-xs uppercase tracking-widest font-bold text-[#B5966B] bg-[#B5966B]/10 px-3 py-1 rounded-sm mt-1">PENDING VERIFICATION</span>
          </div>
        </div>

        <button 
          onClick={() => {
            setIsPendingVerification(false);
            setIsRegistering(false);
            setPassword('');
            setConfirmPassword('');
            setError(null);
          }}
          className="px-12 py-5 bg-[#F4EFE6] text-[#08150C] text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm hover:bg-[#EAE0CC] hover:-translate-y-[2px] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F4EFE6] focus-visible:ring-offset-[#08150C] animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          BACK TO OFFICER SIGN IN &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] font-sans selection:bg-[#B5966B] selection:text-[#08150C] flex flex-col">
      {/* Header */}
      <header className="w-full px-8 md:px-16 py-8 border-b border-[#F4EFE6]/10 flex items-center justify-between bg-[#0A110C] z-10 sticky top-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onBack()}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#0A110C] opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
            <img src="/images/vanlife-logo.png" alt="वनLIFE Logo" className="w-full h-full object-cover scale-[1.15]" />
          </div>
          <span className="font-serif font-medium tracking-[0.15em] text-xl text-[#F4EFE6] opacity-80 group-hover:opacity-100 transition-opacity">वनLIFE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-sm">
            <div className="w-1.5 h-1.5 bg-[#E74C3C] rounded-full animate-pulse"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#E74C3C]">RESTRICTED SYSTEM</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-12 md:py-24 flex flex-col justify-center">
        
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight mb-4 text-[#F4EFE6]">
            {isRegistering ? 'OFFICER REGISTRATION' : 'OFFICER ACCESS'}
          </h1>
          <p className="text-lg text-[#F4EFE6]/70 font-light max-w-md">
            {isRegistering 
              ? 'Request access to the protected intelligence network.' 
              : 'Secure access to protected wildlife intelligence and response operations.'}
          </p>
        </div>

        <div className="bg-[#0A110C] border border-[#F4EFE6]/10 p-8 md:p-12 rounded-sm shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {isRegistering && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="fullName" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">FULL NAME</label>
                  <input 
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                    placeholder="Rank and Name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="officerId" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">OFFICER / EMPLOYEE ID</label>
                  <input 
                    id="officerId"
                    type="text"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                    placeholder="ID Number"
                  />
                </div>
              </div>
            )}
            
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">OFFICIAL EMAIL</label>
              <input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isAuthenticating}
                className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                placeholder="officer@vanlife.demo"
                autoComplete="email"
              />
            </div>

            {isRegistering && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="designation" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">DESIGNATION / RANK</label>
                  <input 
                    id="designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                    placeholder="e.g. Forest Ranger"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="department" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">DEPARTMENT / ORG</label>
                  <input 
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                    placeholder="e.g. Wildlife Protection"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="jurisdiction" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">JURISDICTION / REGION</label>
                  <input 
                    id="jurisdiction"
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                    placeholder="e.g. Western Ghats"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">OFFICIAL PHONE (OPTIONAL)</label>
                  <input 
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                    placeholder="+91"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">PASSWORD</label>
              <input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isAuthenticating}
                className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/60">CONFIRM PASSWORD</label>
                <input 
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isAuthenticating}
                  className="w-full bg-[#08150C] border border-[#F4EFE6]/20 text-[#F4EFE6] px-4 py-4 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B] transition-all rounded-sm disabled:opacity-50 placeholder:text-[#F4EFE6]/20"
                  placeholder="••••••••"
                />
              </div>
            )}

            {!isRegistering && (
              <div className="flex items-center gap-3 mt-2">
                <input 
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={isAuthenticating}
                  className="w-4 h-4 bg-[#08150C] border border-[#F4EFE6]/20 rounded-sm accent-[#B5966B] cursor-pointer focus:ring-[#B5966B] focus:ring-offset-1 focus:ring-offset-[#0A110C]"
                />
                <label htmlFor="remember" className="text-sm text-[#F4EFE6]/70 cursor-pointer select-none font-light">
                  Remember this device
                </label>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-2 p-4 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-sm flex items-start gap-3">
                <svg className="w-5 h-5 text-[#E74C3C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[#E74C3C] text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button 
              type="submit"
              disabled={isAuthenticating || !email || !password || (isRegistering && (!fullName || !officerId || !designation || !department || !jurisdiction || !confirmPassword))}
              className={`w-full mt-4 py-5 text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A110C] focus-visible:ring-[#F4EFE6]
                ${(isAuthenticating || !email || !password || (isRegistering && (!fullName || !officerId || !designation || !department || !jurisdiction || !confirmPassword)))
                  ? 'bg-[#F4EFE6]/10 text-[#F4EFE6]/40 cursor-not-allowed' 
                  : 'bg-[#F4EFE6] text-[#08150C] hover:bg-[#EAE0CC] hover:-translate-y-[2px] hover:shadow-lg'
                }`}
            >
              {isAuthenticating ? (isRegistering ? 'SUBMITTING...' : 'AUTHENTICATING...') : (isRegistering ? 'SUBMIT REGISTRATION \u2192' : 'SIGN IN \u2192')}
            </button>

          </form>

          {/* Registration Toggle */}
          <div className="mt-8 pt-6 border-t border-[#F4EFE6]/10 text-center">
            <p className="text-sm text-[#F4EFE6]/70">
              {isRegistering ? 'Already registered?' : "Don't have an officer account?"}{' '}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                disabled={isAuthenticating}
                className="font-bold text-[#B5966B] hover:text-[#F4EFE6] transition-colors focus-visible:outline-none focus-visible:underline uppercase tracking-wide disabled:opacity-50"
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
            className="text-[10px] tracking-[0.25em] font-bold uppercase text-[#F4EFE6]/40 hover:text-[#F4EFE6] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            &larr; BACK TO वनLIFE
          </button>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#F4EFE6]/30">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] tracking-[0.1em] text-[#F4EFE6]/30 uppercase font-bold">
              Protected operational access. Authorized responders only.
            </span>
          </div>
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
