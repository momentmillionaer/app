export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Copyright */}
          <div className="text-white/80 text-sm drop-shadow-sm">
            © momentmillionär
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-6">
            <a 
              href="#impressum" 
              className="text-white/70 hover:text-white text-sm transition-colors duration-200"
            >
              Impressum
            </a>
            <a 
              href="#kontakt" 
              className="text-white/70 hover:text-white text-sm transition-colors duration-200"
            >
              Kontakt
            </a>
          </div>
          
          {/* Tagline */}
          <div className="text-white/60 text-xs drop-shadow-sm">
            Dein Weg zu unvergesslichen Momenten in Graz
          </div>
        </div>
      </div>
    </footer>
  );
}