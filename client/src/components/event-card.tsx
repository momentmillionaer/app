import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Clock } from "lucide-react";
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
      
      <div className="pl-6 pr-6 pt-6 pb-6 flex gap-4 h-full">
        {/* Event Image - Left side with date overlay */}
        <div className="flex-shrink-0 w-32 sm:w-40 relative h-full">
          {event.imageUrl && !imageError ? (
            <div className="w-full h-full overflow-hidden rounded-xl bg-white/10">
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
            <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-6xl">{getEventEmoji(event)}</span>
            </div>
          )}
          
          {/* Date badge overlay - liquid glass design */}
          {eventDate && (
            <div className="absolute top-3 left-3 bg-white/15 text-white rounded-2xl p-3 text-center min-w-[60px] backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/25 shadow-2xl drop-shadow-lg">
              <div className="text-xs font-medium uppercase leading-tight drop-shadow-sm">
                {format(eventDate, "EE", { locale: de }).toUpperCase()}
              </div>
              <div className="text-lg font-bold leading-tight drop-shadow-sm">
                {format(eventDate, "dd")}
              </div>
              <div className="text-xs leading-tight drop-shadow-sm">
                {format(eventDate, "MMM", { locale: de }).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Content section - Right side */}
        <div className="flex-grow flex flex-col justify-between min-w-0">
          {/* Top section with title and badges aligned */}
          <div className="flex justify-between items-start gap-3 mb-4">
            {/* Title and organizer - left side */}
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-white drop-shadow-sm line-clamp-2 tracking-tight mb-2">
                {event.title}
              </h3>
              {event.organizer && (
                <p className="text-sm text-white/70 drop-shadow-sm mb-2">
                  {event.organizer}
                </p>
              )}
              
              {/* Description text - between organizer and location */}
              {event.description && event.description !== "Details" && !event.description.startsWith('Termine:') && (
                <p className="text-white/70 text-xs line-clamp-2 drop-shadow-sm mb-2">
                  {event.description}
                </p>
              )}
            </div>
            
            {/* Badges - right side */}
            <div className="flex gap-2 flex-shrink-0">
              {(event.price === "0" || event.price === "" || !event.price || event.price === 0 || event.price === "0.00" || (event.price && parseFloat(event.price) === 0)) && (
                <Badge className="bg-brand-blue/90 text-white border-brand-blue/30 text-xs font-medium px-2 py-1">
                  FREE
                </Badge>
              )}
              <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30 text-xs">
                {event.category}
              </Badge>
            </div>
          </div>

          {/* Location, time and price */}
          <div className="flex items-center gap-4 text-sm text-white/80 mb-4">
            {event.location && (
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4 text-white/60" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
            {event.time && (
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-white/60" />
                <span>{event.time}</span>
              </div>
            )}
            {event.price && event.price !== "0" && event.price !== "" && parseFloat(event.price) > 0 && (
              <div className="flex items-center">
                <span className="mr-1 text-white/60">€</span>
                <span>{event.price}</span>
              </div>
            )}
          </div>



          {/* Additional dates section */}
          {event.description && event.description.startsWith('Termine:') && (
            <div className="mb-3">
              <div className="text-white/80 text-xs mb-2 drop-shadow-sm font-medium">
                📅 Weitere Termine:
              </div>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const termineMatch = event.description.match(/^Termine: ([^\n]+)/);
                  if (termineMatch) {
                    const dates = termineMatch[1].split(',').map(d => d.trim());
                    return dates.slice(1, 3).map((dateStr, index) => {
                      try {
                        const dateObj = new Date(dateStr);
                        return (
                          <Badge 
                            key={index} 
                            className="bg-white/15 text-white border-white/25 text-xs px-2 py-1"
                          >
                            {format(dateObj, "dd.MM", { locale: de })}
                          </Badge>
                        );
                      } catch (error) {
                        return (
                          <Badge 
                            key={index} 
                            className="bg-white/15 text-white border-white/25 text-xs px-2 py-1"
                          >
                            {dateStr}
                          </Badge>
                        );
                      }
                    });
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}