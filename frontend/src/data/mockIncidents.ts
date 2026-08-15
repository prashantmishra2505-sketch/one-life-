export interface OfficerIncident {
  id: string | number;
  type: string;
  species: string;
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  coords: [number, number];
  time: string;
  desc: string;
  evidenceImage?: string;
  isNew?: boolean;
}

export const MOCK_OFFICER_INCIDENTS: OfficerIncident[] = [
  { id: 'INC-2026-616', type: 'Human-Wildlife Conflict', species: 'Leopard', riskLevel: 'HIGH', riskScore: 86, coords: [22.42, 79.25], time: '14 min ago', desc: 'Sighted near village boundary.' },
  { id: 'INC-2026-590', type: 'Injured Animal', species: 'Elephant', riskLevel: 'CRITICAL', riskScore: 92, coords: [22.61, 79.52], time: '1 hr ago', desc: 'Reported trapped in ditch.' },
  { id: 'INC-2026-502', type: 'Wildlife Sighting', species: 'Tiger', riskLevel: 'MEDIUM', riskScore: 45, coords: [22.51, 79.38], time: '3 hrs ago', desc: 'Moving deeper into core zone.' },
  { id: 'INC-2026-488', type: 'Suspected Illegal Activity', species: 'Unknown', riskLevel: 'HIGH', riskScore: 81, coords: [22.39, 79.45], time: '5 hrs ago', desc: 'Unidentified vehicle reported in protected zone.' },
];
