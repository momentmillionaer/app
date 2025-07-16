import { X, Calendar, MapPin, Clock, Euro, ExternalLink, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getCategoryEmojis } from "@/lib/category-utils";

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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ios-glass-popup rounded-[2rem] border-0">
        {/* Event Image Header */}
        {event.imageUrl && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-[2rem]">
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', event.imageUrl);
                console.error('Image error event:', e);
                
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              {!event.imageUrl && (
                <span className="text-4xl">{getEventEmoji(event)}</span>
              )}
              <div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
                    {event.title}
                    {event.price === "0" && (
                      <span className="ml-3 text-lg bg-brand-lime/90 text-brand-black px-3 py-1 rounded-full font-bold">
                        🎉 GRATIS
                      </span>
                    )}
                  </h2>
                  {event.subtitle && (
                    <p className="text-lg text-white/80 drop-shadow-sm italic">
                      {event.subtitle}
                    </p>
                  )}
                  {event.organizer && (
                    <p className="text-lg text-white/70 drop-shadow-sm">
                      {event.organizer}
                    </p>
                  )}
                </div>
                {/* Category emojis */}
                <div className="mt-2 flex gap-2">
                  {getCategoryEmojis(event.categories).map((emoji, index) => (
                    <span key={index} className="text-2xl">{emoji}</span>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="liquid-glass-button p-3 rounded-2xl border-0 text-white hover:bg-white/10"
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
                {/* Check if description contains multiple dates (merged event) */}
                {event.description.startsWith('Termine:') ? (
                  <div>
                    <div className="text-white/90 text-sm mb-3 drop-shadow-sm font-medium">
                      📅 Alle Termine:
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(() => {
                        const termineMatch = event.description.match(/^Termine: ([^\n]+)/);
                        if (termineMatch) {
                          const dates = termineMatch[1].split(',').map(d => d.trim());
                          return dates.map((dateStr, index) => {
                            try {
                              const dateObj = new Date(dateStr);
                              return (
                                <Badge 
                                  key={index} 
                                  className="bg-brand-blue/30 text-white border-brand-blue/40 hover:bg-brand-blue/40 px-4 py-2"
                                >
                                  {format(dateObj, "EE, dd.MM.yyyy", { locale: de })}
                                </Badge>
                              );
                            } catch (error) {
                              return (
                                <Badge 
                                  key={index} 
                                  className="bg-brand-blue/30 text-white border-brand-blue/40 hover:bg-brand-blue/40 px-4 py-2"
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
                    {/* Show remaining description after the Termine: line */}
                    {(() => {
                      const remainingDescription = event.description.split('\n').slice(1).join('\n').trim();
                      if (remainingDescription) {
                        return (
                          <p className="text-white/90 drop-shadow-sm leading-relaxed">
                            {remainingDescription}
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <p className="text-white/90 drop-shadow-sm leading-relaxed">
                    {event.description}
                  </p>
                )}
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

              {/* Documents */}
              {event.documentsUrls && event.documentsUrls.length > 0 && (
                <div className="liquid-glass p-4 rounded-2xl col-span-full">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-5 w-5 text-brand-purple" />
                    <div>
                      <p className="text-sm text-white/70 drop-shadow-sm">Dokumente</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.documentsUrls.map((docUrl, index) => {
                      const fileName = docUrl.split('/').pop()?.split('?')[0] || `Dokument ${index + 1}`;
                      return (
                        <a
                          key={index}
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-2 text-sm transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-32">{fileName}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>


          </div>

          {/* Action Buttons */}
          {event.website && (
            <div className="flex justify-end mt-8">
              <Button
                onClick={() => window.open(event.website, '_blank')}
                className="bg-brand-blue hover:bg-brand-lime text-white rounded-2xl transition-colors"
              >
                Tickets & Info
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}