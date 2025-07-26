import { useState, useEffect } from "react";

export function LoadingScreen() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background overlay with liquid glass effect */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-2xl">
            momentmillionär
          </h1>
          <p className="text-white/70 text-lg mt-2 drop-shadow-lg">
            Dein Weg zu unvergesslichen Momenten in Graz
          </p>
        </div>

        {/* Loading animation */}
        <div className="flex flex-col items-center space-y-4">
          {/* Spinning loader */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-brand-lime rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-brand-orange rounded-full animate-spin opacity-60" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          
          {/* Loading text */}
          <div className="text-white/80 text-center">
            <p className="text-lg">Events werden geladen{dots}</p>
            <p className="text-sm text-white/60 mt-1">Einen Moment bitte</p>
          </div>
        </div>

        {/* Liquid glass cards with loading shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-24 rounded-[2rem] bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse ${i === 2 ? 'hidden md:block' : ''} ${i === 3 ? 'hidden md:block' : ''}`}>
              <div className="p-4 space-y-2">
                <div className="h-3 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                <div className="h-2 bg-white/15 rounded-full w-3/4 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}></div>
                <div className="h-2 bg-white/10 rounded-full w-1/2 animate-pulse" style={{ animationDelay: `${i * 0.4}s` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}