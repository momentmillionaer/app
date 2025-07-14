import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Euro, Users, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    musik: "bg-blue-100 text-blue-800",
    theater: "bg-green-100 text-green-800", 
    kunst: "bg-purple-100 text-purple-800",
    sport: "bg-orange-100 text-orange-800",
    food: "bg-red-100 text-red-800",
    workshop: "bg-yellow-100 text-yellow-800",
    festival: "bg-pink-100 text-pink-800",
    other: "bg-gray-100 text-gray-800",
  };
  return colors[category] || colors.other;
};

const getCategoryDisplayName = (category: string) => {
  const names: Record<string, string> = {
    musik: "Musik",
    theater: "Theater",
    kunst: "Kunst", 
    sport: "Sport",
    food: "Food & Drink",
    workshop: "Workshop",
    festival: "Festival",
    other: "Sonstiges",
  };
  return names[category] || "Sonstiges";
};

export function EventCard({ event }: EventCardProps) {
  const eventDate = event.date ? parseISO(event.date) : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Date Column */}
          <div className="flex-shrink-0">
            {eventDate && (
              <>
                <div className="bg-primary text-white rounded-lg p-3 text-center min-w-[80px]">
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
                  <div className="text-center mt-2 text-sm text-gray-600">
                    {event.time}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Event Details */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {event.title}
              </h3>
              <Badge className={`${getCategoryColor(event.category)} flex-shrink-0`}>
                {getCategoryDisplayName(event.category)}
              </Badge>
            </div>

            {event.location && (
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPin className="mr-2 text-gray-400 h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}

            {event.description && (
              <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {event.price && (
                <span className="flex items-center">
                  <Euro className="mr-1 text-gray-400 h-4 w-4" />
                  <span>{event.price}</span>
                </span>
              )}
              {event.attendees && (
                <span className="flex items-center">
                  <Users className="mr-1 text-gray-400 h-4 w-4" />
                  <span>{event.attendees}</span>
                </span>
              )}
              {!event.time && eventDate && (
                <span className="flex items-center">
                  <Clock className="mr-1 text-gray-400 h-4 w-4" />
                  <span>Ganztägig</span>
                </span>
              )}
              {event.website && (
                <span className="flex items-center">
                  <ExternalLink className="mr-1 text-gray-400 h-4 w-4" />
                  <a 
                    href={event.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
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
