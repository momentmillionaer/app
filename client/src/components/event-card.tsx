import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Euro, Users, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const eventDate = (() => {
    try {
      return event.date ? parseISO(event.date) : null;
    } catch (error) {
      console.error('Date parsing error:', error, event.date);
      return null;
    }
  })();

  // Function to get appropriate emoji based on event content
  const getEventEmoji = (event: Event): string => {
    const title = event.title?.toLowerCase() || '';
    const category = event.category?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';
    
    // Combine all text for analysis
    const fullText = `${title} ${category} ${description}`;
    
    // Food & Drinks
    if (fullText.includes('brunch') || fullText.includes('essen') || fullText.includes('kulinarik') || 
        fullText.includes('restaurant') || fullText.includes('küche') || fullText.includes('kochen')) {
      return '🍽️';
    }
    if (fullText.includes('wine') || fullText.includes('wein') || fullText.includes('bar') || 
        fullText.includes('cocktail') || fullText.includes('getränk')) {
      return '🍷';
    }
    if (fullText.includes('kaffee') || fullText.includes('coffee') || fullText.includes('café')) {
      return '☕';
    }
    
    // Sports & Activities
    if (fullText.includes('yoga') || fullText.includes('meditation') || fullText.includes('entspann')) {
      return '🧘';
    }
    if (fullText.includes('sport') || fullText.includes('fitness') || fullText.includes('lauf') || 
        fullText.includes('bike') || fullText.includes('rad')) {
      return '🏃';
    }
    if (fullText.includes('schwimm') || fullText.includes('pool') || fullText.includes('wasser')) {
      return '🏊';
    }
    
    // Culture & Arts
    if (fullText.includes('musik') || fullText.includes('konzert') || fullText.includes('band') || 
        fullText.includes('song') || fullText.includes('singen')) {
      return '🎵';
    }
    if (fullText.includes('theater') || fullText.includes('schauspiel') || fullText.includes('bühne')) {
      return '🎭';
    }
    if (fullText.includes('kunst') || fullText.includes('galerie') || fullText.includes('ausstellung') || 
        fullText.includes('maler')) {
      return '🎨';
    }
    if (fullText.includes('film') || fullText.includes('kino') || fullText.includes('movie')) {
      return '🎬';
    }
    
    // Dating & Social
    if (fullText.includes('dating') || fullText.includes('date') || fullText.includes('liebe') || 
        fullText.includes('partner') || category.includes('❤️')) {
      return '💕';
    }
    
    // Festivals & Events
    if (fullText.includes('festival') || fullText.includes('fest') || fullText.includes('markt') || 
        fullText.includes('feier')) {
      return '🎪';
    }
    
    // Education & Learning
    if (fullText.includes('workshop') || fullText.includes('kurs') || fullText.includes('lernen') || 
        fullText.includes('seminar') || fullText.includes('vortrag')) {
      return '📚';
    }
    
    // Business & Networking
    if (fullText.includes('business') || fullText.includes('networking') || fullText.includes('startup') || 
        fullText.includes('unternehmen')) {
      return '💼';
    }
    
    // Nature & Outdoor
    if (fullText.includes('natur') || fullText.includes('wandern') || fullText.includes('outdoor') || 
        fullText.includes('berg') || fullText.includes('wald')) {
      return '🌲';
    }
    
    // Technology
    if (fullText.includes('tech') || fullText.includes('digital') || fullText.includes('computer') || 
        fullText.includes('app') || fullText.includes('software')) {
      return '💻';
    }
    
    // Travel
    if (fullText.includes('reise') || fullText.includes('travel') || fullText.includes('urlaub') || 
        fullText.includes('ausflug')) {
      return '✈️';
    }
    
    // Health & Wellness
    if (fullText.includes('gesundheit') || fullText.includes('wellness') || fullText.includes('massage') || 
        fullText.includes('spa')) {
      return '💆';
    }
    
    // Default fallback emoji
    return '🎉';
  };

  return (
    <div 
      className="rounded-[2rem] transition-all duration-500 cursor-pointer shadow-xl overflow-hidden relative"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(30px) saturate(140%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(30px) saturate(140%) brightness(1.1)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25), 0 3px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
        e.currentTarget.style.backdropFilter = 'blur(35px) saturate(160%) brightness(1.15)';
        e.currentTarget.style.WebkitBackdropFilter = 'blur(35px) saturate(160%) brightness(1.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        e.currentTarget.style.backdropFilter = 'blur(30px) saturate(140%) brightness(1.1)';
        e.currentTarget.style.WebkitBackdropFilter = 'blur(30px) saturate(140%) brightness(1.1)';
      }}
      onClick={onClick}
    >
      {/* Website Link Button - iOS Control Center Style */}
      {event.website && (
        <div 
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-200 hover:scale-110 z-10"
          onClick={(e) => {
            e.stopPropagation();
            window.open(event.website, '_blank');
          }}
          title="Website öffnen"
        >
          <span className="text-lg">🔗</span>
        </div>
      )}
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Event Image - Left side, square */}
          {event.imageUrl && !imageError ? (
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded-2xl bg-white/10">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Image failed to load:', event.imageUrl);
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', event.imageUrl);
                }}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-5xl sm:text-6xl">{getEventEmoji(event)}</span>
            </div>
          )}

          {/* Date Column */}
          <div className="flex-shrink-0">
            {eventDate && (
              <>
                <div className="bg-brand-blue/90 text-white rounded-2xl p-4 text-center min-w-[80px] liquid-glass-button border-0">
                  <div className="text-xs font-medium uppercase">
                    {format(eventDate, "EE", { locale: de }).toUpperCase()}
                  </div>
                  <div className="text-xl font-bold">
                    {format(eventDate, "dd")}
                  </div>
                  <div className="text-xs">
                    {format(eventDate, "MMM", { locale: de }).toUpperCase()}
                  </div>
                </div>
                {event.time && (
                  <div className="text-center mt-2 text-sm text-white/70 drop-shadow-sm">
                    {event.time}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Event Details */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h3 className="text-xl font-semibold text-white drop-shadow-sm line-clamp-2 tracking-tight">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {(event.price === "0" || event.price === "" || !event.price || event.price === 0 || event.price === "0.00" || (event.price && parseFloat(event.price) === 0)) && (
                  <span className="text-lg flex items-center" title="Kostenlos">
                    🆓
                  </span>
                )}
                
                <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30">
                  {event.category}
                </Badge>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center text-sm text-white/80 mb-3 drop-shadow-sm">
                <MapPin className="mr-2 text-white/60 h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}

            {event.description && (
              <p className="text-white/75 text-sm line-clamp-3 mb-4 drop-shadow-sm font-normal">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 drop-shadow-sm">
              {event.price && (
                <span className="flex items-center">
                  <Euro className="mr-1 text-white/60 h-4 w-4" />
                  <span>{event.price}</span>
                </span>
              )}
              
              {event.attendees && (
                <span className="flex items-center">
                  <span>{event.attendees.replace(/,\s*/g, ' ')}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}