import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchFilters from "@/components/search-filters";
import { EventCard } from "@/components/event-card";
import { Header } from "@/components/header";
import { EventModal } from "@/components/event-modal";
import { CalendarView } from "@/components/calendar-view";
import { FavoritesView } from "@/components/favorites-view";
import { Footer } from "@/components/footer";
import { InstagramPreview } from "@/components/instagram-preview";
import { LatestEventPopup } from "@/components/latest-event-popup";
import { Card } from "@/components/ui/card";
import { type Event } from "@shared/schema";

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [view, setView] = useState<"calendar" | "list" | "grid" | "favorites">("calendar");

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Fetch events from API
  const { 
    data: events = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    }
  });

  // Debug logging
  console.log('Events data:', events);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  // FIXED: Enhanced merge logic with proper subtitle handling
  const mergedEvents = useMemo(() => {
    const eventMap = new Map<string, Event & { allDatesWithSubtitles?: Array<{date: string, subtitle: string}> }>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    events.forEach(event => {
      const title = event.title;
      if (eventMap.has(title)) {
        const existing = eventMap.get(title)!;
        console.log(`🔄 Merging event "${title}": existing date=${existing.date}, new date=${event.date}`);
        console.log(`🏷️ Existing subtitle: "${existing.subtitle}", new subtitle: "${event.subtitle}"`);
        
        // Initialize date-subtitle mapping if not exists
        if (!existing.allDatesWithSubtitles) {
          existing.allDatesWithSubtitles = [{date: existing.date, subtitle: existing.subtitle}];
        }
        
        // Merge logic: keep first event but combine dates if different
        if (existing.date !== event.date && event.date) {
          // Add new date-subtitle mapping
          existing.allDatesWithSubtitles.push({date: event.date, subtitle: event.subtitle});
          
          // If dates are different, create a multi-date description
          if (!existing.description.includes('Termine:')) {
            existing.description = `Termine: ${existing.date}${event.date ? `, ${event.date}` : ''}${existing.description ? `\n\n${existing.description}` : ''}`;
          } else {
            // Add to existing dates list
            const termineMatch = existing.description.match(/^Termine: ([^\n]+)/);
            if (termineMatch) {
              existing.description = existing.description.replace(
                /^Termine: ([^\n]+)/, 
                `Termine: ${termineMatch[1]}, ${event.date}`
              );
            }
          }
        }
        // Use image from first event with valid image
        if (!existing.imageUrl && event.imageUrl) {
          existing.imageUrl = event.imageUrl;
        }
        // Combine attendees if different
        if (event.attendees && !existing.attendees.includes(event.attendees)) {
          existing.attendees = existing.attendees ? `${existing.attendees}, ${event.attendees}` : event.attendees;
        }
      } else {
        eventMap.set(title, { ...event, allDatesWithSubtitles: [{date: event.date, subtitle: event.subtitle}] });
      }
    });

    // Process merged events to set next future date as main date and remove past dates
    const processedEvents = Array.from(eventMap.values()).map(event => {
      // Check if this event has multiple dates
      if (event.description && event.description.startsWith('Termine:')) {
        const termineMatch = event.description.match(/^Termine: ([^\n]+)/);
        if (termineMatch) {
          const allDates = termineMatch[1].split(',').map(d => d.trim());
          
          // Filter to only future dates
          const futureDates = allDates.filter(dateStr => {
            if (dateStr) {
              const eventDate = new Date(dateStr);
              return eventDate >= today;
            }
            return false;
          });
          
          if (futureDates.length > 0) {
            // Sort future dates and use the earliest as main date
            futureDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            const earliestFutureDate = futureDates[0];
            event.date = earliestFutureDate;
            
            // FIXED: Find and use the subtitle for the earliest future date
            if (event.allDatesWithSubtitles) {
              const matchingDateSubtitle = event.allDatesWithSubtitles.find(
                item => item.date === earliestFutureDate
              );
              if (matchingDateSubtitle && matchingDateSubtitle.subtitle) {
                event.subtitle = matchingDateSubtitle.subtitle;
                console.log(`✅ Using subtitle "${matchingDateSubtitle.subtitle}" for date ${earliestFutureDate}`);
              }
            }
            
            // Update description to only show future dates
            if (futureDates.length > 1) {
              const originalDescription = event.description.replace(/^Termine: ([^\n]+)\n*/, '');
              event.description = `Termine: ${futureDates.join(', ')}${originalDescription ? `\n\n${originalDescription}` : ''}`;
            } else {
              // Only one future date, remove the "Termine:" prefix
              const originalDescription = event.description.replace(/^Termine: ([^\n]+)\n*/, '');
              event.description = originalDescription;
            }
          } else {
            // No future dates, filter out this event
            return null;
          }
        }
      } else {
        // Single date event - check if it's in the future
        if (event.date) {
          const eventDate = new Date(event.date);
          if (eventDate < today) {
            return null; // Filter out past events
          }
        }
      }
      
      // Clean up temporary field
      delete event.allDatesWithSubtitles;
      return event;
    }).filter((event): event is Event => event !== null);

    return processedEvents;
  }, [events]);

  // Filter events based on search criteria
  const filteredEvents = useMemo(() => {
    return mergedEvents.filter(event => {
      // Text search
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !event.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.organizer.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory && !event.categories.includes(selectedCategory)) {
        return false;
      }

      // Audience filter (looking for specific audience emoji or indicator)
      if (selectedAudience && !event.attendees?.includes(selectedAudience)) {
        return false;
      }

      // Date filters
      if (dateFrom || dateTo) {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        // Handle single date selection (when dateFrom is set but not dateTo)
        if (dateFrom && !dateTo) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          
          // For single date, show exact match OR events that span this date
          const matchesExactDate = eventDate.getTime() === fromDate.getTime();
          const isMultiDayEvent = event.description.startsWith('Termine:') && event.description.includes(fromDate.toISOString().split('T')[0]);
          
          if (!matchesExactDate && !isMultiDayEvent) {
            return false;
          }
        }
        
        // Handle date range selection
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);
          
          if (eventDate < fromDate || eventDate > toDate) {
            return false;
          }
        }
      }

      // Free events filter
      if (showFreeOnly) {
        const price = parseFloat(event.price || "0");
        if (price > 0) {
          return false;
        }
      }

      return true;
    });
  }, [mergedEvents, searchTerm, selectedCategory, selectedAudience, dateFrom, dateTo, showFreeOnly]);

  // Sort by date
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredEvents]);

  const favoriteEvents = useMemo(() => {
    return mergedEvents.filter(event => event.isFavorite);
  }, [mergedEvents]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedAudience("");
    setDateFrom(null);
    setDateTo(null);
    setShowFreeOnly(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedCategory || selectedAudience || dateFrom || dateTo || showFreeOnly;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Header eventCount={0} lastUpdated={new Date().toISOString()} />
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading events...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Header eventCount={0} lastUpdated={new Date().toISOString()} />
          <Card className="p-6 bg-red-50 border-red-200">
            <p className="text-red-800">Error loading events. Please try again later.</p>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </Card>
        </div>
      </div>
    );
  }

  const eventsToShow = view === "favorites" ? favoriteEvents : sortedEvents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed relative"
        style={{
          backgroundImage: `url('/classical-painting.jpg')`,
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            <Header eventCount={eventsToShow.length} lastUpdated={new Date().toISOString()} />
            
            <SearchFilters
              searchQuery={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedAudience={selectedAudience}
              onAudienceChange={setSelectedAudience}
              dateFrom={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
              onDateFromChange={(date) => setDateFrom(date ? new Date(date) : null)}
              dateTo={dateTo ? dateTo.toISOString().split('T')[0] : ''}
              onDateToChange={(date) => setDateTo(date ? new Date(date) : null)}
              showFreeEventsOnly={showFreeOnly}
              onFreeEventsChange={setShowFreeOnly}
              onClearFilters={handleClearFilters}
              eventCount={eventsToShow.length}
              view={view}
              onViewChange={setView}
            />

            {view === "calendar" && (
              <CalendarView 
                events={mergedEvents} 
                onEventClick={handleEventClick}
              />
            )}

            {view === "favorites" && (
              <FavoritesView 
                events={favoriteEvents} 
                onEventClick={handleEventClick}
              />
            )}

            {(view === "list" || view === "grid") && (
              <div className={`grid gap-6 ${
                view === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}>
                {eventsToShow.map((event) => (
                  <EventCard
                    key={event.notionId}
                    event={event}
                    onClick={() => handleEventClick(event)}
                    view={view}
                  />
                ))}
                {eventsToShow.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <p className="text-lg font-semibold mb-2">Keine Events gefunden</p>
                    <p>Probiere andere Filter oder erweitere den Zeitraum.</p>
                  </div>
                )}
              </div>
            )}
            
            <InstagramPreview />
            <Footer />
          </div>
        </div>
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <LatestEventPopup events={mergedEvents} onEventClick={handleEventClick} />
    </div>
  );
}