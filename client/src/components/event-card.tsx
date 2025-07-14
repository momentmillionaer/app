import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Euro, Users, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

const getCategoryColorData = (category: string) => {
  // Use your custom color palette for consistent category colors
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorStyles = [
    { bg: "#0A0A0A", text: "#FFFFFF" }, // Black
    { bg: "#0000FF", text: "#FFFFFF" }, // Blue
    { bg: "#D0FE1D", text: "#0A0A0A" }, // Lime Green
    { bg: "#F3DCFA", text: "#5A2C5F" }, // Light Purple
    { bg: "#F4F3F2", text: "#2D2D2D" }, // Light Gray
    { bg: "#FE5C2B", text: "#FFFFFF" }, // Orange
    { bg: "#FEE4C3", text: "#8B4513" }, // Cream
  ];
  return colorStyles[Math.abs(hash) % colorStyles.length];
};

const getCategoryColor = (category: string) => {
  return "px-2 py-1 rounded-full text-xs font-medium";
};

const getCategoryBgColor = (category: string) => {
  return getCategoryColorData(category).bg;
};

const getCategoryTextColor = (category: string) => {
  return getCategoryColorData(category).text;
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
              <Badge 
                className={`${getCategoryColor(event.category)} flex-shrink-0`}
                style={{
                  backgroundColor: getCategoryBgColor(event.category),
                  color: getCategoryTextColor(event.category)
                }}
              >
                {event.category}
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
