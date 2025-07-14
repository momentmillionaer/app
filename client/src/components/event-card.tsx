import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Euro, Users, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const getCategoryColor = (category: string) => {
  return "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200";
};



export function EventCard({ event, onClick }: EventCardProps) {
  const eventDate = event.date ? parseISO(event.date) : null;

  return (
    <div 
      className="bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 hover:bg-white/20 hover:backdrop-blur-lg transition-all duration-500 cursor-pointer shadow-xl"
      onClick={onClick}
    >
      <div className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
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
                  <div className="text-center mt-2 text-sm text-black/70 drop-shadow-sm">
                    {event.time}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Event Details */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h3 className="text-lg font-semibold text-black drop-shadow-sm line-clamp-2">
                {event.title}
                {event.price === "0" && (
                  <span className="ml-2 text-sm bg-brand-lime/90 text-brand-black px-2 py-1 rounded-full font-bold">
                    🎉 GRATIS
                  </span>
                )}
              </h3>
              <Badge className="bg-black/20 text-black border-black/20 hover:bg-black/30 flex-shrink-0">
                {event.category}
              </Badge>
            </div>

            {event.location && (
              <div className="flex items-center text-sm text-black/80 mb-3 drop-shadow-sm">
                <MapPin className="mr-2 text-black/60 h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}

            {event.description && (
              <p className="text-black/75 text-sm line-clamp-3 mb-4 drop-shadow-sm">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-black/70 drop-shadow-sm">
              {event.price && (
                <span className="flex items-center">
                  <Euro className="mr-1 text-black/60 h-4 w-4" />
                  <span>{event.price}</span>
                </span>
              )}
              {event.attendees && (
                <span className="flex items-center">
                  <Users className="mr-1 text-black/60 h-4 w-4" />
                  <span>{event.attendees}</span>
                </span>
              )}
              {!event.time && eventDate && (
                <span className="flex items-center">
                  <Clock className="mr-1 text-black/60 h-4 w-4" />
                  <span>Ganztägig</span>
                </span>
              )}
              {event.website && (
                <span className="flex items-center">
                  <ExternalLink className="mr-1 text-black/60 h-4 w-4" />
                  <a 
                    href={event.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-black/90 hover:text-black hover:underline transition-colors"
                  >
                    Mehr Details
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
