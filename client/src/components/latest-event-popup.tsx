import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";

interface LatestEventPopupProps {
  events: Event[];
}

export function LatestEventPopup({ events }: LatestEventPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Get the latest event (most recently added)
  const latestEvent = events.length > 0 ? events[events.length - 1] : null;

  useEffect(() => {
    // Show popup after 2 seconds if there's a latest event and it hasn't been shown yet
    if (latestEvent && !hasBeenShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [latestEvent, hasBeenShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!latestEvent || !isVisible) {
    return null;
  }

  const getEventEmoji = (event: Event): string => {
    const title = event.title?.toLowerCase() || '';
    const category = event.category?.toLowerCase() || '';
    
    // Quick category-based emoji selection
    if (category.includes('kulinarik') || category.includes('🍽️')) return '🍽️';
    if (category.includes('sport') || category.includes('🧘')) return '🧘';
    if (category.includes('musik') || category.includes('🎵')) return '🎵';
    if (category.includes('shows') || category.includes('🍿')) return '🍿';
    if (category.includes('dating') || category.includes('❤️')) return '💕';
    if (category.includes('festivals') || category.includes('🃏')) return '🎪';
    
    return '📅';
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div
        className="rounded-2xl border border-white/20 shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getEventEmoji(latestEvent)}</span>
            <span className="text-white font-medium text-sm">Neues Event</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 rounded-full text-white/70 hover:text-white hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Content */}
        <div 
          className="p-3 cursor-pointer hover:bg-white/5 transition-colors rounded-b-2xl"
          onClick={() => window.open(latestEvent.website || '#', '_blank')}
        >
          <h4 className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2">
            {latestEvent.title}
          </h4>
          
          <div className="space-y-1 text-xs">
            {latestEvent.date && (
              <p className="text-white/80">
                📅 {new Date(latestEvent.date).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
                {latestEvent.time && ` um ${latestEvent.time}`}
              </p>
            )}
            
            {latestEvent.location && (
              <p className="text-white/70 truncate">
                📍 {latestEvent.location}
              </p>
            )}
            
            {latestEvent.organizer && (
              <p className="text-white/60 truncate">
                👤 {latestEvent.organizer}
              </p>
            )}
          </div>

          {/* Free badge */}
          {latestEvent.price && !isNaN(parseFloat(latestEvent.price)) && parseFloat(latestEvent.price) === 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                🆓 Kostenlos
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}