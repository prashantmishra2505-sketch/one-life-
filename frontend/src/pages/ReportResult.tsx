import { useEffect, useState } from 'react';
import { fetchIncidentDetail } from '../services/api';
import type { ReportData } from '../services/api';
import { getCitizenToken, getOfficerToken } from '../utils/auth';

export interface AIAnalysis {
  species: string;
  incidentType: string;
  severity: string;
  confidence: number;
  reasoning: string;
  recommendedAction: string;
  explanationPoints: string[];
  riskScore: number;
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
}

export default function ReportResult({
  reportData,
  incidentId,
  onBack,
  onNew
}: {
  reportData: Partial<ReportData>;
  incidentId: string | null;
  onBack: () => void;
  onNew: () => void;
}) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!incidentId) return;
      const token = getCitizenToken() || getOfficerToken();
      if (!token) return;
      try {
        const incident = await fetchIncidentDetail(incidentId, token);
        const confidenceValue = incident.ai_confidence ? parseFloat(incident.ai_confidence) : 0;
        const confidencePct = Math.round(confidenceValue * 100);
        const rScore = incident.risk_score || 0;
        let riskBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (rScore >= 8) riskBand = 'CRITICAL';
        else if (rScore >= 6) riskBand = 'HIGH';
        else if (rScore >= 4) riskBand = 'MEDIUM';

        const categoryNames: Record<string, string> = {
          'conflict': 'Human-Wildlife Conflict',
          'injured': 'Injured / Trapped Animal',
          'sighting': 'Wildlife Sighting',
          'illegal': 'Suspected Illegal Activity',
          'invasive': 'Invasive Species'
        };

        const analysisData: AIAnalysis = {
          species: incident.ai_species || (incident.category === 'invasive' ? 'Invasive Species' : (categoryNames[incident.category] || 'Unknown Subject')),
          incidentType: categoryNames[incident.category] || incident.category || 'Environmental Report',
          severity: riskBand,
          confidence: confidencePct,
          reasoning: incident.ai_removal_advice && incident.ai_removal_advice !== 'N/A' 
                     ? incident.ai_removal_advice 
                     : 'AI assessment complete. Evaluated based on visual evidence and context.',
          recommendedAction: riskBand === 'CRITICAL' || riskBand === 'HIGH' ? 'Immediate responder review recommended.' : 'Standard operating procedure review.',
          explanationPoints: [
            'Visual evidence parsed by AI models',
            'Context matching with report details',
            `Calculated Confidence: ${confidencePct}%`
          ],
          riskScore: rScore * 10,
          riskBand: riskBand,
          riskFactors: [
            `Reported Category: ${categoryNames[incident.category] || incident.category}`,
            `AI Risk Level: ${riskBand}`
          ]
        };
        setAnalysis(analysisData);
      } catch (e) {
        console.error("Failed to load real AI data", e);
      }
    }
    loadData();
  }, [incidentId, reportData.category]);

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#18261C] font-sans selection:bg-[#B5966B] selection:text-[#18261C] flex flex-col">
      {/* Header */}
      <header className="w-full px-8 md:px-16 py-8 border-b border-[#18261C]/10 flex items-center justify-between bg-[#F4EFE6] z-10 sticky top-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.location.hash = '/'}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && (window.location.hash = '/')}
        >
          <img src="/images/vanlife-logo.png" alt="वनLIFE Logo" className="w-8 h-8 object-contain rounded-full group-hover:scale-105 transition-transform" />
          <span className="font-serif font-medium tracking-[0.15em] text-xl text-[#18261C] group-hover:opacity-80 transition-opacity">वनLIFE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-[10px] tracking-[0.2em] font-bold uppercase text-[#18261C]/50 bg-[#18261C]/5 px-3 py-1.5 rounded-sm">
            AI ASSESSMENT READY
          </span>
          <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#18261C]/80">
            {incidentId || 'INC-PENDING'}
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col">
        {/* Title Section */}
        <div className="mb-16 animate-fade-in-up">
          <span className="block text-[11px] uppercase tracking-[0.25em] font-bold text-[#B5966B] mb-4">
            AI-ASSISTED ASSESSMENT
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight tracking-tight mb-6 text-[#18261C]">
            WHAT WE FOUND
          </h1>
          <p className="text-lg md:text-xl text-[#18261C]/70 font-light max-w-2xl mb-6">
            An initial AI-assisted interpretation of the evidence you submitted.
          </p>
          <div className="inline-flex items-start gap-3 bg-white/40 border border-[#18261C]/10 p-4 rounded-sm max-w-2xl">
            <svg className="w-5 h-5 text-[#B5966B] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-[#18261C]/60 leading-relaxed uppercase tracking-wider font-medium">
              AI results are probabilistic and should be reviewed by an authorized responder when action is required.
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Evidence */}
          <div className="lg:col-span-5 flex flex-col animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block text-[11px] uppercase tracking-[0.25em] font-bold text-[#18261C]/60 mb-6">
              SUBMITTED EVIDENCE
            </span>
            <div className="w-full aspect-[4/5] md:aspect-video lg:aspect-[4/5] bg-[#0A110C] rounded-sm overflow-hidden border border-[#18261C]/10 relative shadow-xl">
              {reportData.evidenceImage ? (
                <img 
                  src={reportData.evidenceImage} 
                  alt="Submitted incident evidence" 
                  className="w-full h-full object-cover transition-opacity duration-1000 opacity-0"
                  onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#F4EFE6]/30 p-8 text-center">
                  <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm uppercase tracking-widest font-bold">Image Unavailable</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Analysis */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            
            {/* Core Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/50 border border-[#18261C]/10 p-6 rounded-sm">
                <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-2">SPECIES</span>
                <span className="block text-xl font-serif text-[#18261C]">{analysis.species}</span>
              </div>
              <div className="bg-white/50 border border-[#18261C]/10 p-6 rounded-sm">
                <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-2">INCIDENT TYPE</span>
                <span className="block text-xl font-serif text-[#18261C]">{analysis.incidentType}</span>
              </div>
              <div className="bg-white/50 border border-[#18261C]/10 p-6 rounded-sm">
                <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40 mb-2">SEVERITY</span>
                <span className="inline-block text-sm uppercase tracking-widest font-bold text-[#E74C3C] bg-[#E74C3C]/10 px-3 py-1 rounded-sm mt-1">
                  {analysis.severity}
                </span>
              </div>
              <div className="bg-white/50 border border-[#18261C]/10 p-6 rounded-sm flex flex-col justify-center">
                <div className="flex justify-between items-end mb-3">
                  <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/40">MODEL CONFIDENCE</span>
                  <span className="block text-xl font-serif text-[#18261C]">{analysis.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#18261C]/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#B5966B] rounded-full transition-all duration-1500 ease-out"
                    style={{ width: `${analysis.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="bg-white/40 border border-[#18261C]/10 p-8 rounded-sm flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div>
                <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/50 mb-3">REASONING</span>
                <p className="text-[#18261C]/80 leading-relaxed text-lg">
                  "{analysis.reasoning}"
                </p>
              </div>
              <div className="pt-6 border-t border-[#18261C]/10">
                <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/50 mb-3">RECOMMENDED ACTION</span>
                <p className="text-[#18261C] font-medium text-lg">
                  {analysis.recommendedAction}
                </p>
              </div>
            </div>

            {/* Explanation Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#18261C]/60 mb-6 border-b border-[#18261C]/10 pb-4">
                WHY THIS ASSESSMENT?
              </h3>
              <ul className="space-y-4">
                {analysis.explanationPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B5966B] shrink-0 mt-2"></div>
                    <span className="text-[#18261C]/70 text-base">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Assessment */}
            <div className="bg-[#18261C] text-[#F4EFE6] p-8 rounded-sm mt-4 shadow-xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#B5966B] mb-2">
                    RISK ASSESSMENT
                  </h3>
                  <p className="text-xs text-[#F4EFE6]/50 max-w-sm">
                    Risk score is calculated separately from AI interpretation.
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">RISK BAND</span>
                  <span className="inline-block text-xs uppercase tracking-widest font-bold text-white bg-[#E74C3C] px-3 py-1 rounded-sm">
                    {analysis.riskBand}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex flex-col items-center justify-center shrink-0 w-32 h-32 rounded-full border-4 border-[#B5966B]/30 relative">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#F4EFE6]/50 absolute top-6">SCORE</span>
                  <span className="text-4xl font-serif text-[#F4EFE6] mt-4">{analysis.riskScore}</span>
                  <span className="text-[10px] text-[#F4EFE6]/30 absolute bottom-6">/ 100</span>
                  
                  {/* Subtle progress ring effect */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                      cx="64" cy="64" r="60" 
                      fill="transparent" 
                      stroke="#B5966B" 
                      strokeWidth="4" 
                      strokeDasharray="377" 
                      strokeDashoffset={377 - (377 * analysis.riskScore) / 100}
                      className="transition-all duration-1500 ease-out"
                    />
                  </svg>
                </div>
                
                <div className="flex-1 w-full">
                  <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-4">CONTRIBUTING FACTORS</span>
                  <ul className="space-y-3">
                    {analysis.riskFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[#F4EFE6]/80 text-sm">
                        <svg className="w-4 h-4 text-[#E74C3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-[#18261C]/10 flex flex-col sm:flex-row items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <button 
                onClick={onBack}
                className="w-full sm:w-auto px-12 py-5 bg-transparent border border-[#18261C] text-[#18261C] text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm hover:bg-[#18261C] hover:text-[#F4EFE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18261C] focus-visible:ring-offset-[#F4EFE6]"
              >
                VIEW REPORT STATUS &rarr;
              </button>
              <button 
                onClick={onNew}
                className="w-full sm:w-auto px-8 py-4 text-[10px] tracking-[0.2em] font-bold uppercase text-[#18261C]/60 hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                SUBMIT ANOTHER REPORT
              </button>
            </div>

          </div>
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
          .transition-all {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
