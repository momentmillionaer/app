import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Euro, Users, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const eventDate = (() => {
    try {
      return event.date ? parseISO(event.date) : null;
    } catch (error) {
      console.error('Date parsing error:', error, event.date);
      return null;
    }
  })();

  return (
    <div 
      className="rounded-[2rem] transition-all duration-500 cursor-pointer shadow-xl overflow-hidden"
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
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Event Image - Left side, square */}
          {event.imageUrl ? (
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded-2xl bg-white/10">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Image failed to load:', event.imageUrl);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-red-500/20 flex items-center justify-center text-white text-xs">No Image</div>';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', event.imageUrl);
                }}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-white/60 text-xs">📷</span>
            </div>
          )}

          {/* Date Column */}
          <div className="flex-shrink-0">
            {eventDate && (
              <>
                <div className="bg-brand-blue/90 text-white rounded-2xl p-4 text-center min-w-[80px] liquid-glass-button border-0">
                  <div className="text-xs font-medium uppercase">
                    {format(eventDate, "MMM", { locale: de })}
                  </div>
                  <div className="text-xl font-bold">
                    {format(eventDate, "dd")}
                  </div>
                  <div className="text-xs">
                    {format(eventDate, "EEE", { locale: de }).toUpperCase()}
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
              <h3 className="text-lg font-semibold text-white drop-shadow-sm line-clamp-2">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Debug: Show on first event to test */}
                {event.title === "Grenzenloser Brunch" && (
                  <Badge className="bg-brand-blue/90 text-white border-brand-blue hover:bg-brand-blue flex items-center gap-1 font-bold">
                    🆓 FREE
                  </Badge>
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
              <p className="text-white/75 text-sm line-clamp-3 mb-4 drop-shadow-sm">
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
                  <Users className="mr-1 text-white/60 h-4 w-4" />
                  <span>{event.attendees}</span>
                </span>
              )}
              
              {event.website && (
                <span className="flex items-center">
                  <ExternalLink className="mr-1 text-white/60 h-4 w-4" />
                  <span>Website</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}