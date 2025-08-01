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
            className="group relative rounded-[2rem] cursor-pointer transform transition-all duration-300 hover:scale-105 h-96 overflow-hidden shadow-lg hover:shadow-purple-500/30 hover:shadow-2xl"
            style={{
              backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Background Image with Blur Effect */}
            {event.imageUrl && (
              <div 
                className="absolute inset-0 transition-all duration-300 group-hover:blur-0 blur-sm"
                style={{
                  backgroundImage: `url(${event.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            )}

            {/* Emoji Fallback when no image */}
            {!event.imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl">
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
            
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            
            {/* Favorite Star Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">
                <span className="text-white text-sm">💫</span>
              </div>
            </div>

            {/* Free Badge */}
            {event.price === "0" && (
              <div className="absolute top-4 left-4 z-10">
                <span className="text-2xl drop-shadow-lg">🆓</span>
              </div>
            )}

            {/* Event Content - Bottom Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {event.categories && event.categories.length > 0 ? (
                  event.categories.map((cat, catIndex) => (
                    <Badge key={catIndex} className="bg-white/20 text-white border-0 rounded-full text-xs backdrop-blur-sm">
                      {cat}
                    </Badge>
                  ))
                ) : (
                  <Badge className="bg-white/20 text-white border-0 rounded-full text-xs backdrop-blur-sm">
                    {event.category}
                  </Badge>
                )}</div>

              {/* Title */}
              <h3 className="font-bold text-white text-xl leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                {event.title}
              </h3>

              {/* Subtitle */}
              {event.subtitle && (
                <p className="text-white text-sm italic line-clamp-1" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                  {event.subtitle}
                </p>
              )}

              {/* Event Details and Price Row */}
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap gap-3 text-sm">
                  {/* Date */}
                  <div className="flex items-center gap-1 text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    <Calendar className="h-4 w-4 drop-shadow-lg" />
                    <span>
                      {event.date ? format(new Date(event.date), "dd. MMM", { locale: de }) : "Datum folgt"}
                    </span>
                  </div>

                  {/* Time */}
                  {event.time && (
                    <div className="flex items-center gap-1 text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                      <Clock className="h-4 w-4 drop-shadow-lg" />
                      <span>{event.time}</span>
                    </div>
                  )}

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-1 text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                      <MapPin className="h-4 w-4 drop-shadow-lg" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Price - aligned with date */}
                {event.price && event.price !== "0" && (
                  <div className="text-right">
                    <span className="text-white font-bold text-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                      €{event.price}
                    </span>
                  </div>
                )}
                
                {/* Free emoji for price === "0" */}
                {event.price === "0" && (
                  <div className="text-right">
                    <span className="text-2xl">🆓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Glow Effects */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-purple-500/20 via-orange-500/15 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-purple-500/30 to-orange-500/30 opacity-0 group-hover:opacity-60 blur-lg transition-all duration-300 pointer-events-none -z-10" />
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