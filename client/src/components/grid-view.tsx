import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Euro, Users, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Event } from "@shared/schema";
import { getCategoryEmojis } from "@/lib/category-utils";

interface GridViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export function GridView({ events, onEventClick }: GridViewProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => ({ ...prev, [eventId]: true }));
  };

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event, index) => {
        const eventDate = (() => {
          try {
            return event.date ? parseISO(event.date) : null;
          } catch (error) {
            console.error('Date parsing error:', error, event.date);
            return null;
          }
        })();

        // Check if event has any future dates (simplified since main date is now the next future date)
        const hasEventFutureDates = (() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Since we now process events to set the main date to the next future date,
          // we just need to check if the main date is in the future
          if (event.date) {
            const mainDate = new Date(event.date);
            return mainDate >= today;
          }
          
          return false;
        })();

        // Hide events with no future dates in grid view
        if (!hasEventFutureDates) {
          return null;
        }

        // Check if event is in the past
        const isEventPast = (() => {
          if (!event.date) return false;
          
          // Parse dates as local dates to avoid timezone issues
          const eventDateParts = event.date.split('-');
          const eventYear = parseInt(eventDateParts[0]);
          const eventMonth = parseInt(eventDateParts[1]) - 1; // Month is 0-indexed
          const eventDay = parseInt(eventDateParts[2]);
          
          const todayDate = new Date();
          const todayYear = todayDate.getFullYear();
          const todayMonth = todayDate.getMonth();
          const todayDay = todayDate.getDate();
          
          // Compare dates without time components
          if (eventYear < todayYear) return true;
          if (eventYear > todayYear) return false;
          if (eventMonth < todayMonth) return true;
          if (eventMonth > todayMonth) return false;
          return eventDay < todayDay;
        })();

        return (
          <div
            key={`${event.notionId}-${index}`}
            className={`rounded-[1.5rem] transition-all duration-500 cursor-pointer shadow-xl overflow-hidden relative group ${
              isEventPast ? 'opacity-60' : ''
            }`}
            style={{
              aspectRatio: '4/5', // Instagram post ratio
              background: isEventPast ? 'rgba(128, 128, 128, 0.15)' : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(30px) saturate(140%) brightness(1.1)',
              WebkitBackdropFilter: 'blur(30px) saturate(140%) brightness(1.1)',
              border: isEventPast ? '1px solid rgba(128, 128, 128, 0.25)' : '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25), 0 3px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
            }}
            onMouseEnter={(e) => {
              if (!isEventPast) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.backdropFilter = 'blur(35px) saturate(160%) brightness(1.15)';
                e.currentTarget.style.WebkitBackdropFilter = 'blur(35px) saturate(160%) brightness(1.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isEventPast) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.backdropFilter = 'blur(30px) saturate(140%) brightness(1.1)';
                e.currentTarget.style.WebkitBackdropFilter = 'blur(30px) saturate(140%) brightness(1.1)';
              }
            }}
            onClick={() => onEventClick?.(event)}
          >


            {/* Event Image Background */}
            <div className="absolute inset-0">
              {event.imageUrl && !imageErrors[event.notionId || ''] ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 blur-[1px] group-hover:blur-0"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Image failed to load:', event.imageUrl);
                    console.error('Image error event:', e);
                    handleImageError(event.notionId || '');
                    
                    // Try multiple fallback strategies
                    const target = e.target as HTMLImageElement;
                    const originalSrc = target.src;
                    
                    // Strategy 1: Remove URL parameters
                    const urlWithoutParams = event.imageUrl?.split('?')[0];
                    if (urlWithoutParams && urlWithoutParams !== originalSrc && !target.dataset.retried) {
                      console.log('Retrying with URL without parameters:', urlWithoutParams);
                      target.dataset.retried = 'true';
                      target.src = urlWithoutParams;
                      return;
                    }
                    
                    // Strategy 2: Try different cache-busting approach
                    if (!target.dataset.cacheBusted && event.imageUrl) {
                      console.log('Trying cache-busted version:', event.imageUrl);
                      target.dataset.cacheBusted = 'true';
                      target.src = event.imageUrl + (event.imageUrl.includes('?') ? '&' : '?') + 'cache=' + Date.now();
                      return;
                    }
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', event.imageUrl);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                  <span className="text-8xl opacity-30">{getEventEmoji(event)}</span>
                </div>
              )}
              {/* Enhanced gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
            </div>

            {/* Content overlay */}
            <div className="relative h-full flex flex-col justify-between p-4">
              {/* Top section with date and badges */}
              <div className="flex justify-between items-start">
                {/* Date badge */}
                {eventDate && (
                  <div className="bg-brand-blue/90 text-white rounded-xl px-3 py-2 text-center min-w-[60px] liquid-glass-button border-0">
                    <div className="text-xs font-medium uppercase">
                      {format(eventDate, "EE", { locale: de }).toUpperCase()}
                    </div>
                    <div className="text-lg font-bold">
                      {format(eventDate, "dd")}
                    </div>
                    <div className="text-xs">
                      {format(eventDate, "MMM", { locale: de }).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Free badge */}
                {(event.price === "0" || event.price === "" || !event.price || event.price === 0 || event.price === "0.00" || (event.price && parseFloat(event.price) === 0)) && (
                  <div className="bg-brand-lime/90 text-brand-black w-8 h-8 rounded-lg flex items-center justify-center text-lg">
                    🆓
                  </div>
                )}
              </div>

              {/* Bottom section with event details */}
              <div className="space-y-2">
                {/* Category emojis */}
                <div className="flex gap-1">
                  {getCategoryEmojis(event.categories).map((emoji, index) => (
                    <span key={index} className="text-lg">{emoji}</span>
                  ))}
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 tracking-tight" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)'}}>
                    {event.title}
                  </h3>
                  {event.organizer && (
                    <p className="text-xs text-white/70" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      {event.organizer}
                    </p>
                  )}
                </div>

                {/* Location and time */}
                <div className="space-y-1">
                  {event.location && (
                    <div className="flex items-center text-xs text-white/80" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      <MapPin className="mr-1 h-3 w-3" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                  {event.time && (
                    <div className="flex items-center text-xs text-white/80" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>

                {/* Additional dates for merged events */}
                {event.description && event.description.startsWith('Termine:') && (
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const termineMatch = event.description.match(/^Termine: ([^\n]+)/);
                      if (termineMatch) {
                        const dates = termineMatch[1].split(',').map(d => d.trim());
                        // Show first 2 additional dates
                        return dates.slice(1, 3).map((dateStr, index) => {
                          try {
                            const dateObj = new Date(dateStr);
                            return (
                              <Badge 
                                key={index} 
                                className="bg-brand-blue/20 text-white border-brand-blue/30 text-xs px-2 py-0.5"
                              >
                                {format(dateObj, "dd.MM", { locale: de })}
                              </Badge>
                            );
                          } catch (error) {
                            return (
                              <Badge 
                                key={index} 
                                className="bg-brand-blue/20 text-white border-brand-blue/30 text-xs px-2 py-0.5"
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
                )}

                {/* Price and attendees row */}
                <div className="flex justify-between items-center text-xs text-white/70 drop-shadow-sm">
                  {event.price && (
                    <span className="flex items-center">
                      <Euro className="mr-1 h-3 w-3" />
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
        );
      })}
    </div>
  );
}