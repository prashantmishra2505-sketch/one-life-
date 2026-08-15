import { useState } from 'react';

const CATEGORIES = [
  {
    id: 'conflict',
    title: 'Human-Wildlife Conflict',
    desc: 'Property damage, livestock loss, or direct encounter.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  {
    id: 'injured',
    title: 'Injured / Trapped Animal',
    desc: 'An animal requiring immediate medical or rescue assistance.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  {
    id: 'sighting',
    title: 'Wildlife Sighting',
    desc: 'Log a rare or general observation of local species.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  },
  {
    id: 'illegal',
    title: 'Suspected Illegal Activity',
    desc: 'Poaching, illegal logging, or snare deployment.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  }
];

export default function ReportIncident({ 
  initialCategory,
  initialDescription,
  onNext, 
  onCancel 
}: { 
  initialCategory?: string | null,
  initialDescription?: string,
  onNext?: (data: { category: string, description: string }) => void, 
  onCancel?: () => void 
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [description, setDescription] = useState(initialDescription || '');

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#18261C] font-sans selection:bg-[#B5966B] selection:text-[#18261C] flex flex-col">
      {/* Simple header */}
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
            REPORT A WILDLIFE INCIDENT
          </h1>
          <p className="text-lg text-[#18261C]/70 font-light">
            Help us understand what you witnessed.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-6 md:gap-10 mb-16 overflow-x-auto pb-4 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 border-b-[3px] border-[#18261C] pb-2 shrink-0">
            <span className="text-xs font-bold text-[#18261C]">01</span>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#18261C]">Incident</span>
          </div>
          <div className="flex items-center gap-3 border-b-[3px] border-transparent pb-2 shrink-0 opacity-40">
            <span className="text-xs font-bold">02</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Evidence</span>
          </div>
          <div className="flex items-center gap-3 border-b-[3px] border-transparent pb-2 shrink-0 opacity-40">
            <span className="text-xs font-bold">03</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Location</span>
          </div>
          <div className="flex items-center gap-3 border-b-[3px] border-transparent pb-2 shrink-0 opacity-40">
            <span className="text-xs font-bold">04</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Submit</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold mb-6 text-[#18261C]/60">Select Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left p-8 rounded-sm border transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18261C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE6]
                      ${isSelected 
                        ? 'border-[#18261C] bg-[#18261C] text-[#F4EFE6] shadow-xl scale-[1.01]' 
                        : 'border-[#18261C]/15 bg-white/40 hover:bg-white hover:border-[#18261C]/40 text-[#18261C] hover:-translate-y-1 hover:shadow-md'
                      }`}
                  >
                    <div className={`mb-5 transition-colors duration-300 ${isSelected ? 'text-[#B5966B]' : 'text-[#18261C]/50 group-hover:text-[#18261C]'}`}>
                      {cat.icon}
                    </div>
                    <h4 className="font-serif text-xl font-medium mb-3">{cat.title}</h4>
                    <p className={`text-sm leading-relaxed ${isSelected ? 'text-[#F4EFE6]/70' : 'text-[#18261C]/60'}`}>
                      {cat.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] uppercase tracking-[0.25em] font-bold mb-6 text-[#18261C]/60">Tell us what happened</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you saw, where it happened, and anything that may help a responder."
              className="w-full h-48 bg-white/60 border border-[#18261C]/15 rounded-sm p-6 text-[#18261C] text-lg placeholder:text-[#18261C]/40 focus:outline-none focus:ring-2 focus:ring-[#18261C] focus:bg-white resize-none transition-all duration-300 shadow-inner"
            />
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-20 pt-10 border-t border-[#18261C]/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto px-8 py-4 text-[11px] tracking-[0.25em] font-bold uppercase text-[#18261C]/60 hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18261C] rounded-sm"
          >
            Back
          </button>
          
          <button 
            disabled={!selectedCategory}
            onClick={() => onNext && selectedCategory && onNext({ category: selectedCategory, description })}
            className={`w-full sm:w-auto px-12 py-5 text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18261C] focus-visible:ring-offset-[#F4EFE6]
              ${selectedCategory 
                ? 'bg-[#18261C] text-[#F4EFE6] hover:bg-[#2A3E31] hover:-translate-y-[2px] hover:shadow-lg' 
                : 'bg-[#18261C]/10 text-[#18261C]/40 cursor-not-allowed'
              }`}
          >
            Continue &rarr;
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
