import { useState, useRef, useEffect } from 'react';

export default function ReportEvidence({ 
  initialImage,
  onNext, 
  onCancel, 
  onBack 
}: { 
  initialImage?: string | null,
  onNext?: (image: string) => void, 
  onCancel?: () => void, 
  onBack?: () => void 
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialImage || null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [captureTime, setCaptureTime] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setIsInitializing(true);
    setError(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      // Wait for ref to attach
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('CAMERA ACCESS DENIED');
      } else {
        setError('CAMERA UNAVAILABLE');
      }
      console.error(err);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageUrl);
        setCaptureTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
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
            Capture clear visual evidence from a safe distance.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-6 md:gap-10 mb-16 overflow-x-auto pb-4 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 border-b-[3px] border-transparent pb-2 shrink-0 opacity-40">
            <span className="text-xs font-bold">01</span>
            <span className="text-xs uppercase tracking-widest font-semibold">Incident</span>
          </div>
          <div className="flex items-center gap-3 border-b-[3px] border-[#18261C] pb-2 shrink-0">
            <span className="text-xs font-bold text-[#18261C]">02</span>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#18261C]">Evidence</span>
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
        <div className="flex flex-col gap-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            
            {/* Camera Area */}
            <div className="relative w-full aspect-[4/3] md:aspect-video bg-[#0A110C] rounded-sm overflow-hidden shadow-2xl border border-[#18261C]/10 flex flex-col items-center justify-center">
              
              {!stream && !capturedImage && (
                <div className="flex flex-col items-center text-center p-8 z-10">
                  {error ? (
                    <>
                      <div className="w-16 h-16 bg-[#E74C3C]/10 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-[#E74C3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-[#F4EFE6] font-serif text-2xl mb-3">{error}</h3>
                      <p className="text-[#F4EFE6]/60 text-sm mb-8 max-w-xs">
                        Camera access is required for the live evidence flow. Please check your browser permissions.
                      </p>
                      <button 
                        onClick={startCamera}
                        className="px-8 py-3 bg-[#EAE0CC] text-[#18261C] text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-[#F4EFE6] transition-colors rounded-sm"
                      >
                        TRY AGAIN
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-[#F4EFE6]/5 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-[#F4EFE6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-[#F4EFE6] font-serif text-2xl mb-3">CAMERA ACCESS REQUIRED</h3>
                      <p className="text-[#F4EFE6]/60 text-sm mb-8 max-w-xs">
                        Use your camera to capture the wildlife evidence securely.
                      </p>
                      <button 
                        onClick={startCamera}
                        disabled={isInitializing}
                        className="px-8 py-3 bg-[#EAE0CC] text-[#18261C] text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-[#F4EFE6] transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isInitializing ? 'INITIALIZING...' : 'ENABLE CAMERA'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Live Preview */}
              {stream && !capturedImage && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Subtle Framing Guide */}
                  <div className="absolute inset-0 border-[1px] border-[#F4EFE6]/20 pointer-events-none m-8"></div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 border border-[#F4EFE6]/40 rounded-full opacity-50"></div>
                  </div>
                </>
              )}

              {/* Captured Image */}
              {capturedImage && (
                <>
                  <img src={capturedImage} alt="Captured Evidence" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A110C]/90 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-6 left-6 text-[#F4EFE6] pointer-events-none">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#B5966B] mb-1 block">EVIDENCE CAPTURED</span>
                    <span className="text-sm opacity-80">{captureTime || 'Previous Capture'}</span>
                  </div>
                </>
              )}

              {/* Hidden Canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Capture Controls */}
            {stream && !capturedImage && (
              <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <button 
                  onClick={capturePhoto}
                  className="group relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-[#18261C] hover:border-[#B5966B] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B5966B]"
                  aria-label="Capture Photo"
                >
                  <div className="w-14 h-14 bg-[#18261C] group-hover:bg-[#B5966B] rounded-full transition-colors duration-300"></div>
                </button>
                <div className="text-center mt-4 text-[10px] uppercase tracking-[0.2em] font-bold text-[#18261C]/60">
                  CAPTURE PHOTO
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-20 pt-10 border-t border-[#18261C]/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {capturedImage ? (
            <button 
              onClick={handleRetake}
              className="w-full sm:w-auto px-8 py-4 border border-[#18261C]/20 text-[11px] tracking-[0.25em] font-bold uppercase text-[#18261C] hover:bg-[#18261C]/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18261C] rounded-sm"
            >
              Retake
            </button>
          ) : (
            <button 
              onClick={onBack}
              className="w-full sm:w-auto px-8 py-4 text-[11px] tracking-[0.25em] font-bold uppercase text-[#18261C]/60 hover:text-[#18261C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18261C] rounded-sm"
            >
              Back
            </button>
          )}
          
          <button 
            disabled={!capturedImage}
            onClick={() => onNext && capturedImage && onNext(capturedImage)}
            className={`w-full sm:w-auto px-12 py-5 text-[11px] tracking-[0.25em] font-bold uppercase transition-all duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18261C] focus-visible:ring-offset-[#F4EFE6]
              ${capturedImage 
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
