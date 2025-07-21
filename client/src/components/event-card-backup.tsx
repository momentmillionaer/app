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

  // Check if event has any future dates (using Vienna timezone)
  const hasEventFutureDates = (() => {
    // Get current date in Vienna timezone
    const todayDate = new Date();
    const viennaDate = new Date(todayDate.toLocaleString("en-US", { timeZone: "Europe/Vienna" }));
    viennaDate.setHours(0, 0, 0, 0);
    
    // Since we now process events to set the main date to the next future date,
    // we just need to check if the main date is in the future
    if (event.date) {
      const mainDate = new Date(event.date);
      return mainDate >= viennaDate;
    }
    
    return false;
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
    const todayYear = viennaDate.getFullYear();
    const todayMonth = viennaDate.getMonth();
    const todayDay = viennaDate.getDate();
    
    // Compare dates without time components
    if (eventYear < todayYear) return true;
    if (eventYear > todayYear) return false;
    if (eventMonth < todayMonth) return true;
    if (eventMonth > todayMonth) return false;
    return eventDay < todayDay;
  })();

  // Hide events with no future dates in list and grid views
  if ((viewMode === 'list' || viewMode === 'grid') && !hasEventFutureDates) {
    return null;
  }

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

  // Default card layout - simplified version without viewMode logic
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
        
        <div className="p-4 flex flex-col h-full">
          {/* Image at top - Banner aspect ratio (16:9) */}
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
                    onError={(e) => {
                      console.error('Image failed to load:', event.imageUrl);
                      
                      // First fallback: try URL without parameters
                      const urlWithoutParams = event.imageUrl.split('?')[0];
                      if (e.currentTarget.src !== urlWithoutParams && !e.currentTarget.dataset.retried) {
                        console.log('Retrying with URL without parameters:', urlWithoutParams);
                        e.currentTarget.dataset.retried = 'true';
                        e.currentTarget.src = urlWithoutParams;
                        return;
                      }
                      
                      // Final fallback: use emoji instead
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', event.imageUrl);
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl">{getEventEmoji(event)}</span>
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
                <div className="text-xs leading-tight drop-shadow-sm">
                  {format(eventDate, "MMM", { locale: de }).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Category Emojis above title */}
          <div className="flex items-center gap-2 mb-2">
            {/* Favorite event emoji */}
            {event.isFavorite && (
              <span className="text-lg">💫</span>
            )}
            {/* Free event emoji */}
            {event.price && !isNaN(parseFloat(event.price)) && parseFloat(event.price) === 0 && (
              <span className="text-lg">🆓</span>
            )}
            {/* Category emojis */}
            <div className="flex gap-1">
              {getCategoryEmojis(event.categories || []).map((emoji, index) => (
                <span key={index} className="text-lg">{emoji}</span>
              ))}
            </div>
          </div>

          {/* Title and content */}
          <div className="flex-grow pb-12"> {/* Padding bottom for link button */}
            <h3 className="text-base font-semibold text-white drop-shadow-sm line-clamp-2 tracking-tight mb-1">
              {event.title}
            </h3>
            {event.subtitle && (
              <p className="text-sm text-white/80 drop-shadow-sm mb-1 italic line-clamp-1">
                {event.subtitle}
              </p>
            )}
            {event.organizer && (
              <p className="text-sm text-white/70 drop-shadow-sm mb-2 line-clamp-1">
                {event.organizer}
              </p>
            )}
            
            {/* Location, time and price */}
            <div className="space-y-1 text-sm text-white/80 mb-2">
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4 text-white/60 flex-shrink-0" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-white/60 flex-shrink-0" />
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

            {/* Description */}
            {event.description && event.description !== "Details" && !event.description.includes('Termine:') && (
              <p className="text-white/70 text-xs line-clamp-2 drop-shadow-sm">
                {event.description}
              </p>
            )}
            
            {/* Additional dates section for grid view - show only future dates */}
            {event.description && event.description.includes('Termine:') && (
              <div className="mt-2">
                <div className="text-white/80 text-xs mb-1 drop-shadow-sm font-medium">
                  📅 Weitere Termine:
                </div>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    // Extract dates from description using regex
                    const dateMatches = event.description.match(/\d{1,2}\.\d{1,2}\.\d{4}/g) || []
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    // Filter only future dates and limit to next 3 for grid view
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
                          + weitere
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
    <div 
      className={`rounded-[2rem] transition-all duration-500 cursor-pointer shadow-xl overflow-hidden relative ${
        isEventPast ? 'opacity-60' : ''
      }`}
      style={{
        background: isEventPast ? 'rgba(128, 128, 128, 0.15)' : 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(30px) saturate(140%) brightness(1.1)',
        border: isEventPast ? '1px solid rgba(128, 128, 128, 0.25)' : '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25), 0 3px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
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
      {/* Website Link Button - iOS Control Center Style */}
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
      
      <div className="pl-6 pr-6 pt-6 pb-6 flex gap-4 h-full">
        {/* Event Image - Left side with date overlay - 4:5 aspect ratio */}
        <div className="flex-shrink-0 w-32 sm:w-40 relative">
          <div className="aspect-[4/5] w-full">
            {event.imageUrl && !imageError ? (
              <div className="w-full h-full overflow-hidden rounded-xl bg-white/10">
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Image failed to load:', event.imageUrl);
                    console.error('Image error event:', e);
                    setImageError(true);
                    
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
              </div>
            ) : (
              <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-6xl">{getEventEmoji(event)}</span>
              </div>
            )}
          </div>
          
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
              {event.subtitle && (
                <p className="text-sm text-white/80 drop-shadow-sm mb-2 italic">
                  {event.subtitle}
                </p>
              )}
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
            <div className="flex gap-2 flex-shrink-0 items-center">
              {/* Favorite event emoji */}
              {event.isFavorite && (
                <span className="text-xl">💫</span>
              )}
              {/* Free event emoji - only show for events with price explicitly set to 0 */}
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



          {/* Documents section */}
          {event.documentsUrls && event.documentsUrls.length > 0 && (
            <div className="mb-3">
              <div className="text-white/80 text-xs mb-2 drop-shadow-sm font-medium">
                📄 Dokumente:
              </div>
              <div className="flex flex-wrap gap-1">
                {event.documentsUrls.slice(0, 2).map((docUrl, index) => {
                  const fileName = docUrl.split('/').pop()?.split('?')[0] || `Dokument ${index + 1}`;
                  return (
                    <a
                      key={index}
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1 bg-white/15 hover:bg-white/25 text-white rounded-lg px-2 py-1 text-xs transition-colors border border-white/25"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-20">{fileName.length > 15 ? fileName.substring(0, 15) + '...' : fileName}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional dates section - show only future dates */}
          {event.description && event.description.includes('Termine:') && (
            <div className="mb-3">
              <div className="text-white/80 text-xs mb-2 drop-shadow-sm font-medium">
                📅 Weitere Termine:
              </div>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  // Extract dates from description using regex
                  const dateMatches = event.description.match(/\d{1,2}\.\d{1,2}\.\d{4}/g) || []
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  
                  // Filter only future dates and limit to next 5
                  const futureDates = dateMatches
                    .map(dateStr => {
                      const [day, month, year] = dateStr.split('.')
                      return {
                        date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
                        original: dateStr
                      }
                    })
                    .filter(({ date }) => date >= today)
                    .slice(0, 5)
                  
                  const badges = futureDates.map(({ date, original }, index) => (
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
                  
                  if (totalFutureDates.length > 5) {
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