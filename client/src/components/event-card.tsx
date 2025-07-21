import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Event } from "@shared/schema";
import { getCategoryEmojis } from "@/lib/category-utils";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const eventDate = (() => {
    try {
      return event.date ? parseISO(String(event.date)) : null;
    } catch (error) {
      console.error('Date parsing error:', error, event.date);
      return null;
    }
  })();

  // Check if event is in the past (using Vienna timezone)
  const isEventPast = (() => {
    if (!event.date) return false;
    
    // Parse dates as local dates to avoid timezone issues
    const eventDateParts = String(event.date).split('-');
    const eventYear = parseInt(eventDateParts[0]);
    const eventMonth = parseInt(eventDateParts[1]) - 1; // Month is 0-indexed
    const eventDay = parseInt(eventDateParts[2]);
    
    // Get current date in Vienna timezone
    const todayDate = new Date();
    const viennaDate = new Date(todayDate.toLocaleString("en-US", { timeZone: "Europe/Vienna" }));
    viennaDate.setHours(0, 0, 0, 0);
    
    const eventLocalDate = new Date(eventYear, eventMonth, eventDay);
    
    return eventLocalDate < viennaDate;
  })();

  // Simple card layout
  return (
    <div 
      className={`rounded-[2rem] transition-all duration-500 cursor-pointer shadow-xl overflow-hidden relative ${
        isEventPast ? 'opacity-60' : ''
      }`}
      style={{
        background: isEventPast ? 'rgba(128, 128, 128, 0.15)' : 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(30px) saturate(140%) brightness(1.1)',
        border: isEventPast ? '1px solid rgba(128, 128, 128, 0.25)' : '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25), 0 3px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        minHeight: '320px'
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        if (!isEventPast) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.backdropFilter = 'blur(35px) saturate(160%) brightness(1.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isEventPast) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.backdropFilter = 'blur(30px) saturate(140%) brightness(1.1)';
        }
      }}
      onClick={onClick}
    >
      {/* Website Link Button */}
      {event.website && (
        <div 
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-200 hover:scale-110 z-10"
          onClick={(e) => {
            e.stopPropagation();
            if (event.website) {
              window.open(event.website, '_blank');
            }
          }}
          title="Website öffnen"
        >
          <span className="text-lg">🔗</span>
        </div>
      )}
      
      <div className="p-4 flex flex-col h-full">
        {/* Image at top */}
        <div className="relative mb-4">
          <div className="aspect-[16/9] w-full">
            {event.imageUrl && !imageError ? (
              <div className="w-full h-full overflow-hidden rounded-xl bg-white/10">
                <img 
                  src={event.imageUrl || ''} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  onLoad={() => console.log('Image loaded successfully:', event.imageUrl)}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-4xl">🎉</span>
              </div>
            )}
          </div>
          
          {/* Date badge overlay */}
          {eventDate && (
            <div className="absolute top-3 left-3 bg-white/15 text-white rounded-2xl p-2 text-center min-w-[50px] backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/25 shadow-2xl drop-shadow-lg">
              <div className="text-xs font-medium uppercase leading-tight drop-shadow-sm">
                {format(eventDate, "EE", { locale: de }).toUpperCase()}
              </div>
              <div className="text-sm font-bold leading-tight drop-shadow-sm">
                {format(eventDate, "dd")}
              </div>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col">
          {/* Header with title and badges */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-2">
              {/* Event title */}
              <h3 className="text-white font-semibold text-lg leading-tight drop-shadow-sm mb-1 line-clamp-2">
                {event.title}
              </h3>
              
              {/* Subtitle */}
              {event.subtitle && (
                <p className="text-white/80 text-sm italic drop-shadow-sm mb-2 line-clamp-1">
                  {event.subtitle}
                </p>
              )}
              
              {/* Organizer */}
              {event.organizer && (
                <p className="text-white/70 text-sm drop-shadow-sm mb-2 line-clamp-1">
                  {event.organizer}
                </p>
              )}
              
              {/* Description text */}
              {event.description && event.description !== "Details" && !event.description.startsWith('Termine:') && (
                <p className="text-white/70 text-xs line-clamp-2 drop-shadow-sm mb-2">
                  {event.description}
                </p>
              )}
            </div>
            
            {/* Badges - right side */}
            <div className="flex gap-2 flex-shrink-0 items-center">
              {/* Favorite event emoji */}
              {event.isFavorite && (
                <span className="text-xl">💫</span>
              )}
              {/* Free event emoji */}
              {event.price && !isNaN(parseFloat(event.price)) && parseFloat(event.price) === 0 && (
                <span className="text-xl">🆓</span>
              )}
              {/* Category emojis */}
              <div className="flex gap-1">
                {getCategoryEmojis(event.categories || []).map((emoji, index) => (
                  <span key={index} className="text-xl">{emoji}</span>
                ))}
              </div>
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

          {/* Further dates section - ONLY FUTURE DATES */}
          {event.description && event.description.includes('Termine:') && (
            <div className="mt-auto">
              <div className="text-white/80 text-xs mb-2 drop-shadow-sm font-medium">
                📅 Weitere Termine:
              </div>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  // Extract dates from description using regex
                  const dateMatches = event.description?.match(/\d{1,2}\.\d{1,2}\.\d{4}/g) || []
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  
                  // Filter only future dates and limit to next 3
                  const futureDates = dateMatches
                    .map(dateStr => {
                      const [day, month, year] = dateStr.split('.')
                      return {
                        date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
                        original: dateStr
                      }
                    })
                    .filter(({ date }) => date >= today)
                    .slice(0, 3)
                  
                  const badges = futureDates.map(({ date }, index) => (
                    <Badge 
                      key={index} 
                      className="bg-white/15 text-white border-white/25 text-xs px-2 py-1"
                    >
                      {format(date, "dd. MMM", { locale: de })}
                    </Badge>
                  ))
                  
                  // Add "weitere Termine" badge if there are more future dates
                  const totalFutureDates = dateMatches
                    .map(dateStr => {
                      const [day, month, year] = dateStr.split('.')
                      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                    })
                    .filter(date => date >= today)
                  
                  if (totalFutureDates.length > 3) {
                    badges.push(
                      <Badge 
                        key="more" 
                        className="bg-white/10 text-white/70 border-white/20 text-xs px-2 py-1"
                      >
                        + weitere Termine
                      </Badge>
                    )
                  }
                  
                  return badges.length > 0 ? badges : null
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}