import { useState } from 'react';
import { submitIncident } from '../services/api';
import type { ReportData } from '../services/api';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapTheme, MapThemeToggle } from '../components/map/MapThemeContext';
import { getCitizenToken } from '../utils/auth';

export default function ReportSubmit({ 
  reportData, 
  onEdit, 
  onCancel, 
  onComplete 
}: { 
  reportData: Partial<ReportData>,
  onEdit: (route: string) => void, 
  onCancel: () => void, 
  onComplete: (incidentId: string) => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tileUrl, mapClassName } = useMapTheme();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incidentId, setIncidentId] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate
    if (!reportData.category || !reportData.evidenceImage || !reportData.location) {
      setError("Please complete all required steps before submitting.");
      return;
    }

    const token = getCitizenToken();
    if (!token || token.length !== 40) {
      setError("Authentication error. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await submitIncident(reportData as ReportData, token);

    setIsSubmitting(false);

    if (result.success && result.incidentId) {
      setIncidentId(result.incidentId);
      setSubmitSuccess(true);
    } else {
      setError(result.error || "An unknown error occurred during submission.");
    }
  };

  const getCategoryName = (id: string) => {
    const categories: Record<string, string> = {
      'conflict': 'Human-Wildlife Conflict',
      'injured': 'Injured / Trapped Animal',
      'sighting': 'Wildlife Sighting',
      'illegal': 'Suspected Illegal Activity'
    };
    return categories[id] || id;
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] text-[#18261C] font-sans selection:bg-[#B5966B] selection:text-[#18261C] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-[#18261C] rounded-full flex items-center justify-center mb-8 animate-fade-in-up">
          <svg className="w-10 h-10 text-[#EAE0CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>REPORT RECEIVED</h1>
        <p className="text-lg text-[#18261C]/70 mb-8 max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Your observation has been securely recorded. We're preparing an AI-assisted assessment.
        </p>
        <div className="bg-[#18261C]/5 px-8 py-6 rounded-sm mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/50 mb-2">INCIDENT REFERENCE</span>
          <span className="block text-2xl font-serif text-[#18261C]">{incidentId}</span>
        </div>
        <button 
          onClick={() => onComplete(incidentId!)}
          className="px-12 py-5 bg-[#18261C] text-[#F4EFE6] text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm hover:bg-[#2A3E31] hover:-translate-y-[2px] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18261C] focus-visible:ring-offset-[#F4EFE6] animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          VIEW REPORT STATUS &rarr;
        </button>

        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            opacity: 0;
            animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#18261C] font-sans selection:bg-[#B5966B] selection:text-[#18261C] flex flex-col">
      {/* Header */}
      <header className="w-full px-8 md:px-16 py-8 border-b border-[#18261C]/10 flex items-center justify-between bg-[#F4EFE6] z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <img src="/images/vanlife-logo.png" alt="वनLIFE Logo" className="w-8 h-8 object-contain rounded-full" />
          <span className="font-serif font-medium tracking-[0.15em] text-xl text-[#18261C]">वनLIFE</span>
        </div>
        <button 
          onClick={onCancel}
          className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#18261C]/60 hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18261C] rounded-sm p-1"
        >
          Cancel Report
        </button>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col">
        {/* Botanical subtle detail */}
        <div className="flex items-center gap-3 mb-10 animate-fade-in-up">
          <div className="w-8 h-[1px] bg-[#B5966B]/60"></div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#B5966B]">
            <path d="M12 22C12 22 4 16 4 10C4 6.5 6.5 4 10 4C11.5 4 12 5 12 5C12 5 12.5 4 14 4C17.5 4 20 6.5 20 10C20 16 12 22 12 22Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="mb-14 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight mb-4 text-[#18261C]">
            REVIEW & SUBMIT
          </h1>
          <p className="text-lg text-[#18261C]/70 font-light max-w-2xl">
            Please verify the collected information before finalizing your report.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-6 md:gap-10 mb-16 overflow-x-auto pb-4 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 border-b-[3px] border-transparent pb-2 shrink-0 opacity-40">
            <span className="text-xs font-bold">01</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Incident</span>
          </div>
          <div className="flex items-center gap-3 border-b-[3px] border-transparent pb-2 shrink-0 opacity-40">
            <span className="text-xs font-bold">02</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Evidence</span>
          </div>
          <div className="flex items-center gap-3 border-b-[3px] border-transparent pb-2 shrink-0 opacity-40">
            <span className="text-xs font-bold">03</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Location</span>
          </div>
          <div className="flex items-center gap-3 border-b-[3px] border-[#18261C] pb-2 shrink-0">
            <span className="text-xs font-bold text-[#18261C]">04</span>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#18261C]">Submit</span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-sm animate-fade-in-up">
            <p className="text-[#E74C3C] text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Review Content */}
        <div className="flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          
          {/* Incident Review */}
          <div className="border border-[#18261C]/10 p-8 rounded-sm bg-white/40">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#18261C]/60">INCIDENT DETAILS</h3>
              <button onClick={() => onEdit('/report')} className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#B5966B] hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:underline">
                EDIT
              </button>
            </div>
            {reportData.category ? (
              <div className="mb-4">
                <span className="text-xl font-serif text-[#18261C]">{getCategoryName(reportData.category)}</span>
              </div>
            ) : (
              <div className="mb-4 text-[#E74C3C] text-sm">Missing Category</div>
            )}
            <div>
              <p className="text-[#18261C]/70 whitespace-pre-wrap">{reportData.description || <span className="italic opacity-50">No description provided.</span>}</p>
            </div>
          </div>

          {/* Evidence Review */}
          <div className="border border-[#18261C]/10 p-8 rounded-sm bg-white/40">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#18261C]/60">VISUAL EVIDENCE</h3>
              <button onClick={() => onEdit('/report/evidence')} className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#B5966B] hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:underline">
                RETAKE
              </button>
            </div>
            {reportData.evidenceImage ? (
              <div className="w-full max-w-sm aspect-video bg-[#0A110C] rounded-sm overflow-hidden border border-[#18261C]/10">
                <img src={reportData.evidenceImage} alt="Captured Evidence" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="text-[#E74C3C] text-sm">Missing Visual Evidence</div>
            )}
          </div>

          {/* Location Review */}
          <div className="border border-[#18261C]/10 p-8 rounded-sm bg-white/40">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#18261C]/60">LOCATION</h3>
              <button onClick={() => onEdit('/report/location')} className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#B5966B] hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:underline">
                CHANGE
              </button>
            </div>
            {reportData.location ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-1">LATITUDE</span>
                    <span className="text-[#18261C] font-medium">{reportData.location.lat.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-1">LONGITUDE</span>
                    <span className="text-[#18261C] font-medium">{reportData.location.lng.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-1">ACCURACY</span>
                    <span className="text-[#18261C] font-medium">± {Math.round(reportData.location.accuracy)} m</span>
                  </div>
                </div>
                <div className={`relative h-48 w-full bg-[#EAE0CC] z-0 overflow-hidden ${mapClassName}`}>
                  <MapThemeToggle />
                  <MapContainer 
                    center={[reportData.location.lat, reportData.location.lng]} 
                    zoom={15} 
                    scrollWheelZoom={false}
                    className="w-full h-full"
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false}
                  >
                    <TileLayer url={tileUrl} />
                    {reportData.location.accuracy && (
                      <Circle 
                        center={[reportData.location.lat, reportData.location.lng]}
                        radius={reportData.location.accuracy}
                        pathOptions={{ color: '#18261C', fillColor: '#18261C', fillOpacity: 0.1, weight: 1 }}
                      />
                    )}
                    <Marker 
                      position={[reportData.location.lat, reportData.location.lng]} 
                      icon={
                        L.divIcon({
                          className: 'bg-transparent border-none',
                          html: `<div class="w-4 h-4 bg-[#18261C] rounded-full shadow-lg border-2 border-[#F4EFE6]"></div>`,
                          iconSize: [16, 16],
                          iconAnchor: [8, 8],
                        })
                      }
                    />
                  </MapContainer>
                </div>
              </div>
            ) : (
              <div className="text-[#E74C3C] text-sm">Missing GPS Coordinates</div>
            )}
          </div>
          
        </div>

        {/* Navigation */}
        <div className="mt-16 pt-10 border-t border-[#18261C]/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={() => onEdit('/report/location')}
            className="w-full sm:w-auto px-8 py-4 text-[11px] tracking-[0.25em] font-bold uppercase text-[#18261C]/60 hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18261C] rounded-sm disabled:opacity-50"
            disabled={isSubmitting}
          >
            &larr; Back
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-12 py-5 text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18261C] focus-visible:ring-offset-[#F4EFE6]
              ${isSubmitting 
                ? 'bg-[#18261C]/50 text-[#F4EFE6] cursor-wait' 
                : 'bg-[#18261C] text-[#F4EFE6] hover:bg-[#2A3E31] hover:-translate-y-[2px] hover:shadow-lg'
              }`}
          >
            {isSubmitting ? 'SUBMITTING REPORT...' : 'SUBMIT REPORT \u2192'}
          </button>
        </div>

      </main>

      <style>{`
        .leaflet-container {
          background: #F4EFE6 !important;
          font-family: inherit;
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .hover\\:-translate-y-1:hover, .hover\\:-translate-y-\\[2px\\]:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
