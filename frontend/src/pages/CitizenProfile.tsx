import { useState, useEffect } from 'react';
import { getCitizenId } from '../utils/auth';

interface Incident {
  id: string | number;
  type: string;
  species: string;
  risk: string;
  coords: [number, number];
  time: string;
  desc: string;
  region: string;
  isNew?: boolean;
  statusLabel?: string;
  citizenId?: string;
}

export default function CitizenProfile({ 
  onSignOut, 
  onBack 
}: { 
  onSignOut: () => void, 
  onBack: () => void 
}) {
  const [reports, setReports] = useState<Incident[]>([]);
  const citizenId = getCitizenId();

  useEffect(() => {
    if (!citizenId) return;

    const loadReports = async () => {
      const token = sessionStorage.getItem('citizen_token');
      if (!token) return;
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/reports/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();
        
        const myReports = data
          .filter((item: any) => item.reporter === Number(citizenId))
          .map((item: any) => {
            const date = new Date(item.created_at);
            const timeStr = isNaN(date.getTime()) ? 'Unknown Time' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const categoryNames: Record<string, string> = {
              'conflict': 'Human-Wildlife Conflict',
              'injured': 'Injured / Trapped Animal',
              'sighting': 'Wildlife Sighting',
              'illegal': 'Suspected Illegal Activity',
              'invasive': 'Invasive Species'
            };

            let riskStr = 'Unknown';
            if (item.risk_score >= 8) riskStr = 'CRITICAL';
            else if (item.risk_score >= 6) riskStr = 'HIGH';
            else if (item.risk_score >= 4) riskStr = 'MEDIUM';
            else riskStr = 'LOW';

            return {
              id: item.id,
              type: categoryNames[item.category] || item.category,
              species: item.ai_species || 'Unknown Subject',
              risk: riskStr,
              coords: [item.latitude, item.longitude],
              time: timeStr,
              desc: item.description,
              region: 'Local Region',
              citizenId: item.reporter.toString(),
              statusLabel: item.status ? item.status.toUpperCase() : 'PENDING'
            } as Incident;
          });
          
        setReports(myReports);
      } catch (e) {
        console.error('Failed to load real incidents', e);
      }
    };

    loadReports();
    // Refresh every 10 seconds to show updates
    const interval = setInterval(loadReports, 10000);
    return () => clearInterval(interval);
  }, [citizenId]);

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
        <div className="flex items-center gap-6">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/60 hidden sm:inline">
            CITIZEN ACCOUNT
          </span>
          <button 
            onClick={onSignOut}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C] hover:text-[#D35400] transition-colors focus-visible:outline-none"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-24 flex flex-col">
        
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#18261C]/5 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#18261C]/50">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif leading-tight tracking-tight text-[#18261C]">
                MY REPORTS
              </h1>
              <p className="text-sm text-[#18261C]/50 font-medium">ID: {citizenId}</p>
            </div>
          </div>
          <p className="text-lg text-[#18261C]/70 font-light max-w-2xl">
            Track the status of incidents you've reported. Thank you for protecting the wild.
          </p>
        </div>

        <div className="bg-white border border-[#18261C]/10 rounded-sm shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {reports.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#18261C]/5 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#18261C]/20">
                  <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#18261C] mb-2">No Reports Found</h3>
              <p className="text-[#18261C]/60 text-sm max-w-sm mb-8">
                You haven't submitted any wildlife incident reports yet.
              </p>
              <button 
                onClick={() => window.location.hash = '/report'}
                className="px-8 py-4 bg-[#18261C] text-[#F4EFE6] text-[10px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm hover:bg-[#2A3F2E] hover:-translate-y-[2px] shadow-lg"
              >
                REPORT AN INCIDENT
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#18261C]/10">
              {reports.map((report) => (
                <div key={report.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#18261C]/[0.02] transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-1 rounded-sm border ${
                        report.type.includes('Conflict') 
                          ? 'bg-[#D35400]/10 text-[#D35400] border-[#D35400]/20' 
                          : report.type.includes('SOS') 
                            ? 'bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/20'
                            : 'bg-[#B5966B]/10 text-[#B5966B] border-[#B5966B]/20'
                      }`}>
                        {report.type}
                      </span>
                      <span className="text-xs text-[#18261C]/50 font-medium">
                        ID: {report.id}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#18261C] mb-1">{report.desc}</h3>
                    <p className="text-sm text-[#18261C]/60">
                      Species: <span className="font-medium text-[#18261C]">{report.species}</span>
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2 shrink-0">
                    <div className="text-sm font-medium text-[#18261C]">
                      Status: <span className="text-[#B5966B]">Received</span>
                    </div>
                    <div className="text-xs text-[#18261C]/40">
                      {report.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
