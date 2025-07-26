import { useState, useEffect } from "react";

export function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [letterSpacing, setLetterSpacing] = useState(20);
  const [opacity, setOpacity] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const title = "momentmillionär";
  const tagline = "Dein Weg zu unvergesslichen Momenten in Graz";

  useEffect(() => {
    // Initial fade in
    setTimeout(() => setOpacity(1), 200);
    
    // Letter spacing animation - mehr dramatic
    setTimeout(() => {
      const spacingInterval = setInterval(() => {
        setLetterSpacing(prev => {
          if (prev <= 1) {
            clearInterval(spacingInterval);
            setCurrentStep(1);
            return 1;
          }
          return prev - 1;
        });
      }, 80);
    }, 1000);

    // Show content after letter animation
    setTimeout(() => {
      setShowContent(true);
      setCurrentStep(2);
    }, 3200);

    // Complete loading after a beautiful pause
    setTimeout(() => {
      setCurrentStep(3);
    }, 5500);

  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-2000"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 35%, #1e293b 70%, #0f172a 100%)',
        backgroundSize: '400% 400%',
        animation: currentStep < 3 ? 'gradientShift 8s ease-in-out infinite' : 'none',
        opacity: currentStep === 3 ? 0 : 1,
        pointerEvents: currentStep === 3 ? 'none' : 'all'
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center space-y-12 transition-all duration-1000"
        style={{ opacity }}
      >
        {/* Animated title with letter spacing */}
        <div className="text-center">
          <h1 
            className="text-6xl md:text-8xl text-white drop-shadow-2xl transition-all duration-1500 ease-out"
            style={{ 
              fontFamily: 'Connihof, system-ui, sans-serif',
              letterSpacing: `${letterSpacing}px`,
              transform: currentStep >= 1 ? 'scale(1)' : 'scale(1.15)',
              filter: currentStep >= 1 ? 'blur(0px)' : 'blur(3px)',
              textShadow: '0 0 30px rgba(212, 255, 29, 0.3), 0 0 60px rgba(147, 51, 234, 0.2)'
            }}
          >
            {title}
          </h1>
          
          {/* Tagline with staggered appearance */}
          <div 
            className="mt-6 text-white/70 text-xl md:text-2xl drop-shadow-lg transition-all duration-1000 delay-500"
            style={{ 
              opacity: currentStep >= 1 ? 1 : 0,
              transform: currentStep >= 1 ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            {tagline.split(' ').map((word, i) => (
              <span 
                key={i}
                className="inline-block transition-all duration-500"
                style={{ 
                  animationDelay: `${i * 200}ms`,
                  opacity: currentStep >= 1 ? 1 : 0,
                  transform: currentStep >= 1 ? 'translateY(0)' : 'translateY(10px)'
                }}
              >
                {word}{i < tagline.split(' ').length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Sophisticated loading elements */}
        <div 
          className="flex flex-col items-center space-y-8 transition-all duration-1000 delay-1000"
          style={{ 
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(30px)'
          }}
        >
          {/* Elegant progress bar */}
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-brand-lime to-brand-orange rounded-full transition-all duration-3000 ease-out"
              style={{ 
                width: currentStep >= 2 ? '100%' : '0%',
                boxShadow: '0 0 20px rgba(212, 255, 29, 0.5)'
              }}
            />
          </div>

          {/* Loading text with typewriter effect */}
          <div className="text-center">
            <p className="text-white/80 text-lg tracking-wide">
              {currentStep >= 2 ? 'E v e n t s   w e r d e n   g e l a d e n' : ''}
            </p>
            <p className="text-white/50 text-sm mt-2 tracking-wider">
              {currentStep >= 2 ? 'E i n e n   M o m e n t   b i t t e' : ''}
            </p>
          </div>

          {/* Floating liquid glass elements */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="h-20 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-1000"
                style={{
                  animationDelay: `${i * 300}ms`,
                  transform: showContent ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
                  opacity: showContent ? 1 : 0
                }}
              >
                <div className="p-4 space-y-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-white/20 to-transparent rounded-full transition-all duration-1000"
                    style={{ 
                      width: showContent ? '100%' : '0%',
                      animationDelay: `${i * 200}ms`
                    }}
                  />
                  <div 
                    className="h-1.5 bg-gradient-to-r from-white/15 to-transparent rounded-full transition-all duration-1000"
                    style={{ 
                      width: showContent ? '75%' : '0%',
                      animationDelay: `${i * 250}ms`
                    }}
                  />
                  <div 
                    className="h-1.5 bg-gradient-to-r from-white/10 to-transparent rounded-full transition-all duration-1000"
                    style={{ 
                      width: showContent ? '50%' : '0%',
                      animationDelay: `${i * 300}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Subtle rotating element */}
          <div className="relative">
            <div 
              className="w-8 h-8 border border-white/20 rounded-full animate-spin"
              style={{ animationDuration: '8s' }}
            />
            <div 
              className="absolute inset-0 w-8 h-8 border-t border-brand-lime rounded-full animate-spin"
              style={{ animationDuration: '3s' }}
            />
          </div>
        </div>
      </div>

      {/* Glow effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-900/30 pointer-events-none" />
    </div>
  );
}