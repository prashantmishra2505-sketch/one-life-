import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapTheme, MapThemeToggle } from '../components/map/MapThemeContext';

export default function ReportLocation({ 
  initialLocation,
  onNext, 
  onCancel, 
  onBack 
}: { 
  initialLocation?: { lat: number; lng: number; accuracy: number } | null,
  onNext?: (loc: { lat: number; lng: number; accuracy: number }) => void, 
  onCancel?: () => void, 
  onBack?: () => void 
}) {
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(initialLocation || null);
  const { tileUrl, mapClassName } = useMapTheme();
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = () => {
    setIsLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError({
        title: "LOCATION UNAVAILABLE",
        message: "Your browser does not support geolocation features."
      });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError({
            title: "LOCATION ACCESS DENIED",
            message: "Location is required to continue the incident report."
          });
        } else {
          setError({
            title: "WE COULDN'T GET YOUR LOCATION",
            message: "Please check location services and try again."
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

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

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col">
        {/* Botanical subtle detail */}
        <div className="flex items-center gap-3 mb-10 animate-fade-in-up">
          <div className="w-8 h-[1px] bg-[#B5966B]/60"></div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#B5966B]">
            <path d="M12 22C12 22 4 16 4 10C4 6.5 6.5 4 10 4C11.5 4 12 5 12 5C12 5 12.5 4 14 4C17.5 4 20 6.5 20 10C20 16 12 22 12 22Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="mb-14 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight mb-4 text-[#18261C]">
            CONFIRM YOUR LOCATION
          </h1>
          <p className="text-lg text-[#18261C]/70 font-light max-w-2xl">
            Your location helps responders understand where the incident was observed.
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
          <div className="flex items-center gap-3 border-b-[3px] border-[#18261C] pb-2 shrink-0">
            <span className="text-xs font-bold text-[#18261C]">03</span>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#18261C]">Location</span>
          </div>
          <div className="flex items-center gap-3 border-b-[3px] border-transparent pb-2 shrink-0 opacity-40">
            <span className="text-xs font-bold">04</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Submit</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          
          <div className="w-full mx-auto flex flex-col">
            
            {!location ? (
              <div className="relative w-full max-w-4xl h-[400px] md:h-[500px] bg-[#0A110C] rounded-sm overflow-hidden shadow-2xl border border-[#18261C]/10 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center text-center p-8 z-10 w-full h-full justify-center relative">
                  
                  {/* Subtle map visual placeholder background */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F4EFE6" strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      <path d="M-100,100 C100,120 200,200 250,300 C350,500 500,450 650,300 C800,150 900,100 1000,200" stroke="#EAE0CC" strokeWidth="1" strokeDasharray="5,5" fill="none" opacity="0.5"/>
                    </svg>
                  </div>

                  {error ? (
                    <>
                      <div className="w-16 h-16 bg-[#E74C3C]/10 rounded-full flex items-center justify-center mb-6 z-10">
                        <svg className="w-8 h-8 text-[#E74C3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-[#F4EFE6] font-serif text-2xl mb-3 z-10">{error.title}</h3>
                      <p className="text-[#F4EFE6]/60 text-sm mb-8 max-w-xs z-10">
                        {error.message}
                      </p>
                      <button 
                        onClick={requestLocation}
                        className="px-8 py-3 bg-[#EAE0CC] text-[#18261C] text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-[#F4EFE6] transition-colors rounded-sm z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAE0CC]"
                      >
                        TRY AGAIN
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-[#F4EFE6]/5 rounded-full flex items-center justify-center mb-6 z-10">
                        {isLocating ? (
                          <div className="w-8 h-8 rounded-full border-2 border-[#EAE0CC] border-t-transparent animate-spin"></div>
                        ) : (
                          <svg className="w-8 h-8 text-[#F4EFE6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-[#F4EFE6] font-serif text-2xl mb-3 z-10">
                        {isLocating ? "LOCATING YOU..." : "CONFIRM YOUR LOCATION"}
                      </h3>
                      <p className="text-[#F4EFE6]/60 text-sm mb-8 max-w-xs z-10">
                        {isLocating ? "Waiting for GPS signal securely." : "Enable GPS to log exactly where the incident occurred."}
                      </p>
                      <button 
                        onClick={requestLocation}
                        disabled={isLocating}
                        className="px-8 py-3 bg-[#EAE0CC] text-[#18261C] text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-[#F4EFE6] transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAE0CC]"
                      >
                        {isLocating ? 'PLEASE WAIT' : 'USE MY LOCATION'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-fade-in-up">
                
                {/* Map */}
                <div className={`lg:col-span-8 w-full h-[400px] md:h-[500px] rounded-sm overflow-hidden shadow-xl border border-[#18261C]/10 relative ${mapClassName}`}>
                  <MapThemeToggle />
                  <MapContainer 
                    center={[location.lat, location.lng]} 
                    zoom={16} 
                    scrollWheelZoom={true}
                    className="w-full h-full"
                    zoomControl={true}
                  >
                    <TileLayer url={tileUrl} />
                    <Circle 
                      center={[location.lat, location.lng]}
                      radius={location.accuracy}
                      pathOptions={{ color: '#18261C', fillColor: '#18261C', fillOpacity: 0.1, weight: 1 }}
                    />
                    <Marker 
                      position={[location.lat, location.lng]} 
                      icon={
                        L.divIcon({
                          className: 'bg-transparent border-none',
                          html: `
                            <div class="relative flex items-center justify-center w-8 h-8">
                              <div class="w-4 h-4 bg-[#18261C] rounded-full z-10 shadow-lg border-2 border-[#F4EFE6]"></div>
                              <div class="absolute inset-0 rounded-full animate-ping opacity-30 bg-[#18261C]"></div>
                            </div>
                          `,
                          iconSize: [32, 32],
                          iconAnchor: [16, 16],
                        })
                      }
                    >
                      <Tooltip permanent direction="top" offset={[0, -16]} className="custom-map-tooltip">
                        YOUR CAPTURED LOCATION
                      </Tooltip>
                    </Marker>
                  </MapContainer>
                </div>

                {/* Location Details Panel */}
                <div className="lg:col-span-4 flex flex-col justify-center bg-white/40 border border-[#18261C]/10 p-8 rounded-sm">
                  <span className="block text-[11px] uppercase tracking-[0.25em] font-bold text-[#18261C]/60 mb-8 border-b border-[#18261C]/10 pb-4">
                    LOCATION CAPTURED
                  </span>
                  
                  <div className="space-y-6 mb-10">
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-1">Latitude</span>
                      <span className="block text-2xl font-serif text-[#18261C]">{location.lat.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-1">Longitude</span>
                      <span className="block text-2xl font-serif text-[#18261C]">{location.lng.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-1">Accuracy</span>
                      <span className="block text-xl font-serif text-[#18261C]/80">± {Math.round(location.accuracy)} m</span>
                    </div>
                  </div>

                  <div className="bg-[#18261C]/5 inline-flex items-center gap-3 px-4 py-3 rounded-sm self-start">
                    <div className="w-2.5 h-2.5 bg-[#B5966B] rounded-full animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]">GPS CONFIRMED</span>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-16 pt-10 border-t border-[#18261C]/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-4 text-[11px] tracking-[0.25em] font-bold uppercase text-[#18261C]/60 hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18261C] rounded-sm"
          >
            &larr; Back
          </button>
          
          <button 
            disabled={!location}
            onClick={() => onNext && location && onNext(location)}
            className={`w-full sm:w-auto px-12 py-5 text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18261C] focus-visible:ring-offset-[#F4EFE6]
              ${location 
                ? 'bg-[#18261C] text-[#F4EFE6] hover:bg-[#2A3E31] hover:-translate-y-[2px] hover:shadow-lg' 
                : 'bg-[#18261C]/10 text-[#18261C]/40 cursor-not-allowed'
              }`}
          >
            Continue &rarr;
          </button>
        </div>

      </main>

      <style>{`
        .leaflet-container {
          background: #F4EFE6 !important;
          font-family: inherit;
          z-index: 0;
        }

        /* Tooltip styling */
        .custom-map-tooltip {
          background-color: rgba(24, 38, 28, 0.9);
          color: #F4EFE6;
          border: none;
          backdrop-filter: blur(8px);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 2px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }
        .custom-map-tooltip::before {
          border-top-color: rgba(24, 38, 28, 0.9) !important;
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
          .animate-spin {
            animation: none !important;
          }
          .animate-ping {
            animation: none !important;
          }
          .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
