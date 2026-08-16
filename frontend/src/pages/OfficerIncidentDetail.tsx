import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapTheme, MapThemeToggle } from '../components/map/MapThemeContext';
import type { OfficerIncident } from '../data/mockIncidents';

import { MOCK_RESPONSE_UNITS } from '../data/mockResponseUnits';
import { calculateDistance } from '../utils/geo';

interface IncidentDetailProps {
  incidentId: string;
  onBack: () => void;
  onSignOut: () => void;
  onContinueToSos?: (incidentId: string, unitId: string) => void;
}

import { fetchIncidentDetail, updateIncidentStatus } from '../services/api';
import { getOfficerToken } from '../utils/auth';

import { getOfficerName } from '../utils/auth';

export default function OfficerIncidentDetail({ incidentId, onBack, onSignOut, onContinueToSos }: IncidentDetailProps) {
  const [incident, setIncident] = useState<OfficerIncident | null>(null);
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);

  const [status, setStatus] = useState<'NEW' | 'PENDING ASSESSMENT' | 'ACKNOWLEDGED' | 'IN PROGRESS' | 'RESOLVED'>('NEW');
  const [dispatchState, setDispatchState] = useState<'IDLE' | 'READY'>('IDLE');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const { tileUrl, mapClassName } = useMapTheme();

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
        
        if (item.status === 'pending') setStatus('PENDING ASSESSMENT');
        else if (item.status === 'investigating') setStatus('ACKNOWLEDGED');
        else if (item.status === 'resolved') setStatus('RESOLVED');
        else setStatus('NEW');

        if (item.image) {
          let imgUrl = item.image;
          // Force https for mixed content issues
          if (imgUrl.startsWith('http://')) imgUrl = imgUrl.replace('http://', 'https://');
          else if (!imgUrl.startsWith('https://')) imgUrl = `${import.meta.env.VITE_API_URL || ''}${imgUrl}`;
          setEvidenceImage(imgUrl);
        }
        

      } catch (err) {
        console.error("Error fetching detail", err);
      }
    }
    loadDetail();
  }, [incidentId]);

  // Compute and sort response units
  const processedUnits = useMemo(() => {
    if (!incident) return [];
    
    const mapped = MOCK_RESPONSE_UNITS.map(unit => {
      const dist = calculateDistance(incident.coords[0], incident.coords[1], unit.coords[0], unit.coords[1]);
      const eta = Math.ceil(dist * 2.8); // mock ~2.8 mins per km
      return { ...unit, distance: dist, eta };
    });

    // Sort: Available first, then shortest distance
    return mapped.sort((a, b) => {
      if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
      if (b.status === 'AVAILABLE' && a.status !== 'AVAILABLE') return 1;
      return a.distance - b.distance;
    });
  }, [incident]);

  // Auto-select recommended
  useEffect(() => {
    if (processedUnits.length > 0 && !selectedUnitId) {
      const firstAvailable = processedUnits.find(u => u.status === 'AVAILABLE');
      if (firstAvailable) {
        setSelectedUnitId(firstAvailable.id);
      }
    }
  }, [processedUnits, selectedUnitId]);

  const handleStatusChange = async (newStatus: 'investigating' | 'resolved') => {
    const token = getOfficerToken();
    if (!token) return;
    try {
      await updateIncidentStatus(incidentId, newStatus, token);
      setStatus(newStatus === 'investigating' ? 'ACKNOWLEDGED' : 'RESOLVED');
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status. Please try again.');
    }
  };

  if (!incident) {
    return (
      <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] flex flex-col items-center justify-center font-sans">
        <h1 className="text-4xl font-serif mb-4 tracking-tight">INCIDENT NOT FOUND</h1>
        <button onClick={onBack} className="text-[11px] tracking-[0.25em] font-bold uppercase hover:underline text-[#B5966B]">
          &larr; BACK TO OPERATIONS
        </button>
      </div>
    );
  }

  const riskColor = 
    incident.riskLevel === 'CRITICAL' ? '#E74C3C' : 
    incident.riskLevel === 'HIGH' ? '#D35400' : 
    incident.riskLevel === 'MEDIUM' ? '#B5966B' : '#5E7A63';

  const selectedUnit = processedUnits.find(u => u.id === selectedUnitId);

  return (
    <div className="min-h-screen bg-[#08150C] text-[#F4EFE6] font-sans selection:bg-[#B5966B] selection:text-[#08150C] flex flex-col overflow-hidden">
      
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
           <button onClick={onBack} className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#F4EFE6]/70 hover:text-[#F4EFE6] transition-colors focus-visible:outline-none focus-visible:underline">
            &larr; BACK TO OPERATIONS
          </button>
          <div className="h-4 w-px bg-[#F4EFE6]/20"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#F4EFE6]/50">INCIDENT</span>
            <span className="text-[12px] font-mono font-bold tracking-wider text-[#F4EFE6]">{incident.id}</span>
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
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          
          {/* Mobile Back Button */}
          <button onClick={onBack} className="md:hidden text-[10px] tracking-[0.2em] font-bold uppercase text-[#F4EFE6]/70 hover:text-[#F4EFE6] transition-colors text-left mb-2">
            &larr; BACK TO OPERATIONS
          </button>

          {/* LEFT COLUMN: Summary & Evidence (col-span-5) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Summary Card */}
            <section className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm overflow-hidden shadow-xl relative">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: riskColor }}></div>
              <div className="p-6 md:p-8">
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">INCIDENT TYPE</span>
                    <span className="text-xl font-medium text-[#F4EFE6]">{incident.type}</span>
                  </div>
                  <div className="px-3 py-1 bg-[#18261C] border border-[#F4EFE6]/10 rounded-sm">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: riskColor }}>
                      {status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">SPECIES</span>
                    <span className="text-lg font-medium text-[#F4EFE6]">{incident.species}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">TIME</span>
                    <span className="text-lg font-medium text-[#F4EFE6]">{incident.time}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">SEVERITY</span>
                    <span className="text-lg font-medium tracking-wide" style={{ color: riskColor }}>{incident.riskLevel}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">RISK SCORE</span>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold leading-none" style={{ color: riskColor }}>{incident.riskScore}</span>
                      <span className="text-sm text-[#F4EFE6]/40 pb-0.5">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col pt-6 border-t border-[#F4EFE6]/10">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-2">DESCRIPTION</span>
                  <p className="text-[#F4EFE6]/80 text-sm leading-relaxed">{incident.desc}</p>
                </div>
              </div>
            </section>

            {/* Evidence Card */}
            <section className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm overflow-hidden shadow-xl flex flex-col">
              <div className="px-6 py-4 border-b border-[#F4EFE6]/10 flex justify-between items-center bg-[#132217]">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/80">SUBMITTED EVIDENCE</h3>
                {evidenceImage && <span className="text-[9px] uppercase tracking-widest text-[#B5966B]">CAPTURED IMAGE</span>}
              </div>
              <div className="relative bg-[#08150C] flex-1 min-h-[250px] md:min-h-[300px] flex items-center justify-center">
                {evidenceImage ? (
                  <img src={evidenceImage} alt="Evidence" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#F4EFE6]/30">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] tracking-widest uppercase">EVIDENCE UNAVAILABLE</span>
                  </div>
                )}
              </div>
            </section>

            {/* Actions Card */}
            <section className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm overflow-hidden shadow-xl p-6 flex flex-col gap-4">
               <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/80 mb-2">OPERATIONAL ACTIONS</h3>
               
               {status === 'NEW' || status === 'PENDING ASSESSMENT' ? (
                 <button 
                  onClick={() => handleStatusChange('investigating')}
                  className="w-full py-4 bg-[#F4EFE6] text-[#08150C] text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#EAE0CC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5966B]"
                >
                  ACKNOWLEDGE INCIDENT
                </button>
               ) : status === 'ACKNOWLEDGED' || status === 'IN PROGRESS' ? (
                 <button 
                  onClick={() => handleStatusChange('resolved')}
                  className="w-full py-4 bg-[#18261C] border border-[#F4EFE6]/20 text-[#F4EFE6] text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#1C2C21] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5966B]"
                >
                  MARK AS RESOLVED
                </button>
               ) : (
                 <div className="w-full py-4 bg-[#5E7A63]/20 border border-[#5E7A63]/50 text-[#5E7A63] text-center text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm">
                   INCIDENT RESOLVED
                 </div>
               )}

               {dispatchState === 'IDLE' ? (
                 <button 
                  onClick={() => setDispatchState('READY')}
                  disabled={!selectedUnit}
                  className={`w-full py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5966B] ${
                    selectedUnit 
                      ? 'bg-[#E74C3C] text-[#F4EFE6] hover:bg-[#C0392B]' 
                      : 'bg-[#E74C3C]/10 border border-[#E74C3C]/20 text-[#E74C3C]/50 cursor-not-allowed'
                  }`}
                >
                  PREPARE DISPATCH &rarr;
                </button>
               ) : (
                 <div className="flex flex-col gap-3">
                   <div className="bg-[#18261C] border border-[#B5966B]/30 p-4 rounded-sm flex items-center justify-between">
                     <div className="flex flex-col">
                       <span className="text-[9px] uppercase tracking-widest text-[#B5966B] font-bold mb-1">DISPATCH READY</span>
                       <span className="text-sm font-bold text-[#F4EFE6]">{selectedUnit?.name}</span>
                     </div>
                     <div className="text-right flex flex-col">
                       <span className="text-[9px] uppercase tracking-widest text-[#F4EFE6]/50 mb-1">EST. ETA</span>
                       <span className="text-sm font-bold text-[#F4EFE6]">~{selectedUnit?.eta} min</span>
                     </div>
                   </div>
                   <button 
                    onClick={() => {
                      if (onContinueToSos && selectedUnitId) onContinueToSos(incident.id.toString(), selectedUnitId);
                    }}
                    className="w-full py-4 bg-[#E74C3C] text-[#F4EFE6] text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-[#C0392B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5966B]"
                  >
                    CONTINUE TO SOS &rarr;
                  </button>
                 </div>
               )}
            </section>

          </div>

          {/* RIGHT COLUMN: Map & Analysis (col-span-7) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* Protected Map Card */}
            <section className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm overflow-hidden shadow-xl flex flex-col h-[350px] md:h-[450px]">
               <div className="px-6 py-4 border-b border-[#F4EFE6]/10 flex justify-between items-center bg-[#132217]">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#E74C3C]">PROTECTED VIEW</h3>
                  <div className="w-1 h-1 rounded-full bg-[#E74C3C] animate-pulse"></div>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-[#F4EFE6]/50">EXACT COORDINATES</span>
              </div>
              <div className={`relative flex-1 bg-[#08150C] ${mapClassName}`}>
                <MapThemeToggle />
                <MapContainer 
                  center={incident.coords} 
                  zoom={15} 
                  scrollWheelZoom={true}
                  className="w-full h-full"
                  zoomControl={true}
                  attributionControl={false}
                >
                  <TileLayer url={tileUrl} />
                  
                  <Circle 
                    center={incident.coords} 
                    radius={150} 
                    pathOptions={{ color: riskColor, fillColor: riskColor, fillOpacity: 0.1, weight: 1 }} 
                  />
                  <Marker 
                    position={incident.coords} 
                    icon={
                      L.divIcon({
                        className: 'bg-transparent border-none',
                        html: `
                          <div class="relative flex items-center justify-center w-10 h-10">
                            <div class="w-4 h-4 rounded-full z-10 shadow-lg border-2 border-[#0A110C]" style="background-color: ${riskColor}"></div>
                            <div class="absolute inset-0 rounded-full animate-ping opacity-50" style="background-color: ${riskColor}"></div>
                          </div>
                        `,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                      })
                    }
                  />

                  {/* Response Units Markers */}
                  {processedUnits.map(unit => (
                    <Marker
                      key={unit.id}
                      position={unit.coords}
                      icon={
                        L.divIcon({
                          className: 'bg-transparent border-none',
                          html: `
                            <div class="relative flex items-center justify-center w-8 h-8">
                              <div class="w-3 h-3 rounded-full z-10 shadow-lg border-2 border-[#0A110C]" style="background-color: ${unit.status === 'AVAILABLE' ? '#5E7A63' : '#F4EFE6'}"></div>
                            </div>
                          `,
                          iconSize: [32, 32],
                          iconAnchor: [16, 16],
                        })
                      }
                    />
                  ))}
                </MapContainer>
                
                {/* Coordinates Overlay */}
                <div className="absolute bottom-4 left-4 z-[400] bg-[#132217]/90 backdrop-blur-md border border-[#F4EFE6]/10 p-3 rounded-sm pointer-events-none">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4 justify-between">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50">LATITUDE</span>
                      <span className="text-[11px] font-mono text-[#F4EFE6]">{incident.coords[0].toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-4 justify-between">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50">LONGITUDE</span>
                      <span className="text-[11px] font-mono text-[#F4EFE6]">{incident.coords[1].toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-4 justify-between pt-1 border-t border-[#F4EFE6]/10 mt-1">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50">ACCURACY</span>
                      <span className="text-[11px] font-mono text-[#F4EFE6]">± 12 m</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Assessment Card */}
              <section className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm p-6 flex flex-col shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-4 h-4 text-[#B5966B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#B5966B]">AI-ASSISTED ASSESSMENT</h3>
                </div>
                
                <div className="flex flex-col gap-4 mb-6">
                   <div className="flex justify-between items-center border-b border-[#F4EFE6]/5 pb-2">
                     <span className="text-[10px] tracking-widest uppercase text-[#F4EFE6]/50">CONFIDENCE</span>
                     <span className="text-sm font-bold text-[#F4EFE6]">87%</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-[10px] tracking-widest uppercase text-[#F4EFE6]/50">REASONING</span>
                     <p className="text-sm text-[#F4EFE6]/90 leading-snug">Visual match for indicated species. Proximity to human structures elevates risk index. Behavioral patterns consistent with high stress.</p>
                   </div>
                </div>

                <div className="mt-auto bg-[#18261C] border border-[#B5966B]/20 p-4 rounded-sm">
                  <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#B5966B] block mb-1">RECOMMENDED ACTION</span>
                  <span className="text-sm text-[#F4EFE6] font-medium">Immediate responder review recommended.</span>
                </div>
                <p className="text-[8px] text-[#F4EFE6]/30 uppercase tracking-widest mt-4 text-center">AI interpretation is probabilistic.</p>
              </section>

              {/* Risk & Response Card */}
              <div className="flex flex-col gap-6">
                
                {/* Risk Breakdown */}
                <section className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm p-6 flex flex-col shadow-xl">
                   <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/80 mb-5">OPERATIONAL RISK ASSESSMENT</h3>
                   <div className="flex items-center gap-4 mb-6">
                     <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-2" style={{ borderColor: riskColor, backgroundColor: `${riskColor}10` }}>
                       <span className="text-xl font-bold" style={{ color: riskColor }}>{incident.riskScore}</span>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-[10px] tracking-widest uppercase text-[#F4EFE6]/50">RISK BAND</span>
                       <span className="text-lg font-bold" style={{ color: riskColor }}>{incident.riskLevel}</span>
                     </div>
                   </div>

                   <div className="flex flex-col gap-3">
                     <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#F4EFE6]/50">CONTRIBUTING FACTORS</span>
                     <ul className="flex flex-col gap-2">
                       <li className="flex items-center gap-2 text-sm text-[#F4EFE6]/80">
                         <div className="w-1 h-1 rounded-full bg-[#E74C3C]"></div>
                         Species risk profile
                       </li>
                       <li className="flex items-center gap-2 text-sm text-[#F4EFE6]/80">
                         <div className="w-1 h-1 rounded-full bg-[#D35400]"></div>
                         Human proximity
                       </li>
                       <li className="flex items-center gap-2 text-sm text-[#F4EFE6]/80">
                         <div className="w-1 h-1 rounded-full bg-[#B5966B]"></div>
                         Incident severity class
                       </li>
                     </ul>
                   </div>
                </section>

                {/* Nearest Response Unit List */}
                <section className="bg-[#0A110C] border border-[#F4EFE6]/10 rounded-sm p-6 flex flex-col shadow-xl">
                   <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/80 mb-5">NEAREST RESPONSE UNIT</h3>
                   
                   {processedUnits.length === 0 ? (
                     <div className="py-6 text-center border border-[#F4EFE6]/5 rounded-sm bg-[#132217]/50">
                       <span className="text-[10px] tracking-widest uppercase text-[#F4EFE6]/50">NO AVAILABLE RESPONSE UNITS</span>
                     </div>
                   ) : (
                     <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                       {processedUnits.map((unit, index) => {
                         const isSelected = selectedUnitId === unit.id;
                         const isRecommended = index === 0 && unit.status === 'AVAILABLE';
                         
                         return (
                           <div 
                             key={unit.id}
                             onClick={() => {
                               if (unit.status === 'AVAILABLE') {
                                 setSelectedUnitId(unit.id);
                                 setDispatchState('IDLE');
                               }
                             }}
                             className={`relative p-4 rounded-sm border transition-all cursor-pointer ${
                               isSelected 
                                 ? 'bg-[#18261C] border-[#B5966B] shadow-lg' 
                                 : 'bg-[#132217] border-[#F4EFE6]/5 hover:bg-[#1C2C21]'
                             } ${unit.status !== 'AVAILABLE' ? 'opacity-50 cursor-not-allowed hover:bg-[#132217]' : ''}`}
                           >
                             {isRecommended && !isSelected && (
                               <div className="absolute -top-2.5 right-3 bg-[#B5966B] text-[#0A110C] text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm">
                                 RECOMMENDED
                               </div>
                             )}
                             {isSelected && (
                               <div className="absolute -top-2.5 right-3 bg-[#E74C3C] text-[#F4EFE6] text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm">
                                 SELECTED
                               </div>
                             )}
                             
                             <div className="flex justify-between items-start mb-2">
                               <div className="flex flex-col">
                                 <span className="text-sm font-bold text-[#F4EFE6]">{unit.name}</span>
                                 <span className="text-[10px] tracking-widest uppercase text-[#F4EFE6]/50">{unit.type}</span>
                               </div>
                               <span className={`text-[9px] tracking-widest uppercase font-bold px-2 py-0.5 rounded-sm ${
                                 unit.status === 'AVAILABLE' ? 'bg-[#5E7A63]/20 text-[#5E7A63]' : 'bg-[#F4EFE6]/10 text-[#F4EFE6]/50'
                               }`}>
                                 {unit.status}
                               </span>
                             </div>
                             
                             <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[#F4EFE6]/5">
                               <div className="flex flex-col">
                                 <span className="text-[9px] tracking-widest uppercase text-[#F4EFE6]/50 mb-0.5">DISTANCE</span>
                                 <span className="text-sm font-mono text-[#F4EFE6]">{unit.distance.toFixed(1)} <span className="text-[10px] text-[#F4EFE6]/50">km</span></span>
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-[9px] tracking-widest uppercase text-[#F4EFE6]/50 mb-0.5">EST. ETA</span>
                                 <span className="text-sm font-mono text-[#F4EFE6]">~{unit.eta} <span className="text-[10px] text-[#F4EFE6]/50">min</span></span>
                               </div>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   )}
                </section>

              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
      `}</style>
    </div>
  );
}
