import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapTheme, MapThemeToggle } from '../components/map/MapThemeContext';
import type { OfficerIncident } from '../data/mockIncidents';


import { getOfficerToken } from '../utils/auth';
import { fetchDashboard } from '../services/api';

import { getOfficerName } from '../utils/auth';

export default function OfficerDashboard({ onSignOut, onIncidentClick }: { onSignOut: () => void, onIncidentClick: (id: string | number) => void }) {
  const [incidents, setIncidents] = useState<OfficerIncident[]>([]);
  const [hoveredIncidentId, setHoveredIncidentId] = useState<string | number | null>(null);
  const { tileUrl, mapClassName } = useMapTheme();

  useEffect(() => {
    async function loadIncidents() {
      const token = getOfficerToken();
      if (!token) return;
      try {
        const data = await fetchDashboard(token);
        const parsed: OfficerIncident[] = data.map((item: any) => {
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

          return {
            id: item.id,
            type: categoryNames[item.category] || item.category,
            species: item.ai_species || 'Unknown Subject',
            riskLevel: riskLvl,
            riskScore: riskScr,
            coords: [Number(item.latitude), Number(item.longitude)],
            time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now',
            desc: item.description || 'Recently reported. Status: RECEIVED',
            isNew: item.status === 'pending'
          };
        });
        setIncidents(parsed);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    }
    loadIncidents();
    const interval = setInterval(loadIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      // Sort newly submitted reports first just for visibility, then by risk score
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return b.riskScore - a.riskScore;
    });
  }, [incidents]);

  const metrics = useMemo(() => {
    return {
      critical: incidents.filter(i => i.riskLevel === 'CRITICAL').length,
      high: incidents.filter(i => i.riskLevel === 'HIGH').length,
      medium: incidents.filter(i => i.riskLevel === 'MEDIUM').length,
      open: incidents.length
    };
  }, [incidents]);

  return (
    <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] font-sans selection:bg-[#B5966B] selection:text-[#08150C] flex flex-col h-screen overflow-hidden">
      
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
            onClick={() => window.location.hash = '/report'}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#F4EFE6] text-[#08150C] rounded-sm transition-colors hover:bg-[#EAE0CC]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">FILE REPORT</span>
          </button>
          <button 
            onClick={onSignOut}
            className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#E74C3C]/80 hover:text-[#E74C3C] transition-colors focus-visible:outline-none focus-visible:underline p-1"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Sidebar: Queue and Metrics */}
        <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 bg-[#0C160F] border-r border-[#F4EFE6]/10 flex flex-col h-full z-10 overflow-hidden shadow-2xl">
          
          {/* Top Summary Metrics */}
          <div className="grid grid-cols-4 border-b border-[#F4EFE6]/10 shrink-0 bg-[#0A110C]">
            <div className="p-4 border-r border-[#F4EFE6]/10 flex flex-col items-center justify-center bg-[#E74C3C]/5">
              <span className="text-xl font-bold text-[#E74C3C]">{metrics.critical}</span>
              <span className="text-[8px] uppercase tracking-widest text-[#F4EFE6]/60 mt-1">CRITICAL</span>
            </div>
            <div className="p-4 border-r border-[#F4EFE6]/10 flex flex-col items-center justify-center bg-[#D35400]/5">
              <span className="text-xl font-bold text-[#D35400]">{metrics.high}</span>
              <span className="text-[8px] uppercase tracking-widest text-[#F4EFE6]/60 mt-1">HIGH</span>
            </div>
            <div className="p-4 border-r border-[#F4EFE6]/10 flex flex-col items-center justify-center bg-[#B5966B]/5">
              <span className="text-xl font-bold text-[#B5966B]">{metrics.medium}</span>
              <span className="text-[8px] uppercase tracking-widest text-[#F4EFE6]/60 mt-1">MEDIUM</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-[#F4EFE6]">{metrics.open}</span>
              <span className="text-[8px] uppercase tracking-widest text-[#F4EFE6]/60 mt-1">OPEN INCIDENTS</span>
            </div>
          </div>

          <div className="p-5 flex items-center justify-between shrink-0">
            <h2 className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#F4EFE6]/80">PRIORITY INCIDENTS</h2>
            <div className="w-2 h-2 rounded-full bg-[#E74C3C] animate-pulse"></div>
          </div>

          {/* Incident Queue */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col">
              {sortedIncidents.map((inc) => (
                <div 
                  key={inc.id}
                  onClick={() => onIncidentClick(inc.id)}
                  onMouseEnter={() => setHoveredIncidentId(inc.id)}
                  onMouseLeave={() => setHoveredIncidentId(null)}
                  className={`p-5 border-b border-[#F4EFE6]/5 cursor-pointer transition-colors hover:bg-[#132217] group relative overflow-hidden ${
                    hoveredIncidentId === inc.id ? 'bg-[#132217]' : inc.isNew ? 'bg-[#0F1C13]' : ''
                  }`}
                >
                  {inc.isNew && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#E74C3C]"></div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono tracking-wider text-[#F4EFE6]/70 group-hover:text-[#F4EFE6]/90 transition-colors">{inc.id}</span>
                    <span className="text-[9px] text-[#F4EFE6]/50">{inc.time}</span>
                  </div>
                  <h3 className="font-medium text-sm mb-1 text-[#F4EFE6]">{inc.species}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] tracking-[0.1em] uppercase text-[#F4EFE6]/60">{inc.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-[0.1em] text-[#F4EFE6]/50">Risk {inc.riskScore}</span>
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 rounded-sm
                        ${inc.riskLevel === 'CRITICAL' ? 'bg-[#E74C3C]/10 text-[#E74C3C] border border-[#E74C3C]/30' : 
                          inc.riskLevel === 'HIGH' ? 'bg-[#D35400]/10 text-[#D35400] border border-[#D35400]/30' : 
                          inc.riskLevel === 'MEDIUM' ? 'bg-[#B5966B]/10 text-[#B5966B] border border-[#B5966B]/30' : 
                          'bg-[#5E7A63]/10 text-[#5E7A63] border border-[#5E7A63]/30'}`}
                      >
                        {inc.riskLevel}
                      </span>
                    </div>
                  </div>
                  {inc.isNew && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-[#E74C3C]/10 rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E74C3C] animate-pulse"></span>
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#E74C3C]">NEW / PENDING ASSESSMENT</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Map & Live Activity */}
        <div className="flex-1 relative flex flex-col bg-[#0A110C]">
          
          {/* Map */}
          <div className={`absolute inset-0 z-0 ${mapClassName}`}>
            <MapThemeToggle />
            <MapContainer 
              center={[22.5, 79.4]} 
              zoom={10} 
              scrollWheelZoom={true}
              className="w-full h-full"
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url={tileUrl} />
              {incidents.map(inc => (
                <Marker 
                  key={inc.id} 
                  position={inc.coords} 
                  icon={
                    L.divIcon({
                      className: 'bg-transparent border-none',
                      html: `
                        <div class="relative flex items-center justify-center w-8 h-8 group cursor-pointer hover:scale-125 transition-transform duration-300">
                          <div class="w-3 h-3 rounded-full z-10 shadow-lg ${
                            inc.riskLevel === 'CRITICAL' ? 'bg-[#E74C3C]' : 
                            inc.riskLevel === 'HIGH' ? 'bg-[#D35400]' : 
                            inc.riskLevel === 'MEDIUM' ? 'bg-[#B5966B]' : 
                            'bg-[#5E7A63]'
                          } border-2 border-[#0A110C] ${hoveredIncidentId === inc.id ? 'border-[#F4EFE6]' : ''}"></div>
                          ${(inc.riskLevel === 'CRITICAL' || inc.riskLevel === 'HIGH' || inc.isNew) ? `
                            <div class="absolute inset-0 rounded-full animate-ping opacity-50 ${
                              inc.riskLevel === 'CRITICAL' || inc.isNew ? 'bg-[#E74C3C]' : 'bg-[#D35400]'
                            }" style="animation-duration: ${inc.riskLevel === 'CRITICAL' ? '1s' : '2s'};"></div>
                          ` : ''}
                        </div>
                      `,
                      iconSize: [32, 32],
                      iconAnchor: [16, 16],
                    })
                  }
                  eventHandlers={{
                    click: () => onIncidentClick(inc.id),
                    mouseover: () => setHoveredIncidentId(inc.id),
                    mouseout: () => setHoveredIncidentId(null)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} className="officer-tooltip">
                    <div className="bg-[#0A110C]/95 backdrop-blur-sm border border-[#F4EFE6]/20 p-3 rounded-sm min-w-[150px]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono text-[#F4EFE6]/70">{inc.id}</span>
                        <span className={`text-[9px] uppercase font-bold tracking-widest ${
                          inc.riskLevel === 'CRITICAL' ? 'text-[#E74C3C]' : 
                          inc.riskLevel === 'HIGH' ? 'text-[#D35400]' : 
                          inc.riskLevel === 'MEDIUM' ? 'text-[#B5966B]' : 
                          'text-[#5E7A63]'
                        }`}>{inc.riskLevel}</span>
                      </div>
                      <div className="text-sm text-[#F4EFE6] font-medium">{inc.species}</div>
                      {inc.isNew && <div className="text-[9px] uppercase tracking-widest text-[#E74C3C] mt-1 font-bold">NEW</div>}
                    </div>
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Overlays */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 pointer-events-none text-[#18261C]">
            <div className="bg-[#F4EFE6]/80 backdrop-blur-md border border-[#18261C]/10 p-4 rounded-sm shadow-xl pointer-events-auto max-w-[280px]">
              <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold !text-[#18261C] mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#B5966B] rounded-full animate-pulse"></div>
                LIVE ACTIVITY
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-medium !text-[#18261C]/70">2 min ago</span>
                  <span className="text-[11px] leading-tight font-bold !text-[#18261C]">High-risk conflict reported near buffer zone.</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-medium !text-[#18261C]/70">7 min ago</span>
                  <span className="text-[11px] leading-tight font-bold !text-[#18261C]">Wildlife observation logged by patrol unit 4.</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-medium !text-[#18261C]/70">12 min ago</span>
                  <span className="text-[11px] leading-tight font-bold !text-[#18261C]">SOS response unit dispatched to Sector G.</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F4EFE6]/80 backdrop-blur-md border border-[#18261C]/10 p-3 rounded-sm shadow-xl pointer-events-auto">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#E74C3C]"></div>
                  <span className="text-[9px] uppercase tracking-widest font-bold !text-[#18261C]">Critical Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D35400]"></div>
                  <span className="text-[9px] uppercase tracking-widest font-bold !text-[#18261C]">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#B5966B]"></div>
                  <span className="text-[9px] uppercase tracking-widest font-bold !text-[#18261C]">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#5E7A63]"></div>
                  <span className="text-[9px] uppercase tracking-widest font-bold !text-[#18261C]">Low Risk</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .officer-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
