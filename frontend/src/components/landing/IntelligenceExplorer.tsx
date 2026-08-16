import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapTheme, MapThemeToggle } from '../map/MapThemeContext';
import { fetchPublicIncidents } from '../../services/api';

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
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 1,
    type: 'SOS Alert',
    species: 'Unknown Species',
    risk: 'Critical',
    coords: [26.1542, 91.8758], // Assam / Kaziranga
    time: 'Today',
    desc: 'Immediate Response Required',
    region: 'Eastern Himalayas',
    statusLabel: 'ACTIVE ALERT'
  },
  {
    id: 2,
    type: 'Human-Wildlife Conflict',
    species: 'Leopard',
    risk: 'High',
    coords: [19.0760, 72.8777], // Near Mumbai/Sanjay Gandhi NP
    time: '14 min ago',
    desc: 'Village Boundary',
    region: 'Western Ghats',
    statusLabel: 'HIGH PRIORITY'
  },
  {
    id: 3,
    type: 'Wildlife Sighting',
    species: 'Bengal Tiger',
    risk: 'Low',
    coords: [23.2599, 77.4126], // Central India approx
    time: '42 min ago',
    desc: 'Camera Trap #42',
    region: 'Central India',
    statusLabel: 'RECENT OBSERVATION'
  },
  {
    id: 4,
    type: 'Observation',
    species: 'Elephant Herd Movement',
    risk: 'Medium',
    coords: [11.5946, 76.8880], // Bandipur/Mudumalai
    time: '2 hrs ago',
    desc: 'Herd Movement Detected',
    region: 'Nilgiri Biosphere',
    statusLabel: 'MONITORED'
  },
  {
    id: 5,
    type: 'Human-Wildlife Conflict',
    species: 'Leopard',
    risk: 'Low',
    coords: [29.3919, 79.4542], // Nainital / Kumaon
    time: '5 hrs ago',
    desc: 'Safely deterred from human settlement',
    region: 'Kumaon Region',
    statusLabel: 'RESOLVED'
  }
];

function MapController({ selectedCoords }: { selectedCoords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords) {
      map.flyTo(selectedCoords, 7, { duration: 1.5 });
    }
  }, [selectedCoords, map]);
  return null;
}

const IntelligenceExplorer = () => {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeTime, setActiveTime] = useState('24H');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | number | null>(null);
  
  const { tileUrl, mapClassName } = useMapTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPublicIncidents();
        const mapped = data.map((inc: any) => ({
          id: inc.id,
          type: inc.category === 'sos' ? 'SOS Alert' : inc.category === 'conflict' ? 'Human-Wildlife Conflict' : 'Observation',
          species: inc.ai_species || 'Unknown Species',
          risk: inc.risk_score > 75 ? 'Critical' : inc.risk_score > 50 ? 'High' : inc.risk_score > 25 ? 'Medium' : 'Low',
          coords: [inc.latitude, inc.longitude],
          time: new Date(inc.created_at).toLocaleDateString(),
          desc: inc.description || 'Citizen Report',
          region: 'Local Region',
          statusLabel: inc.status.toUpperCase()
        }));
        setIncidents(mapped.length > 0 ? mapped : MOCK_INCIDENTS);
      } catch (err) {
        console.error('Failed to fetch incidents', err);
      }
    };
    loadData();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // Category Filter
      if (activeCategory === 'OBSERVATIONS' && inc.type !== 'Observation' && inc.type !== 'Wildlife Sighting') return false;
      if (activeCategory === 'HUMAN-WILDLIFE CONFLICT' && !inc.type.includes('Conflict')) return false;
      if (activeCategory === 'HIGH RISK' && inc.risk !== 'High' && inc.risk !== 'Critical') return false;
      if (activeCategory === 'ACTIVE ALERTS' && !inc.type.includes('SOS')) return false;

      // Time Filter (mock implementation based on strings)
      if (activeTime === '24H' && inc.time.includes('days')) return false;
      if (activeTime === '7D' && inc.time.includes('month')) return false;

      // Search Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!inc.species.toLowerCase().includes(q) && 
            !inc.type.toLowerCase().includes(q) && 
            !(inc.region && inc.region.toLowerCase().includes(q))) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, activeCategory, activeTime, searchQuery]);

  // Calculate dynamic stats from all loaded incidents (not just filtered)
  const stats = useMemo(() => {
    return {
      observations: incidents.filter(i => i.type === 'Observation' || i.type === 'Wildlife Sighting').length,
      conflicts: incidents.filter(i => i.type.includes('Conflict')).length,
      highRisk: incidents.filter(i => i.risk === 'High' || i.risk === 'Critical').length,
      alerts: incidents.filter(i => i.type.includes('SOS')).length
    };
  }, [incidents]);

  const selectedIncident = useMemo(() => 
    incidents.find(inc => inc.id === selectedIncidentId) || null
  , [incidents, selectedIncidentId]);

  const handleFeedClick = (inc: Incident) => {
    setSelectedIncidentId(inc.id);
    document.getElementById('interactive-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const getMarkerColor = (type: string, isNew?: boolean) => {
    if (isNew) return 'bg-[#18261C] border-[#F4EFE6]';
    if (type === 'Observation' || type === 'Wildlife Sighting') return 'bg-[#B5966B] border-[#F4EFE6]';
    if (type.includes('Conflict')) return 'bg-[#D35400] border-[#F4EFE6]';
    return 'bg-[#E74C3C] border-[#F4EFE6]'; // SOS/Alert
  };

  return (
    <section id="intelligence" className="relative w-full py-24 bg-[#F4EFE6] text-[#18261C] font-sans selection:bg-[#18261C] selection:text-[#F4EFE6]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mb-16 mx-auto animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-serif leading-tight tracking-tight mb-6 text-[#18261C]">
            THE WILD IS ALWAYS MOVING.
          </h2>
          <p className="text-lg md:text-xl font-light text-[#18261C]/80 leading-relaxed">
            Explore wildlife observations, conflict activity and protected ecological intelligence.
          </p>
        </div>

        {/* Live Intelligence Summary */}
        <div className="flex flex-col mb-12 animate-fade-in-up">
          <div className="mb-4">
            <span className="inline-block px-2 py-1 bg-[#18261C]/5 text-[#18261C]/60 text-[9px] uppercase tracking-[0.2em] font-bold rounded-sm border border-[#18261C]/10">
              PROTOTYPE INTELLIGENCE SNAPSHOT
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div className="flex flex-col border-l-2 border-[#18261C]/20 pl-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/60 mb-1">Observations</span>
            <span className="text-3xl font-serif text-[#18261C]">{stats.observations}</span>
          </div>
          <div className="flex flex-col border-l-2 border-[#D35400]/40 pl-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D35400]/80 mb-1">Conflict Events</span>
            <span className="text-3xl font-serif text-[#D35400]">{stats.conflicts}</span>
          </div>
          <div className="flex flex-col border-l-2 border-[#E74C3C]/40 pl-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#E74C3C]/80 mb-1">High-Risk Areas</span>
            <span className="text-3xl font-serif text-[#E74C3C]">{stats.highRisk}</span>
          </div>
          <div className="flex flex-col border-l-2 border-[#E74C3C] pl-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#E74C3C] mb-1">Active Alerts</span>
            <span className="text-3xl font-serif text-[#E74C3C] animate-pulse">{stats.alerts}</span>
          </div>
        </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-white/50 p-4 rounded-sm border border-[#18261C]/10 animate-fade-in-up">
          
          <div className="flex flex-wrap gap-2 md:gap-4 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0">
            {['ALL', 'OBSERVATIONS', 'HUMAN-WILDLIFE CONFLICT', 'HIGH RISK', 'ACTIVE ALERTS'].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors whitespace-nowrap rounded-sm ${
                  activeCategory === cat 
                    ? 'bg-[#18261C] text-[#F4EFE6]' 
                    : 'bg-transparent text-[#18261C]/60 hover:bg-[#18261C]/5 hover:text-[#18261C]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
            <div className="flex bg-[#18261C]/5 rounded-sm p-1">
              {['24H', '7D', '30D'].map(time => (
                <button 
                  key={time}
                  onClick={() => setActiveTime(time)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all rounded-sm ${
                    activeTime === time ? 'bg-white shadow-sm text-[#18261C]' : 'text-[#18261C]/50 hover:text-[#18261C]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            
            <div className="relative flex-1 xl:w-64 max-w-sm">
              <input 
                type="text" 
                placeholder="Search species, region or incident..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#18261C]/10 rounded-sm py-2 px-4 text-sm font-light text-[#18261C] placeholder-[#18261C]/40 focus:outline-none focus:border-[#B5966B] focus:ring-1 focus:ring-[#B5966B]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#18261C]/40 hover:text-[#18261C]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Map Workspace */}
        <div id="interactive-map" className={`relative w-full h-[600px] md:h-[700px] bg-[#F4EFE6] rounded-sm overflow-hidden shadow-2xl border border-[#18261C]/10 animate-fade-in-up ${mapClassName}`}>
          
          <div className="absolute inset-0 z-0 map-filter-container">
            <MapThemeToggle />
            <MapContainer 
              center={[22.5, 79.5]} 
              zoom={5} 
              scrollWheelZoom={false}
              className="w-full h-full bg-[#F4EFE6]"
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url={tileUrl}
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              />
              
              <MapController selectedCoords={selectedIncident?.coords || null} />

              {filteredIncidents.map(inc => {
                const isSelected = selectedIncidentId === inc.id;
                return (
                  <Marker 
                    key={inc.id} 
                    position={inc.coords} 
                    eventHandlers={{
                      click: () => setSelectedIncidentId(inc.id)
                    }}
                    icon={
                      L.divIcon({
                        className: 'bg-transparent border-none outline-none',
                        html: `
                          <div class="relative flex items-center justify-center w-12 h-12 group cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-125' : 'hover:scale-110'}">
                            <div class="w-3.5 h-3.5 rounded-full z-10 shadow-lg ${getMarkerColor(inc.type, inc.isNew)} ${isSelected ? 'ring-2 ring-offset-2 ring-[#18261C]/30' : ''}"></div>
                            ${inc.type.includes('SOS') || inc.isNew || isSelected ? `<div class="absolute inset-0 rounded-full animate-ping opacity-60 ${getMarkerColor(inc.type, inc.isNew).split(' ')[0]}" style="animation-duration: 2s;"></div>` : ''}
                          </div>
                        `,
                        iconSize: [48, 48],
                        iconAnchor: [24, 24],
                      })
                    }
                  />
                )
              })}
            </MapContainer>
          </div>

          {/* Interactive Public-Safe Info Card */}
          {selectedIncident && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[380px] md:top-6 md:bottom-auto w-[90%] md:w-[320px] bg-white/95 backdrop-blur-xl border border-[#18261C]/10 p-6 rounded-sm shadow-2xl z-30 animate-fade-in-up">
              <button 
                onClick={() => setSelectedIncidentId(null)}
                className="absolute top-4 right-4 text-[#18261C]/40 hover:text-[#18261C] transition-colors"
              >
                ✕
              </button>

              <div className="mb-4">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#18261C]/50">INCIDENT TYPE</span>
                <p className="text-sm font-bold text-[#18261C] mt-0.5">{selectedIncident.type}</p>
              </div>

              <div className="mb-4">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#18261C]/50">SPECIES</span>
                <p className="text-sm font-medium text-[#18261C] mt-0.5">{selectedIncident.species}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#18261C]/50">STATUS</span>
                  <p className="text-xs font-medium text-[#18261C] mt-0.5">
                    {selectedIncident.statusLabel || (selectedIncident.type.includes('SOS') ? 'ACTIVE' : 'RESOLVED')}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#18261C]/50">REPORTED</span>
                  <p className="text-xs font-medium text-[#18261C] mt-0.5">{selectedIncident.time}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#18261C]/10">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#18261C]/50">REGION</span>
                <p className="text-xs font-medium text-[#18261C] mt-0.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-[#B5966B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {selectedIncident.region}
                </p>
              </div>
            </div>
          )}

          {/* Interactive Left Panel Feed (Desktop) */}
          <div className="hidden md:flex absolute top-0 bottom-0 left-0 w-[340px] bg-gradient-to-r from-white via-white/95 to-transparent p-6 flex-col z-20 overflow-y-auto shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#B5966B] rounded-full animate-pulse"></div>
                <span className="text-[#18261C] text-[10px] uppercase tracking-[0.25em] font-bold">Public Feed</span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredIncidents.length === 0 ? (
                <p className="text-sm text-[#18261C]/50 font-light italic">No public intelligence matches the current filters.</p>
              ) : (
                filteredIncidents.map((inc) => {
                  const isSelected = selectedIncidentId === inc.id;
                  return (
                    <button 
                      key={inc.id}
                      onClick={() => handleFeedClick(inc)}
                      className={`w-full text-left flex flex-col border-l-[3px] pl-4 py-3 transition-all duration-300 rounded-r-sm hover:bg-[#18261C]/5 ${
                        isSelected 
                          ? `bg-[#18261C]/5 ${inc.type === 'Observation' || inc.type === 'Wildlife Sighting' ? 'border-[#B5966B]' : inc.type.includes('Conflict') ? 'border-[#D35400]' : 'border-[#E74C3C]'}` 
                          : `border-transparent hover:border-[#18261C]/20`
                      }`}
                    >
                      <span className={`${inc.isNew ? 'text-[#18261C]' : inc.type === 'Observation' || inc.type === 'Wildlife Sighting' ? 'text-[#B5966B]' : inc.type.includes('Conflict') ? 'text-[#D35400]' : 'text-[#E74C3C]'} text-[9px] uppercase tracking-[0.2em] mb-1 font-bold`}>
                        {inc.isNew ? 'NEWLY REPORTED' : inc.statusLabel || inc.type}
                      </span>
                      <span className="text-[#18261C] text-sm font-bold tracking-wide">
                        {inc.type}
                      </span>
                      <span className="text-[#18261C]/60 text-[11px] mt-1 font-medium">{inc.species} • {inc.time}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive Left Panel Feed (Mobile horizontal scroll) */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#18261C]/10 p-4 z-20 flex overflow-x-auto gap-4 hide-scrollbar">
            {filteredIncidents.length === 0 ? (
                <p className="text-sm text-[#18261C]/50 font-light italic px-4 py-2">No results.</p>
              ) : (
              filteredIncidents.map(inc => (
                <button
                  key={inc.id}
                  onClick={() => handleFeedClick(inc)}
                  className={`flex-none w-64 text-left flex flex-col border-l-[3px] pl-4 py-2 bg-white rounded-r-sm shadow-sm ${
                    selectedIncidentId === inc.id ? (inc.type === 'Observation' || inc.type === 'Wildlife Sighting' ? 'border-[#B5966B]' : inc.type.includes('Conflict') ? 'border-[#D35400]' : 'border-[#E74C3C]') : 'border-[#18261C]/10'
                  }`}
                >
                  <span className={`text-[9px] uppercase tracking-[0.2em] mb-1 font-bold ${inc.type === 'Observation' || inc.type === 'Wildlife Sighting' ? 'text-[#B5966B]' : inc.type.includes('Conflict') ? 'text-[#D35400]' : 'text-[#E74C3C]'}`}>
                    {inc.isNew ? 'NEWLY REPORTED' : inc.statusLabel || inc.type}
                  </span>
                  <span className="text-[#18261C] text-sm font-bold truncate">{inc.species}</span>
                  <span className="text-[#18261C]/60 text-[11px] mt-0.5">{inc.time}</span>
                </button>
              ))
            )}
          </div>

        </div>

      </div>

      <style>{`
        /* Override leaflet defaults for a seamless light theme */
        .leaflet-container {
          background: #F4EFE6 !important;
          font-family: inherit;
        }
        
        /* Hide scrollbar for horizontal feed */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Animation */
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .animate-ping {
            animation: none !important;
            opacity: 0.3 !important;
          }
          .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default IntelligenceExplorer;
