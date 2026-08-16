import React, { createContext, useContext, useState } from 'react';

export type MapTheme = 'light' | 'forest';

interface MapThemeContextType {
  theme: MapTheme;
  setTheme: (theme: MapTheme) => void;
  tileUrl: string;
  mapClassName: string;
}

const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const FOREST_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const MapThemeContext = createContext<MapThemeContextType | undefined>(undefined);

export function MapThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MapTheme>(() => {
    // 1. Initialize from localStorage
    const saved = localStorage.getItem('map_theme');
    // 2. Strict validation, fallback to 'light'
    if (saved === 'forest') return 'forest';
    return 'light'; // First-time user, missing key, or 'light' all default to 'light'
  });

  const setTheme = (newTheme: MapTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('map_theme', newTheme);
  };

  const tileUrl = theme === 'light' ? LIGHT_TILE_URL : FOREST_TILE_URL;
  const mapClassName = theme === 'light' ? 'map-theme-light' : 'map-theme-forest';

  return (
    <MapThemeContext.Provider value={{ theme, setTheme, tileUrl, mapClassName }}>
      {children}
      {/* Global CSS for the Map Themes */}
      <style>{`
        .map-theme-light {
          background-color: #F4EFE6 !important;
        }
        .map-theme-forest {
          background-color: #0C160F !important;
        }
        .map-theme-forest .leaflet-tile-pane {
          filter: sepia(0.2) hue-rotate(95deg) saturate(0.8) brightness(1.05) contrast(1.1);
        }
        .map-theme-forest .leaflet-control-zoom a {
          background-color: #132217 !important;
          color: #F4EFE6 !important;
          border-color: rgba(244, 239, 230, 0.1) !important;
        }
        .map-theme-forest .leaflet-control-zoom a:hover {
          background-color: #18261C !important;
        }
      `}</style>
    </MapThemeContext.Provider>
  );
}

export function useMapTheme() {
  const context = useContext(MapThemeContext);
  if (context === undefined) {
    throw new Error('useMapTheme must be used within a MapThemeProvider');
  }
  return context;
}

export function MapThemeToggle() {
  const { theme, setTheme } = useMapTheme();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex items-center bg-[#F4EFE6] border border-[#18261C]/20 rounded-sm overflow-hidden shadow-lg font-sans transition-colors">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:bg-black/5 ${
          theme === 'light' 
            ? 'bg-[#EAE0CC] text-[#18261C]' 
            : 'bg-transparent text-[#18261C]/50 hover:bg-[#18261C]/5 hover:text-[#18261C]'
        }`}
      >
        <span className="text-sm leading-none">&#9728;</span> LIGHT
      </button>
      <div className="w-px h-4 bg-[#18261C]/10"></div>
      <button
        onClick={() => setTheme('forest')}
        className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:bg-black/5 ${
          theme === 'forest' 
            ? 'bg-[#18261C] text-[#F4EFE6]' 
            : 'bg-transparent text-[#18261C]/50 hover:bg-[#18261C]/5 hover:text-[#18261C]'
        }`}
      >
        <span className="text-[8px] leading-none">&#9679;</span> FOREST
      </button>
    </div>
  );
}
