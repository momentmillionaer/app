import { Star, Heart, Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Event } from "@shared/schema";

interface FavoritesViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export function FavoritesView({ events, onEventClick }: FavoritesViewProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative mb-6">
          <div className="mx-auto w-16 h-16 flex items-center justify-center text-purple-400/50 mb-4">
            <span className="text-6xl">💫</span>
          </div>
          <Heart className="absolute top-1 right-1/2 translate-x-6 h-6 w-6 text-orange-400/60" />
        </div>
        <h3 className="text-2xl font-bold text-white drop-shadow-sm mb-3">Noch keine Favoriten</h3>
        <p className="text-white/80 drop-shadow-sm text-lg max-w-md mx-auto">
          Markiere Events als Favoriten, um sie hier in deiner persönlichen Sammlung zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white drop-shadow-sm mb-2" style={{ fontFamily: 'Connihof, serif' }}>conni's favoriten</h2>
      </div>

      {/* Favorites Grid - Creative Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <div
            key={`${event.notionId}-${index}`}
            onClick={() => onEventClick(event)}
            className="group relative rounded-[2rem] cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 border-purple-500/30 hover:border-purple-400/50 h-80 overflow-hidden"
            style={{
              backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            {/* Favorite Star Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">
                <span className="text-white text-sm">💫</span>
              </div>
            </div>

            {/* Free Badge */}
            {event.price === "0" && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-lime-500 text-black font-bold rounded-full border-0 px-3 py-1 shadow-lg">
                  🆓 GRATIS
                </Badge>
              </div>
            )}

            {/* Event Content - Bottom Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
              {/* Category */}
              <Badge className="bg-white/20 text-white border-0 rounded-full text-xs backdrop-blur-sm">
                {event.category}
              </Badge>

              {/* Title */}
              <h3 className="font-bold text-white text-xl leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors drop-shadow-lg">
                {event.title}
              </h3>

              {/* Subtitle */}
              {event.subtitle && (
                <p className="text-white/90 text-sm italic line-clamp-1 drop-shadow-lg">
                  {event.subtitle}
                </p>
              )}

              {/* Event Details */}
              <div className="flex flex-wrap gap-3 text-sm">
                {/* Date */}
                <div className="flex items-center gap-1 text-white/90 drop-shadow-lg">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {event.date ? format(new Date(event.date), "dd. MMM", { locale: de }) : "Datum folgt"}
                  </span>
                </div>

                {/* Time */}
                {event.time && (
                  <div className="flex items-center gap-1 text-white/90 drop-shadow-lg">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-1 text-white/90 drop-shadow-lg">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              {event.price && event.price !== "0" && (
                <div className="text-right">
                  <span className="text-white font-bold text-lg drop-shadow-lg">
                    €{event.price}
                  </span>
                </div>
              )}
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Bottom Message */}
      <div className="text-center mt-12 liquid-glass rounded-[2rem] p-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
          <span className="text-white font-medium">Momentmillionär Tipp</span>
          <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
        </div>
        <p className="text-white/80 text-sm">
          Diese Events wurden speziell von Conni ausgewählt für authentische und unvergessliche Erlebnisse in Graz.
        </p>
      </div>
    </div>
  );
}