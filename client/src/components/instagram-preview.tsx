import { Instagram } from "lucide-react";

export function InstagramPreview() {
  return (
    <div className="mt-16 mb-8">
      <div className="liquid-glass-strong rounded-[2rem] p-8 border-0">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">
            Verfolge meine Reise zum Momentmillionär
          </h3>
          <p className="text-white/80 mb-6 drop-shadow-sm">
            Event-Recaps, Special Ankündigungen und ganz viele echte Momente
          </p>
          
          <div className="inline-flex items-center justify-center">
            <a
              href="https://instagram.com/cornelia.morgen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-brand-purple to-brand-orange text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <Instagram className="h-5 w-5" />
              <span>@cornelia.morgen</span>
            </a>
          </div>
          

        </div>
      </div>
    </div>
  );
}