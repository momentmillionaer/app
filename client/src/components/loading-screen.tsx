import { useState, useEffect } from "react";

export function LoadingScreen() {
  const [currentImage, setCurrentImage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Die klassischen Gemälde von Artvee
  const paintings = [
    "/attached_assets/222401fgsdl_1753093711965.jpg",
    "/attached_assets/226718fgsdl_1753093711965.jpg", 
    "/attached_assets/228439fgsdl_1753093711965.jpg",
    "/attached_assets/244783fgsdl_1753093711966.jpg",
    "/attached_assets/245018fgsdl_1753093711966.jpg",
    "/attached_assets/509932ldsdl_1753093711966.jpg",
    "/attached_assets/540710ldsdl_1753093711966.jpg"
  ];

  useEffect(() => {
    // Zeige Titel nach kurzer Verzögerung
    setTimeout(() => setShowTitle(true), 500);

    // Bild-Rotation alle 800ms
    const imageInterval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % paintings.length);
    }, 800);

    // Progress Animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(imageInterval);
          setFadeOut(true);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => {
      clearInterval(imageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden transition-all duration-1000"
      style={{ 
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all'
      }}
    >
      {/* Klassisches Gemälde als Hintergrund */}
      <div className="absolute inset-0">
        <img
          src={paintings[currentImage]}
          alt="Classical painting"
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
          style={{
            filter: 'brightness(0.4) contrast(1.1) saturate(0.8)',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Minimalistischer Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        
        {/* Titel im Oscar Pico-Stil */}
        <div 
          className="text-center mb-16 transition-all duration-1000 ease-out"
          style={{
            opacity: showTitle ? 1 : 0,
            transform: showTitle ? 'translateY(0)' : 'translateY(30px)'
          }}
        >
          <h1 
            className="text-5xl md:text-7xl text-white mb-4 tracking-wider"
            style={{ 
              fontFamily: 'Connihof, serif',
              fontWeight: 'normal',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)'
            }}
          >
            momentmillionär
          </h1>
          <p className="text-white/70 text-lg md:text-xl tracking-wide font-light">
            Dein Weg zu unvergesslichen Momenten in Graz
          </p>
        </div>

        {/* Minimale Progress Bar */}
        <div className="w-80 md:w-96 space-y-6">
          <div className="h-px bg-white/20 relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress Text */}
          <div className="flex justify-between items-center text-white/60 text-sm font-mono">
            <span>Events werden geladen</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Eleganter Image Counter */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            {paintings.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: index === currentImage ? 'white' : 'rgba(255,255,255,0.3)',
                  transform: index === currentImage ? 'scale(1.2)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Subtile Corner Info */}
        <div className="absolute top-8 left-8 text-white/40 text-sm font-mono">
          {String(currentImage + 1).padStart(2, '0')} / {String(paintings.length).padStart(2, '0')}
        </div>

      </div>
    </div>
  );
}