import { X, Calendar, MapPin, Clock, Euro, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!isOpen || !event) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto liquid-glass-strong rounded-[2rem] border-0">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{getEventEmoji(event)}</span>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
                  {event.title}
                  {event.price === "0" && (
                    <span className="ml-3 text-lg bg-brand-lime/90 text-brand-black px-3 py-1 rounded-full font-bold">
                      🎉 GRATIS
                    </span>
                  )}
                </h2>
                {event.category && (
                  <Badge className="mt-2 bg-white/30 text-white border-white/20 hover:bg-white/40">
                    {event.category}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="liquid-glass-button p-3 rounded-2xl border-0 text-white hover:bg-white/30"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            {/* Description */}
            {event.description && (
              <div className="liquid-glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-3 drop-shadow-sm">
                  Beschreibung
                </h3>
                <p className="text-white/90 drop-shadow-sm leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              {event.date && (
                <div className="liquid-glass p-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-brand-lime" />
                    <div>
                      <p className="text-sm text-white/70 drop-shadow-sm">Datum</p>
                      <p className="text-white font-medium drop-shadow-sm">
                        {new Date(event.date).toLocaleDateString('de-DE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Time */}
              {event.time && (
                <div className="liquid-glass p-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="text-sm text-white/70 drop-shadow-sm">Uhrzeit</p>
                      <p className="text-white font-medium drop-shadow-sm">
                        {event.time}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="liquid-glass p-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-brand-orange" />
                    <div>
                      <p className="text-sm text-white/70 drop-shadow-sm">Ort</p>
                      <p className="text-white font-medium drop-shadow-sm">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price */}
              {event.price && (
                <div className="liquid-glass p-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Euro className="h-5 w-5 text-brand-lime" />
                    <div>
                      <p className="text-sm text-white/70 drop-shadow-sm">Preis</p>
                      <p className="text-white font-medium drop-shadow-sm">
                        €{event.price}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {event.attendees && (
                <div className="liquid-glass p-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-brand-purple" />
                    <div>
                      <p className="text-sm text-white/70 drop-shadow-sm">Teilnehmer</p>
                      <p className="text-white font-medium drop-shadow-sm">
                        {event.attendees}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Website Link */}
            {event.website && (
              <div className="liquid-glass p-4 rounded-2xl">
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-brand-blue hover:text-brand-lime transition-colors group"
                >
                  <ExternalLink className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm text-white/70 drop-shadow-sm">Website</p>
                    <p className="font-medium drop-shadow-sm">
                      Mehr Informationen & Tickets
                    </p>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8">
            <Button
              variant="outline"
              onClick={onClose}
              className="liquid-glass-button border-0 text-white hover:bg-white/30 rounded-2xl"
            >
              Schließen
            </Button>
            {event.website && (
              <Button
                onClick={() => window.open(event.website, '_blank')}
                className="bg-brand-blue hover:bg-brand-lime text-white rounded-2xl transition-colors"
              >
                Tickets & Info
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}