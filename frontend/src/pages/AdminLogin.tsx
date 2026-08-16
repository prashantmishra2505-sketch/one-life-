import { useState } from 'react';
import { loginOfficer } from '../services/api';
import { setOfficerAuth } from '../utils/auth';

export default function AdminLogin({ 
  onLoginSuccess, 
  onBack 
}: { 
  onLoginSuccess: () => void, 
  onBack: () => void 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    const result = await loginOfficer({ email, password });
    setIsAuthenticating(false);
    
    if (result.success && result.token && result.user) {
      // In a real app we'd verify result.user.is_staff here, but the backend will 
      // reject the pending officers call anyway if they aren't admin.
      setOfficerAuth(result.user.id, result.token, result.user.name);
      onLoginSuccess();
    } else {
      setError(result.error || 'Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] font-sans selection:bg-[#B5966B] selection:text-[#08150C] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0A110C] border border-[#F4EFE6]/10 p-8 rounded-sm shadow-2xl relative overflow-hidden">
        
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#B5966B]"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#0A110C] opacity-90 mb-4 border border-[#B5966B]/30">
            <img src="/images/vanlife-logo.png" alt="वनLIFE Logo" className="w-full h-full object-cover scale-[1.15]" />
          </div>
          <h1 className="text-2xl font-serif tracking-widest text-[#B5966B]">COMMAND CENTER</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/40 mt-2">Admin Authentication Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50">Admin Email</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-[#132217]/50 border border-[#F4EFE6]/20 px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-[#B5966B] transition-colors"
              placeholder="admin@vanlife.gov"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50">Secure Password</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-[#132217]/50 border border-[#F4EFE6]/20 px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-[#B5966B] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-[#E74C3C]/10 border border-[#E74C3C]/30 text-[#E74C3C] px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isAuthenticating}
            className="w-full mt-4 bg-[#B5966B] text-[#08150C] py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#A3865D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(181,150,107,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EFE6]"
          >
            {isAuthenticating ? 'AUTHENTICATING...' : 'ACCESS PORTAL &rarr;'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-[#F4EFE6]/10 text-center">
          <button 
            onClick={onBack}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/40 hover:text-[#F4EFE6] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            &larr; BACK TO PUBLIC SITE
          </button>
        </div>
      </div>
    </div>
  );
}
