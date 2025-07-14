import { Calendar } from "lucide-react";
import logoImage from "@assets/Unbenannt-1-02_1752488253396.png";

interface HeaderProps {
  eventCount: number;
  lastUpdated: string;
}

export function Header({ eventCount, lastUpdated }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50 rounded-b-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src={logoImage} 
              alt="Momentmillionär Logo" 
              className="w-10 h-10 mr-3 rounded-lg object-cover shadow-sm"
            />
            <h1 className="text-xl font-bold text-brand-black">Momentmillionär</h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-brand-black bg-brand-lime px-4 py-2 rounded-full font-medium shadow-sm">{eventCount} Events</span>
            <div className="w-px h-6 bg-gray-300"></div>
            <span className="text-sm text-gray-600">
              Letzte Aktualisierung: <span>{lastUpdated}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
