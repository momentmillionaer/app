import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Event } from "@shared/schema";
import { getCategoryEmojis } from "@/lib/category-utils";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  view?: string;
}

export function EventCard({ event, onClick, view = "list" }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const eventDate = (() => {
    try {
      return event.date ? parseISO(String(event.date)) : null;
    } catch (error) {
      console.error('Date parsing error:', error, event.date);
      return null;
    }
  })();

  // Function to generate emoji based on event content
  const getEventEmoji = (event: Event): string => {
    const title = event.title.toLowerCase();
    const category = event.category?.toLowerCase() || '';
    
    // Check for specific keywords and categories
    if (category.includes('dating') || category.includes('❤️')) return '❤️';
    if (category.includes('festivals') || category.includes('🃏')) return '🎉';
    if (category.includes('musik') || title.includes('konzert') || title.includes('musik')) return '🎵';
    if (category.includes('sport') || title.includes('sport')) return '⚽';
    if (category.includes('kunst') || title.includes('kunst') || title.includes('galerie')) return '🎨';
    if (category.includes('theater') || title.includes('theater')) return '🎭';
    if (category.includes('kino') || title.includes('film')) return '🎬';
    if (category.includes('essen') || title.includes('restaurant') || title.includes('food')) return '🍽️';
    if (category.includes('nacht') || title.includes('party') || title.includes('club')) return '🌙';
    if (category.includes('markt') || title.includes('markt')) return '🛍️';
    if (category.includes('workshop') || title.includes('workshop')) return '🛠️';
    if (category.includes('konferenz') || title.includes('meeting')) return '👥';
    if (title.includes('weihnacht') || title.includes('christmas')) return '🎄';
    if (title.includes('silvester') || title.includes('new year')) return '🎆';
    if (title.includes('outdoor') || title.includes('wandern')) return '🏞️';
    
    return '📅'; // Default calendar emoji
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer liquid-glass-card rounded-[2rem] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%) brightness(1.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...(event.isFavorite && {
          border: '2px solid rgba(147, 51, 234, 0.3)',
          background: 'rgba(147, 51, 234, 0.05)',
        })
      }}
    >
      {/* Event Image */}
      {event.imageUrl && !imageError && (
        <div className="mb-4 overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      <div className="space-y-4">
        {/* Header with emoji and date */}
        <div className="flex items-start justify-between">
          <span className="text-3xl flex-shrink-0">
            {getEventEmoji(event)}
          </span>
          {eventDate && (
            <div className="text-right">
              <p className="text-white font-semibold text-sm">
                {format(eventDate, "EEE", { locale: de })}
              </p>
              <p className="text-white font-bold text-lg leading-none">
                {format(eventDate, "dd. MMM", { locale: de })}
              </p>
            </div>
          )}
        </div>

        {/* Event Title */}
        <div>
          <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-brand-lime transition-colors duration-200">
            {event.title}
          </h3>
          {event.subtitle && (
            <p className="text-white/80 italic text-sm mt-1 line-clamp-1">
              {event.subtitle}
            </p>
          )}
          {event.organizer && (
            <p className="text-white/70 text-sm mt-1">
              von {event.organizer}
            </p>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-white/80">
          {event.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {event.time && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{event.time}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {/* Free Event Badge */}
          {event.price && !isNaN(parseFloat(event.price)) && parseFloat(event.price) === 0 && (
            <Badge className="bg-brand-lime/20 text-brand-lime border-brand-lime/40 font-bold text-xs px-3 py-1">
              🆓 GRATIS
            </Badge>
          )}
          
          {/* Category Badge */}
          {event.categories && event.categories.length > 0 && (
            <Badge className="bg-white/15 text-white border-white/25 text-xs px-3 py-1">
              {event.categories[0]}
            </Badge>
          )}
        </div>

        {/* Additional Dates (if multi-date event) */}
        {event.description && event.description.startsWith('Termine:') && (() => {
          const termineMatch = event.description.match(/^Termine: ([^\n]+)/);
          if (termineMatch) {
            const dateMatches = termineMatch[1].split(',').map(d => d.trim());
            
            // Filter to future dates only
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const futureDates = dateMatches.filter(dateStr => {
              if (dateStr) {
                const eventDate = new Date(dateStr);
                return eventDate >= today;
              }
              return false;
            });
            
            if (futureDates.length > 1) {
              const displayDates = view === "grid" ? futureDates.slice(1, 4) : futureDates.slice(1, 6);
              const badges = displayDates.map((dateStr, index) => {
                const date = new Date(dateStr);
                return (
                  <Badge 
                    key={index} 
                    className="bg-white/15 text-white border-white/25 text-xs px-2 py-1"
                  >
                    {format(date, "dd. MMM", { locale: de })}
                  </Badge>
                );
              });
              
              // Add "weitere Termine" badge if there are more dates
              if (futureDates.length > (view === "grid" ? 4 : 6)) {
                badges.push(
                  <Badge 
                    key="more" 
                    className="bg-white/10 text-white/70 border-white/20 text-xs px-2 py-1"
                  >
                    + weitere Termine
                  </Badge>
                );
              }
              
              return (
                <div className="flex flex-wrap gap-2 mt-3">
                  {badges}
                </div>
              );
            }
          }
          return null;
        })()}
      </div>
    </div>
  );
}