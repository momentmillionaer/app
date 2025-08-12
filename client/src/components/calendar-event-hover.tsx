import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Event } from '@/../../shared/schema';
import { MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { getCategoryEmojis } from '@/lib/category-utils';

interface CalendarEventHoverProps {
  event: Event;
  children: React.ReactNode;
  onEventClick: (event: Event) => void;
}

export function CalendarEventHover({ event, children, onEventClick }: CalendarEventHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const getEventEmoji = (event: Event): string => {
    const fullText = `${event.title} ${event.description} ${event.category}`.toLowerCase();
    
    // Food & Drinks
    if (fullText.includes('brunch') || fullText.includes('essen') || fullText.includes('food') || 
        fullText.includes('restaurant') || fullText.includes('kulinarik')) {
      return '🍽️';
    }
    
    // Music & Entertainment
    if (fullText.includes('konzert') || fullText.includes('musik') || fullText.includes('jazz') || 
        fullText.includes('band') || fullText.includes('dj')) {
      return '🎵';
    }
    
    // Art & Culture
    if (fullText.includes('kunst') || fullText.includes('galerie') || fullText.includes('museum') || 
        fullText.includes('ausstellung') || fullText.includes('kultur')) {
      return '🎨';
    }
    
    // Sports & Activities
    if (fullText.includes('sport') || fullText.includes('fitness') || fullText.includes('laufen') || 
        fullText.includes('yoga') || fullText.includes('wandern')) {
      return '🏃';
    }
    
    // Nightlife & Entertainment
    if (fullText.includes('bar') || fullText.includes('club') || fullText.includes('party') || 
        fullText.includes('cocktail') || fullText.includes('nightlife')) {
      return '🍸';
    }
    
    // Festivals & Events
    if (fullText.includes('festival') || fullText.includes('fest') || fullText.includes('markt') || 
        fullText.includes('feier')) {
      return '🎪';
    }
    
    // Default fallback emoji
    return '🎉';
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Preview card dimensions
    const previewWidth = 320; // 80 * 4 (w-80 in Tailwind)
    const previewHeight = 300; // Estimated height
    const gap = 2; // Very small gap between event and preview
    
    // Start with position right next to the event
    let x = rect.left + rect.width / 2 - previewWidth / 2;
    let y = rect.top + scrollY + rect.height + gap;
    
    // Ensure preview stays within screen bounds horizontally
    const margin = 10;
    if (x < margin) {
      x = margin;
    } else if (x + previewWidth > window.innerWidth - margin) {
      x = window.innerWidth - previewWidth - margin;
    }
    
    // Ensure preview stays within screen bounds vertically
    if (y + previewHeight > window.innerHeight + scrollY - margin) {
      // Show above the event instead
      y = rect.top + scrollY - previewHeight - gap;
      // If still doesn't fit, position at top of screen
      if (y < scrollY + margin) {
        y = scrollY + margin;
      }
    }
    
    setHoverPosition({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Small delay to prevent flicker when moving mouse between event and preview
    setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  const eventDate = event.date ? new Date(event.date) : null;
  const isEventPast = eventDate ? eventDate < new Date() : false;

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Hover Preview Card - Portal to body */}
      {isHovered && createPortal(
        <div
          className="fixed z-[99999] w-80 pointer-events-none"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
            transform: 'none'
          }}
        >
          <div
            className="rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(30px) saturate(140%) brightness(1.2)',
              WebkitBackdropFilter: 'blur(30px) saturate(140%) brightness(1.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="p-4">
              {/* Event Image */}
              <div className="w-full h-32 mb-3 overflow-hidden rounded-xl">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      console.log('Image loading failed, hiding image for hover preview');
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center">
                    <span className="text-4xl">{getEventEmoji(event)}</span>
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white drop-shadow-sm line-clamp-2">
                  {event.title}
                </h3>
                
                {event.subtitle && (
                  <p className="text-sm text-white/80 drop-shadow-sm italic">
                    {event.subtitle}
                  </p>
                )}
                
                {event.organizer && (
                  <p className="text-sm text-white/70 drop-shadow-sm">
                    {event.organizer}
                  </p>
                )}

                {/* Location and Time */}
                <div className="flex items-center gap-3 text-sm text-white/80">
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3 text-white/60" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                  {event.time && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3 text-white/60" />
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>

                {/* Category emojis and Price */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {getCategoryEmojis(event.categories || []).map((emoji, index) => (
                      <span key={index} className="text-lg">{emoji}</span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {event.price && !isNaN(parseFloat(event.price)) && parseFloat(event.price) === 0 && (
                      <span className="text-sm">🆓</span>
                    )}
                    {event.price && event.price !== "0" && event.price !== "" && parseFloat(event.price) > 0 && (
                      <span className="text-sm text-white/80">€{event.price}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}