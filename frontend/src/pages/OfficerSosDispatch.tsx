import { useState, useEffect, useMemo } from 'react';
import type { OfficerIncident } from '../data/mockIncidents';

import { MOCK_RESPONSE_UNITS } from '../data/mockResponseUnits';
import { calculateDistance } from '../utils/geo';

interface OfficerSosDispatchProps {
  incidentId: string;
  onBackToIncident: () => void;
  onBackToOperations: () => void;
  onSignOut: () => void;
}

import { fetchIncidentDetail, dispatchSos } from '../services/api';
import { getOfficerToken } from '../utils/auth';

import { getOfficerName } from '../utils/auth';

export default function OfficerSosDispatch({ incidentId, onBackToIncident, onBackToOperations, onSignOut }: OfficerSosDispatchProps) {
  const [incident, setIncident] = useState<OfficerIncident | null>(null);
  const [dispatchState, setDispatchState] = useState<'READY' | 'DISPATCHING' | 'DISPATCHED'>('READY');
  const [dispatchRef, setDispatchRef] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  
  const [selectedUnitId] = useState(() => sessionStorage.getItem('pending_dispatch_unit'));

  useEffect(() => {
    async function loadDetail() {
      const token = getOfficerToken();
      if (!token) return;
      try {
        const item = await fetchIncidentDetail(incidentId, token);
        let riskLvl: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        let rScore = item.risk_score || 0;
        let riskScr = Math.round(rScore * 10);
        
        if (rScore >= 8) riskLvl = 'CRITICAL';
        else if (rScore >= 6) riskLvl = 'HIGH';
        else if (rScore >= 4) riskLvl = 'MEDIUM';

        const categoryNames: Record<string, string> = {
          'conflict': 'Human-Wildlife Conflict',
          'injured': 'Injured / Trapped Animal',
          'sighting': 'Wildlife Sighting',
          'illegal': 'Suspected Illegal Activity',
          'invasive': 'Invasive Species'
        };

        setIncident({
          id: item.id,
          type: categoryNames[item.category] || item.category,
          species: item.ai_species || 'Unknown Subject',
          riskLevel: riskLvl,
          riskScore: riskScr,
          coords: [Number(item.latitude), Number(item.longitude)],
          time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now',
          desc: item.description || 'Recently reported.',
          isNew: item.status === 'pending'
        });
      } catch (err) {
        console.error("Error fetching detail", err);
      }
    }
    loadDetail();
  }, [incidentId]);

  // Re-compute units exactly like OfficerIncidentDetail to guarantee data parity
  const processedUnits = useMemo(() => {
    if (!incident) return [];
    
    return MOCK_RESPONSE_UNITS.map(unit => {
      const dist = calculateDistance(incident.coords[0], incident.coords[1], unit.coords[0], unit.coords[1]);
      const eta = Math.ceil(dist * 2.8); // mock ~2.8 mins per km
      return { ...unit, distance: dist, eta };
    });
  }, [incident]);

  const selectedUnit = processedUnits.find(u => u.id === selectedUnitId);

  const handleConfirmDispatch = async () => {
    setDispatchState('DISPATCHING');
    setDispatchError(null);
    const token = getOfficerToken();
    if (!token) return;

    try {
      const res = await dispatchSos(incidentId, token);
      setDispatchState('DISPATCHED');
      setDispatchRef(res.message || `DSP-2026-${Math.floor(Math.random() * 900 + 100)}`);
      setTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      sessionStorage.removeItem('pending_dispatch_unit');
    } catch (err: any) {
      setDispatchState('READY');
      setDispatchError(err.message || 'Dispatch failed');
    }
  };

  if (!incident) {
    return (
      <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] flex flex-col items-center justify-center font-sans">
        <h1 className="text-4xl font-serif mb-4 tracking-tight">INCIDENT NOT FOUND</h1>
        <button onClick={onBackToOperations} className="text-[11px] tracking-[0.25em] font-bold uppercase hover:underline text-[#B5966B]">
          &larr; BACK TO OPERATIONS
        </button>
      </div>
    );
  }

  if (!selectedUnitId || !selectedUnit) {
    return (
      <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] flex flex-col items-center justify-center font-sans">
        <h1 className="text-4xl font-serif mb-4 tracking-tight">NO RESPONSE UNIT SELECTED</h1>
        <button onClick={onBackToIncident} className="text-[11px] tracking-[0.25em] font-bold uppercase hover:underline text-[#B5966B]">
          &larr; BACK TO INCIDENT
        </button>
      </div>
    );
  }

  const riskColor = 
    incident.riskLevel === 'CRITICAL' ? '#E74C3C' : 
    incident.riskLevel === 'HIGH' ? '#D35400' : 
    incident.riskLevel === 'MEDIUM' ? '#B5966B' : '#5E7A63';

  return (
    <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] font-sans selection:bg-[#B5966B] selection:text-[#08150C] flex flex-col">
      
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-[#F4EFE6]/10 flex items-center justify-between bg-[#0A110C] shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#0A110C]">
            <img src="/images/vanlife-logo.png" alt="वनLIFE Logo" className="w-full h-full object-cover scale-[1.15]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-medium tracking-[0.15em] text-lg leading-none text-[#F4EFE6]">वनLIFE</span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50">OFFICER OPERATIONS</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
           <button 
             onClick={dispatchState === 'READY' ? onBackToIncident : onBackToOperations} 
             className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#F4EFE6]/70 hover:text-[#F4EFE6] transition-colors focus-visible:outline-none focus-visible:underline"
           >
            &larr; {dispatchState === 'READY' ? 'BACK TO INCIDENT' : 'BACK TO OPERATIONS'}
          </button>
          <div className="h-4 w-px bg-[#F4EFE6]/20"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#F4EFE6]/50">SOS / DISPATCH</span>
            <span className="text-[12px] font-mono font-bold tracking-wider text-[#E74C3C]">ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#18261C] border border-[#B5966B]/30 rounded-sm">
            <div className="w-1.5 h-1.5 bg-[#B5966B] rounded-full"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#B5966B]">AUTHORIZED</span>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-[#F4EFE6]/80 font-medium">{getOfficerName() || 'Demo Officer'}</span>
            <span className="text-[9px] uppercase tracking-[0.1em] text-[#F4EFE6]/40">Field Agent</span>
          </div>
          <button 
            onClick={onSignOut}
            className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#E74C3C]/80 hover:text-[#E74C3C] transition-colors focus-visible:outline-none focus-visible:underline p-1"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 md:px-8 overflow-y-auto">
        <div className="w-full max-w-3xl flex flex-col gap-8 animate-fade-in-up">
          
          {/* Header Title */}
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-2 text-[#E74C3C]">
              {dispatchState === 'READY' && 'CONFIRM EMERGENCY DISPATCH'}
              {dispatchState === 'DISPATCHING' && 'DISPATCHING...'}
              {dispatchState === 'DISPATCHED' && 'DISPATCH INITIATED'}
            </h1>
            <p className="text-[#F4EFE6]/70 text-sm md:text-base font-light">
              {dispatchState === 'READY' && 'This action will initiate the configured emergency response workflow for the selected incident and unit.'}
              {dispatchState === 'DISPATCHING' && 'Connecting to emergency response network...'}
              {dispatchState === 'DISPATCHED' && 'Unit has been successfully notified.'}
            </p>
          </div>

          {dispatchState === 'READY' && (
            <div className="bg-[#E74C3C]/10 border border-[#E74C3C]/30 rounded-sm p-5 flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-[#E74C3C]/20 flex items-center justify-center shrink-0">
                 <div className="w-2.5 h-2.5 bg-[#E74C3C] rounded-full animate-pulse"></div>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#E74C3C]">EMERGENCY ACTION</span>
                 <span className="text-sm text-[#F4EFE6]/90">Confirm only when immediate field response is required.</span>
               </div>
            </div>
          )}

          {dispatchError && (
            <div className="bg-[#E74C3C]/10 border border-[#E74C3C]/30 rounded-sm p-4 flex items-center gap-3">
               <span className="text-xs uppercase tracking-widest font-bold text-[#E74C3C]">Error:</span>
               <span className="text-sm text-[#F4EFE6]">{dispatchError}</span>
            </div>
          )}

          {/* Combined Summary Card */}
          <section className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: dispatchState === 'DISPATCHED' ? '#5E7A63' : riskColor }}></div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-12">
              
              {/* Incident Details */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50">INCIDENT</h3>
                  <span className="text-sm font-mono text-[#F4EFE6]">{incident.id}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#F4EFE6] mb-1">{incident.type}</span>
                  <span className="text-sm text-[#F4EFE6]/80">{incident.species}</span>
                </div>

                <div className="flex gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">SEVERITY</span>
                    <span className="text-sm font-bold" style={{ color: riskColor }}>{incident.riskLevel}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">RISK SCORE</span>
                    <span className="text-sm font-bold" style={{ color: riskColor }}>{incident.riskScore} <span className="text-[#F4EFE6]/40 font-normal">/ 100</span></span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-px bg-[#F4EFE6]/10"></div>
              <div className="md:hidden h-px w-full bg-[#F4EFE6]/10"></div>

              {/* Unit Details */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50">SELECTED RESPONSE UNIT</h3>
                  <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm bg-[#5E7A63]/20 text-[#5E7A63]">
                    {dispatchState === 'DISPATCHED' ? 'DISPATCHED' : selectedUnit.status}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#F4EFE6] mb-1">{selectedUnit.name}</span>
                  <span className="text-sm text-[#F4EFE6]/80">{selectedUnit.type}</span>
                </div>

                <div className="flex gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">DISTANCE</span>
                    <span className="text-sm font-mono font-bold text-[#F4EFE6]">{selectedUnit.distance.toFixed(1)} <span className="text-[10px] text-[#F4EFE6]/50 font-sans">km</span></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">EST. ETA</span>
                    <span className="text-sm font-mono font-bold text-[#F4EFE6]">~{selectedUnit.eta} <span className="text-[10px] text-[#F4EFE6]/50 font-sans">min</span></span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Actions & Timelines */}
          <div className="flex flex-col gap-6 mt-4">
            
            {dispatchState === 'READY' && (
              <div className="flex flex-col-reverse md:flex-row gap-4 items-center w-full">
                <button 
                  onClick={onBackToIncident}
                  className="w-full md:w-auto px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F4EFE6]/70 hover:text-[#F4EFE6] transition-colors focus-visible:outline-none"
                >
                  &larr; BACK TO INCIDENT
                </button>
                <button 
                  onClick={handleConfirmDispatch}
                  className="w-full md:w-auto md:ml-auto px-12 py-4 bg-[#E74C3C] text-[#F4EFE6] text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#C0392B] transition-colors shadow-[0_0_20px_rgba(231,76,60,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5966B]"
                >
                  CONFIRM SOS DISPATCH
                </button>
              </div>
            )}

            {dispatchState === 'DISPATCHING' && (
              <div className="w-full py-8 flex flex-col items-center justify-center border border-[#E74C3C]/30 bg-[#E74C3C]/5 rounded-sm">
                <div className="w-12 h-12 rounded-full border-2 border-[#E74C3C]/20 border-t-[#E74C3C] animate-spin mb-4"></div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#E74C3C]">TRANSMITTING DATA...</span>
              </div>
            )}

            {dispatchState === 'DISPATCHED' && (
              <div className="flex flex-col gap-8 animate-fade-in-up">
                
                {/* Timeline / Status Panel */}
                <div className="bg-[#132217] border border-[#5E7A63]/30 rounded-sm p-6 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#F4EFE6]/50 mb-1">DISPATCH REFERENCE</span>
                    <span className="text-lg font-mono font-bold text-[#F4EFE6]">{dispatchRef}</span>
                    <span className="text-xs text-[#F4EFE6]/40">{timestamp}</span>
                  </div>

                  <div className="flex flex-col gap-3 flex-1 w-full md:pl-12 md:border-l border-[#F4EFE6]/10">
                    <div className="flex items-center gap-3 text-[#5E7A63]">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-xs font-bold uppercase tracking-widest">Dispatch request confirmed</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#5E7A63]">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-xs font-bold uppercase tracking-widest">Response unit selected</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#B5966B]">
                      <span className="w-4 flex justify-center">&rarr;</span>
                      <span className="text-xs font-bold uppercase tracking-widest">Unit notified — <span className="text-[#F4EFE6]/30 font-normal">Response Confirmed</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-[#F4EFE6]/30">
                      <span className="w-4 flex justify-center">&rarr;</span>
                      <span className="text-xs font-bold uppercase tracking-widest">En route — GPS Tracking Active</span>
                    </div>
                  </div>
                </div>

                {/* Final Navigation Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mt-4">
                  <button 
                    onClick={onBackToOperations}
                    className="w-full sm:w-auto px-8 py-4 bg-[#18261C] border border-[#F4EFE6]/20 text-[#F4EFE6] text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#1C2C21] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5966B]"
                  >
                    BACK TO OPERATIONS &rarr;
                  </button>
                  <button 
                    onClick={onBackToIncident}
                    className="w-full sm:w-auto px-12 py-4 bg-[#F4EFE6] text-[#08150C] text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#EAE0CC] transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5966B]"
                  >
                    VIEW INCIDENT &rarr;
                  </button>
                </div>
                
              </div>
            )}

          </div>

        </div>
      </main>

      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
