import { MOCK_OFFICER_INCIDENTS } from './mockIncidents';

export interface ResponseUnit {
  id: string;
  name: string;
  type: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFF-DUTY';
  coords: [number, number]; // [latitude, longitude]
}

// Dynamically determine the center based on the currently viewed incident
function getCenter(): [number, number] {
  try {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const match = hash.match(/\/officer\/incidents\/([^\/]+)/);
    if (match) {
      const id = match[1].replace('/sos', '');
      
      // Try local storage first (real citizen incidents)
      const stored = JSON.parse(localStorage.getItem('officer_incidents') || '[]');
      const foundStored = stored.find((inc: any) => String(inc.id) === String(id));
      if (foundStored && foundStored.coords) return foundStored.coords;
      
      // Fallback to mock incidents
      const foundMock = MOCK_OFFICER_INCIDENTS.find(inc => String(inc.id) === String(id));
      if (foundMock && foundMock.coords) return foundMock.coords;
    }
  } catch (e) {
    // ignore
  }
  return [22.5, 79.4];
}

// These mock coordinates dynamically position themselves around the active incident
export const MOCK_RESPONSE_UNITS: ResponseUnit[] = [
  {
    id: 'UNIT-004',
    name: 'Patrol Unit 4',
    type: 'Forest Patrol',
    status: 'AVAILABLE',
    get coords(): [number, number] {
      const c = getCenter();
      // ~2-5 km away. (approx 0.02 - 0.04 degrees offset)
      return [c[0] + 0.02, c[1] + 0.02];
    }
  },
  {
    id: 'UNIT-007',
    name: 'Patrol Unit 7',
    type: 'Forest Patrol',
    status: 'AVAILABLE',
    get coords(): [number, number] {
      const c = getCenter();
      // ~5-10 km away
      return [c[0] - 0.05, c[1] + 0.04];
    }
  },
  {
    id: 'UNIT-009',
    name: 'Air Unit 1',
    type: 'Air Support',
    status: 'AVAILABLE',
    get coords(): [number, number] {
      const c = getCenter();
      // ~10-20 km away
      return [c[0] + 0.10, c[1] - 0.08];
    }
  },
  {
    id: 'UNIT-002',
    name: 'Rapid Response Unit 2',
    type: 'Rapid Response',
    status: 'BUSY',
    get coords(): [number, number] {
      const c = getCenter();
      // Nearby but busy (~2.5km)
      return [c[0] - 0.01, c[1] - 0.02];
    }
  },
];
