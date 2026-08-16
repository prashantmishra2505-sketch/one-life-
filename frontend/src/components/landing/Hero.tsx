const Hero = ({ onReportClick, isCitizenAuth, isOfficerAuth }: { onReportClick?: () => void, isCitizenAuth?: boolean, isOfficerAuth?: boolean }) => {
  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('intelligence');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#18261C] text-[#F4EFE6] font-sans selection:bg-[#B5966B] selection:text-[#18261C]">
      {/* Background Media: Order is Solid Color -> Fallback Image -> Local Video */}
      <div className="absolute inset-0 z-0 bg-[#18261C]">
        {/* Layer 1: Reliable fallback image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 animate-ken-burns"
          style={{ backgroundImage: "url('/images/hero_bg.png')" }}
        />
        {/* Layer 2: Cinematic Video (NO external CDN fallback) */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          preload="metadata"
          poster="/images/hero_bg.png"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85] contrast-[1.05] saturate-[0.85] sepia-[0.1]"
        >
          {/* Primary local source expected at this path */}
          <source src="/videos/hero-forest.mp4" type="video/mp4" />
        </video>
        
        {/* Layer 3: Natural Color Grading - Earthy warmth + Soft blacks */}
        <div className="absolute inset-0 bg-[#B5966B]/10 mix-blend-color-burn" />
        <div className="absolute inset-0 bg-[#18261C]/15 mix-blend-overlay" />
        
        {/* Layer 4: Cinematic Gradients - Left side darker for text readability, right side clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A110C]/85 via-[#0F1812]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#18261C]/20 via-transparent to-[#0A110C]/85" />
      </div>

      {/* Subtle GIS/Topographic Grid Overlay - hidden layer of intelligence */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none mix-blend-overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#F4EFE6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-8 md:px-16 py-10 text-[#F4EFE6]">
        <div className="flex items-center gap-3">
          {/* Logo container to perfectly clip any outer artifact without altering the original asset */}
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#18261C]">
            <img 
              src="/images/vanlife-logo.png" 
              alt="वनLIFE Deer Tree Logo" 
              className="w-full h-full object-cover scale-[1.15]" 
            />
          </div>
          <span className="font-serif font-medium tracking-[0.15em] text-2xl text-[#F4EFE6] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAE0CC] rounded-sm transition-opacity hover:opacity-80">
            वनLIFE
          </span>
        </div>
        <div className="hidden md:flex gap-12 text-[11px] tracking-[0.25em] uppercase font-semibold">
          <a href="#intelligence" onClick={handleExploreClick} className="relative group py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAE0CC] rounded-sm transition-opacity hover:opacity-100 opacity-80 cursor-pointer">
            Intelligence
            <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#EAE0CC] transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 opacity-0 group-hover:opacity-100"></span>
          </a>
          
          {/* If they are an Officer, show Officer Dashboard */}
          {isOfficerAuth && (
            <button onClick={() => window.location.hash = '/officer'} className="relative group py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAE0CC] rounded-sm transition-opacity hover:opacity-100 opacity-80 cursor-pointer uppercase text-[11px] tracking-[0.25em] font-semibold text-[#E74C3C]">
              Officer Dashboard
              <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#EAE0CC] transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 opacity-0 group-hover:opacity-100"></span>
            </button>
          )}

          {/* If they are a Citizen, show My Profile */}
          {isCitizenAuth && (
            <button onClick={() => window.location.hash = '/profile'} className="relative group py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAE0CC] rounded-sm transition-opacity hover:opacity-100 opacity-80 cursor-pointer uppercase text-[11px] tracking-[0.25em] font-semibold text-[#B5966B]">
              My Profile
              <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#EAE0CC] transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 opacity-0 group-hover:opacity-100"></span>
            </button>
          )}

          {/* If they are NOT logged in, show the login links */}
          {!isOfficerAuth && !isCitizenAuth && (
            <>
              <button onClick={() => window.location.hash = '/login'} className="relative group py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAE0CC] rounded-sm transition-opacity hover:opacity-100 opacity-80 cursor-pointer uppercase text-[11px] tracking-[0.25em] font-semibold">
                Operations
                <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#EAE0CC] transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 opacity-0 group-hover:opacity-100"></span>
              </button>
              <button onClick={() => window.location.hash = '/citizen/login'} className="relative group py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAE0CC] rounded-sm transition-opacity hover:opacity-100 opacity-60 cursor-pointer uppercase text-[11px] tracking-[0.25em] font-semibold">
                Sign In
                <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#EAE0CC] transition-all duration-300 ease-out group-hover:w-full group-hover:left-0 opacity-0 group-hover:opacity-100"></span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 md:w-[85%] lg:w-[65%] xl:w-[55%]">
        
        {/* Organic Brand Detail / Botanical Divider */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-10 h-[1px] bg-[#F4EFE6]/40"></div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#F4EFE6]/70">
            <path d="M12 22C12 22 4 16 4 10C4 6.5 6.5 4 10 4C11.5 4 12 5 12 5C12 5 12.5 4 14 4C17.5 4 20 6.5 20 10C20 16 12 22 12 22Z" fill="currentColor"/>
          </svg>
          <div className="w-10 h-[1px] bg-[#F4EFE6]/40"></div>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.05] tracking-tight mb-8 animate-fade-in-up text-[#F4EFE6]" style={{ animationDelay: '0.4s' }}>
          CONNECT<br />
          CONSERVE<br />
          <span className="text-[#F4EFE6] opacity-90">PROTECT</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-[#F4EFE6]/80 font-light max-w-2xl mb-14 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          Turning wildlife observations into protected, actionable intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <button onClick={handleExploreClick} className="flex-1 sm:flex-none px-10 py-5 bg-[#EAE0CC] text-[#18261C] text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 ease-out hover:-translate-y-[1px] hover:scale-[1.01] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#EAE0CC] focus-visible:ring-offset-[#18261C] active:scale-[0.99] cursor-pointer">
            Explore वनLIFE
          </button>
          <button 
            onClick={onReportClick}
            className="flex-1 sm:flex-none px-10 py-5 bg-transparent border border-[#F4EFE6]/40 text-[#F4EFE6] text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 ease-out hover:-translate-y-[1px] hover:scale-[1.01] hover:bg-[#F4EFE6]/10 hover:border-[#F4EFE6]/70 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F4EFE6] focus-visible:ring-offset-[#18261C] active:scale-[0.99] cursor-pointer"
          >
            Report an Incident
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-pointer animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#F4EFE6] to-transparent animate-scroll-pulse origin-top"></div>
      </div>

      {/* Custom Styles for Animations & Reduced Motion */}
      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .animate-ken-burns {
          animation: ken-burns 40s ease-in-out infinite alternate;
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes scroll-pulse {
          0% { transform: scaleY(0.7); opacity: 0.3; }
          50% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(0.7); opacity: 0.3; }
        }
        .animate-scroll-pulse {
          animation: scroll-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-ken-burns {
            animation: none !important;
            transform: none !important;
          }
          .animate-fade-in-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .animate-scroll-pulse {
            animation: none !important;
            transform: none !important;
          }
          .hover\\:-translate-y-\\[1px\\]:hover {
            transform: none !important;
          }
          .hover\\:scale-\\[1\\.01\\]:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;
