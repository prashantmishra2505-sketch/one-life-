import { useState, useEffect } from 'react';
import { fetchPendingOfficers, approveOfficer, rejectOfficer } from '../services/api';
import { getOfficerToken, clearOfficerAuth } from '../utils/auth';

export default function AdminPortal({
  onSignOut
}: {
  onSignOut: () => void
}) {
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOfficers = async () => {
    const token = getOfficerToken();
    if (!token) {
      onSignOut();
      return;
    }

    try {
      setLoading(true);
      const data = await fetchPendingOfficers(token);
      setOfficers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending officers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficers();
  }, []);

  const handleApprove = async (id: string) => {
    const token = getOfficerToken();
    if (!token) return;
    try {
      await approveOfficer(id, token);
      setOfficers(officers.filter(o => o.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to approve officer');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this application?')) return;
    const token = getOfficerToken();
    if (!token) return;
    try {
      await rejectOfficer(id, token);
      setOfficers(officers.filter(o => o.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to reject officer');
    }
  };

  const handleSignOut = () => {
    clearOfficerAuth();
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] font-sans selection:bg-[#B5966B] selection:text-[#08150C] flex flex-col">
      {/* Header */}
      <header className="w-full px-8 md:px-16 py-6 border-b border-[#F4EFE6]/10 flex items-center justify-between bg-[#0A110C] sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#0A110C] border border-[#B5966B]/30">
            <img src="/images/vanlife-logo.png" alt="वनLIFE Logo" className="w-full h-full object-cover scale-[1.15]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-medium tracking-[0.15em] text-lg text-[#F4EFE6]">वनLIFE</span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#B5966B]">COMMAND CENTER</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#B5966B]/10 border border-[#B5966B]/20 rounded-sm">
            <div className="w-1.5 h-1.5 bg-[#B5966B] rounded-full animate-pulse"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#B5966B]">ADMIN ACTIVE</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#E74C3C]/80 hover:text-[#E74C3C] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        
        <div className="flex justify-between items-end border-b border-[#F4EFE6]/10 pb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-[#F4EFE6] mb-2">Pending Registrations</h1>
            <p className="text-sm text-[#F4EFE6]/50">Review and verify access requests for command center and field operations.</p>
          </div>
          <button onClick={loadOfficers} className="text-xs uppercase tracking-widest text-[#B5966B] hover:text-[#F4EFE6] transition-colors">
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="bg-[#E74C3C]/10 border border-[#E74C3C]/30 text-[#E74C3C] p-4 rounded-sm text-sm">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-50">
             <div className="w-8 h-8 border-2 border-[#B5966B]/20 border-t-[#B5966B] rounded-full animate-spin mb-4"></div>
             <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#B5966B]">SYNCING DATABASE...</span>
          </div>
        ) : officers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border border-[#F4EFE6]/5 rounded-sm bg-[#0A110C]/50">
            <div className="w-16 h-16 rounded-full bg-[#132217] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#5E7A63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-serif text-[#F4EFE6]">All Caught Up</h3>
            <p className="text-sm text-[#F4EFE6]/50 mt-2">There are no pending officer registrations at this time.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {officers.map(officer => (
              <div key={officer.id} className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#B5966B]/30 transition-colors shadow-lg group">
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/30 mb-1">OFFICER NAME</span>
                    <span className="text-base font-bold text-[#F4EFE6]">{officer.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/30 mb-1">CONTACT EMAIL</span>
                    <span className="text-sm font-mono text-[#F4EFE6]/80">{officer.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/30 mb-1">STATUS</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E74C3C]">PENDING</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:border-l md:border-[#F4EFE6]/10 md:pl-6">
                  <button 
                    onClick={() => handleReject(officer.id)}
                    className="px-6 py-2.5 border border-[#E74C3C]/30 text-[#E74C3C] text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#E74C3C]/10 transition-colors focus-visible:outline-none"
                  >
                    REJECT
                  </button>
                  <button 
                    onClick={() => handleApprove(officer.id)}
                    className="px-6 py-2.5 bg-[#B5966B] text-[#08150C] text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#A3865D] transition-colors shadow-lg focus-visible:outline-none"
                  >
                    APPROVE
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
