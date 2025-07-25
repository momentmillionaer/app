import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Event hinzufügen Button */}
          <div className="mb-4">
            <Button
              onClick={() => window.open('https://tally.so/r/m606Pk', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-8 py-3 font-semibold transition-all duration-300 shadow-lg liquid-glass"
            >
              <Plus className="h-5 w-5 mr-2" />
              Event hinzufügen
            </Button>
          </div>

          {/* Copyright */}
          <div className="text-white/80 text-sm drop-shadow-sm">
            © momentmillionär
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-6">
            <a 
              href="https://www.morgen.co.at/impressum" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white text-sm transition-colors duration-200"
            >
              Impressum
            </a>
            <a 
              href="mailto:cornelia@morgen.co.at" 
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