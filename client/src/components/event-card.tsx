import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Clock, Euro, Ticket } from "lucide-react";
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
      className="group cursor-pointer liquid-glass-card rounded-[2rem] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 relative"
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
      {/* Free Event Emoji - only show when price is explicitly "0" as string */}
      {event.price === "0" && (
        <div className="absolute bottom-4 right-4 text-2xl">
          🆓
        </div>
      )}
      {/* Event Image */}
      {event.imageUrl && !imageError && (
        <div className="mb-4 overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
          <img
            src={event.imageUrl || ''}
            alt={event.title || 'Event'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="eager"
            decoding="async"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Image loading failed:', event.imageUrl);
              const img = e.target as HTMLImageElement;
              
              // Try without crossOrigin
              if (img.crossOrigin === "anonymous") {
                console.log('Retrying without crossOrigin...');
                img.crossOrigin = '';
                img.src = '';
                img.src = event.imageUrl || '';
                return;
              }
              
              // Try with different referrer policy
              if (!img.referrerPolicy || img.referrerPolicy === '') {
                console.log('Retrying with no-referrer policy...');
                img.referrerPolicy = "no-referrer";
                img.src = '';
                img.src = event.imageUrl || '';
                return;
              }
              
              console.log('All retry strategies failed, hiding image');
              setImageError(true);
            }}
          />
        </div>
      )}

      {/* Emoji Fallback when image fails to load */}
      {imageError && (
        <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          <span className="text-6xl">
            {(() => {
              const title = event.title?.toLowerCase() || '';
              const category = event.category?.toLowerCase() || '';
              
              if (title.includes('yoga') || title.includes('meditation') || category.includes('sport')) return '🧘';
              if (title.includes('food') || title.includes('essen') || title.includes('restaurant') || category.includes('kulinarik')) return '🍽️';
              if (title.includes('musik') || title.includes('music') || title.includes('konzert') || title.includes('band')) return '🎵';
              if (title.includes('kunst') || title.includes('art') || title.includes('galerie') || title.includes('ausstellung')) return '🎨';
              if (title.includes('kino') || title.includes('film') || title.includes('movie') || category.includes('shows')) return '🎬';
              if (title.includes('party') || title.includes('club') || title.includes('dance') || title.includes('dancing')) return '🎉';
              if (title.includes('markt') || title.includes('market') || title.includes('festival') || category.includes('märkte')) return '🎪';
              if (title.includes('workshop') || title.includes('kurs') || title.includes('seminar') || title.includes('lernen')) return '📚';
              if (title.includes('natur') || title.includes('outdoor') || title.includes('wandern') || title.includes('hiking')) return '🌿';
              if (title.includes('date') || title.includes('dating') || category.includes('dating')) return '💕';
              if (title.includes('kind') || title.includes('family') || title.includes('familie')) return '👨‍👩‍👧‍👦';
              
              return '🎊'; // Default fallback
            })()}
          </span>
        </div>
      )}

      {/* Emoji Fallback when no image URL exists */}
      {!event.imageUrl && (
        <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          <span className="text-6xl">
            {(() => {
              const title = event.title?.toLowerCase() || '';
              const category = event.category?.toLowerCase() || '';
              
              if (title.includes('yoga') || title.includes('meditation') || category.includes('sport')) return '🧘';
              if (title.includes('food') || title.includes('essen') || title.includes('restaurant') || category.includes('kulinarik')) return '🍽️';
              if (title.includes('musik') || title.includes('music') || title.includes('konzert') || title.includes('band')) return '🎵';
              if (title.includes('kunst') || title.includes('art') || title.includes('galerie') || title.includes('ausstellung')) return '🎨';
              if (title.includes('kino') || title.includes('film') || title.includes('movie') || category.includes('shows')) return '🎬';
              if (title.includes('party') || title.includes('club') || title.includes('dance') || title.includes('dancing')) return '🎉';
              if (title.includes('markt') || title.includes('market') || title.includes('festival') || category.includes('märkte')) return '🎪';
              if (title.includes('workshop') || title.includes('kurs') || title.includes('seminar') || title.includes('lernen')) return '📚';
              if (title.includes('natur') || title.includes('outdoor') || title.includes('wandern') || title.includes('hiking')) return '🌿';
              if (title.includes('date') || title.includes('dating') || category.includes('dating')) return '💕';
              if (title.includes('kind') || title.includes('family') || title.includes('familie')) return '👨‍👩‍👧‍👦';
              
              return '🎊'; // Default fallback
            })()}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Header with categories and date */}
        <div className="flex items-start justify-between">
          {/* Category Badges */}
          <div className="flex flex-wrap gap-2">
            {event.categories && event.categories.length > 0 ? (
              event.categories.map((category, index) => (
                <Badge key={index} className="bg-white/15 text-white border-white/25 text-xs px-3 py-1 w-fit">
                  {category}
                </Badge>
              ))
            ) : event.category && (
              <Badge className="bg-white/15 text-white border-white/25 text-xs px-3 py-1 w-fit">
                {event.category}
              </Badge>
            )}
          </div>
          
          {/* Date */}
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
              {event.organizer.includes(',') ? event.organizer.replace(/,/g, ' & ') : event.organizer}
            </p>
          )}
        </div>

        {/* Event Details - Mobile: horizontal row, Desktop: vertical stack */}
        <div className="text-sm text-white/80">
          <div className="lg:space-y-2">
            {/* Mobile horizontal layout - all items packed left without gaps */}
            <div className="flex items-center justify-start lg:hidden">
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs truncate max-w-[120px]">{event.location}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-1 ml-2">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs whitespace-nowrap">{event.time}</span>
                </div>
              )}
              {event.price && event.price !== "0" && (
                <div className="flex items-center gap-1 ml-2">
                  <Ticket className="h-3 w-3 flex-shrink-0 text-white" />
                  <span className="text-xs font-semibold text-white">€ {event.price && event.price.includes && event.price.includes('.') ? event.price.replace('.', ',') : event.price + ',00'}</span>
                </div>
              )}
            </div>
            
            {/* Desktop vertical layout */}
            <div className="hidden lg:block space-y-2">
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
              {event.price && event.price !== "0" && (
                <div className="flex items-center space-x-2">
                  <Ticket className="h-4 w-4 flex-shrink-0 text-white" />
                  <span className="font-semibold text-white">€ {event.price && event.price.includes && event.price.includes('.') ? event.price.replace('.', ',') : event.price + ',00'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">

          
          {/* Favorite Badge */}
          {event.isFavorite && (
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/40 font-bold text-xs px-3 py-1">
              💫 Conni's Favorit
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