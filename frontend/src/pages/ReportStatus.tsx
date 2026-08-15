
export default function ReportStatus({
  incidentId,
  onNext,
  onBack
}: {
  incidentId: string | null;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#18261C] font-sans selection:bg-[#B5966B] selection:text-[#18261C] flex flex-col">
      <header className="w-full px-8 md:px-16 py-8 border-b border-[#18261C]/10 flex items-center justify-between bg-[#F4EFE6] z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <img src="/images/vanlife-logo.png" alt="वनLIFE Logo" className="w-8 h-8 object-contain rounded-full" />
          <span className="font-serif font-medium tracking-[0.15em] text-xl text-[#18261C]">वनLIFE</span>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-serif leading-tight tracking-tight mb-8 text-[#18261C] animate-fade-in-up">
          REPORT STATUS
        </h1>

        <div className="w-full bg-[#18261C] text-[#F4EFE6] p-8 rounded-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-left w-full md:w-auto">
            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">Incident Reference</span>
            <span className="block text-xl font-serif text-[#F4EFE6]">{incidentId || 'INC-PENDING'}</span>
          </div>
          <div className="text-left w-full md:text-right border-t md:border-t-0 md:border-l border-[#F4EFE6]/20 pt-6 md:pt-0 md:pl-6 md:w-auto">
            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#F4EFE6]/50 mb-1">Current Status</span>
            <span className="block text-xl font-serif text-[#B5966B]">RECEIVED</span>
          </div>
        </div>

        <div className="w-full bg-white/40 border border-[#18261C]/10 p-8 rounded-sm text-left mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold mb-8 text-[#18261C]/60">TIMELINE</h3>
          <ul className="space-y-8 relative">
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#18261C] text-[#F4EFE6] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-[#18261C] font-medium text-lg">Report submitted</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#18261C] text-[#F4EFE6] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-[#18261C] font-medium text-lg">Evidence captured</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#18261C] text-[#F4EFE6] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-[#18261C] font-medium text-lg">Location confirmed</span>
            </li>
            <li className="flex items-start gap-4 relative">
              <div className="absolute top-[-24px] left-3 w-[2px] h-[32px] bg-[#18261C]/20 -z-10"></div>
              <div className="absolute top-[-72px] left-3 w-[2px] h-[32px] bg-[#18261C]/20 -z-10"></div>
              <div className="absolute top-[-120px] left-3 w-[2px] h-[32px] bg-[#18261C]/20 -z-10"></div>
              
              <div className="w-6 h-6 rounded-full bg-[#F4EFE6] border-2 border-[#18261C]/30 flex items-center justify-center shrink-0 mt-0.5 z-10">
                <div className="w-2 h-2 rounded-full bg-[#B5966B] animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-[#18261C]/80 font-medium text-lg flex items-center gap-2">
                  AI assessment pending
                  <svg className="w-4 h-4 text-[#B5966B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <span className="text-[#18261C]/60 text-sm mt-2 max-w-sm leading-relaxed">
                  Your report has been received and is being prepared for AI-assisted assessment.
                </span>
              </div>
            </li>
          </ul>
        </div>

        <div className="w-full flex flex-col gap-6 items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={onNext}
            className="w-full sm:w-auto px-12 py-5 bg-[#18261C] text-[#F4EFE6] text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm hover:bg-[#2A3E31] hover:-translate-y-[2px] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18261C] focus-visible:ring-offset-[#F4EFE6]"
          >
            VIEW AI ASSESSMENT &rarr;
          </button>
          <button 
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-4 text-[10px] tracking-[0.2em] font-bold uppercase text-[#18261C]/60 hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            &larr; BACK TO REPORT
          </button>
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
          .hover\\:-translate-y-[2px]:hover {
            transform: none !important;
          }
          .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
