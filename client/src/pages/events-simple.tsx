import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import SearchFilters from "@/components/search-filters";
import { EventCard } from "@/components/event-card";
import { Header } from "@/components/header";
import { EventModal } from "@/components/event-modal";
import { CalendarView } from "@/components/calendar-view";
import { FavoritesView } from "@/components/favorites-view";
import { Footer } from "@/components/footer";
import { InstagramPreview } from "@/components/instagram-preview";
import { LatestEventPopup } from "@/components/latest-event-popup";
import { LoadingScreen } from "@/components/loading-screen";
import { type Event } from "@shared/schema";

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [view, setView] = useState<"calendar" | "grid" | "favorites" | "latest">("calendar");

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    // Update URL with event ID
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('event', event.notionId || '');
    window.history.pushState({}, '', newUrl.toString());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    // Remove event from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('event');
    window.history.pushState({}, '', newUrl.toString());
  };

  // Fetch events from API
  const { 
    data: events = [], 
    isLoading, 
    error
  } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 30 * 1000, // 30 second cache
  });

  // Check URL for event parameter and open modal if event exists
  useEffect(() => {
    if (events.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('event');
      
      if (eventId && !isModalOpen) {
        const event = events.find(e => e.notionId === eventId);
        if (event) {
          setSelectedEvent(event);
          setIsModalOpen(true);
        }
      }
    }
  }, [events, isModalOpen]);

  // Check if any filter is active
  const hasActiveFilters = (
    searchTerm || 
    (selectedCategory && selectedCategory !== "all") || 
    (selectedAudience && selectedAudience !== "all") || 
    dateFrom || 
    dateTo || 
    showFreeOnly
  );

  // Filter events
  const filteredEvents = events.filter(event => {
    // Filter past events if any filter is active
    if (hasActiveFilters) {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const eventDate = new Date(event.date || '');
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate < now) return false; // Exclude past events when filters are active
    }
    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesText = 
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower) ||
        event.organizer?.toLowerCase().includes(searchLower);
      if (!matchesText) return false;
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      if (!event.categories?.includes(selectedCategory)) return false;
    }

    // Audience filter
    if (selectedAudience && selectedAudience !== "all") {
      if (!event.attendees?.includes(selectedAudience)) return false;
    }

    // Date filters
    if (dateFrom || dateTo) {
      const eventDate = new Date(event.date || '');
      eventDate.setHours(0, 0, 0, 0);
      
      if (dateFrom && !dateTo) {
        // Single date selection - show only events on this exact date
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        const fromDateEnd = new Date(dateFrom);
        fromDateEnd.setHours(23, 59, 59, 999);
        if (eventDate < fromDate || eventDate > fromDateEnd) return false;
      } else if (dateFrom && dateTo) {
        // Date range selection
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (eventDate < fromDate || eventDate > toDate) return false;
      } else if (!dateFrom && dateTo) {
        // Only end date selected
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (eventDate > toDate) return false;
      }
    }

    // Free events filter - only show as free if price is explicitly "0"
    if (showFreeOnly) {
      if (event.price !== "0") {
        return false;
      }
    }

    return true;
  });

  // Filter past events for grid, favorites and latest view
  const filterPastEvents = (eventsArray: Event[]) => {
    if (view === "grid" || view === "favorites" || view === "latest") {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today in Vienna timezone
      
      return eventsArray.filter(event => {
        const eventDate = new Date(event.date || '');
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now; // Only future and today's events
      });
    }
    return eventsArray;
  };

  // Sort events by date - always sort by date (earliest first)
  const sortEventsByDate = (eventsArray: Event[]) => {
    return [...eventsArray].sort((a, b) => {
      const dateA = new Date(a.date || '').getTime();
      const dateB = new Date(b.date || '').getTime();
      return dateA - dateB; // Earliest events first
    });
  };

  const favoriteEvents = sortEventsByDate(filterPastEvents(events.filter(event => event.isFavorite)));
  const gridFilteredEvents = filterPastEvents(filteredEvents);
  
  // Get latest 10 events by notionId and group events with same title and multiple dates
  const getLatestEvents = () => {
    const futureEvents = filterPastEvents(events);
    
    // First, group events by title that have multiple dates
    const groupedEvents = new Map<string, Event[]>();
    
    futureEvents.forEach(event => {
      const hasMultipleDates = event.description?.startsWith('Termine:') || event.endDate;
      
      if (hasMultipleDates) {
        if (!groupedEvents.has(event.title)) {
          groupedEvents.set(event.title, []);
        }
        groupedEvents.get(event.title)!.push(event);
      }
    });
    
    // Create consolidated events for groups
    const consolidatedEvents: Event[] = [];
    const processedTitles = new Set<string>();
    
    // Sort all events by notionId first (newer IDs indicate more recently added)
    const sortedEvents = [...futureEvents].sort((a, b) => {
      return (b.notionId || '').localeCompare(a.notionId || '');
    });
    
    sortedEvents.forEach(event => {
      if (processedTitles.has(event.title)) {
        return; // Skip if we've already processed this title
      }
      
      const groupedEventList = groupedEvents.get(event.title);
      if (groupedEventList && groupedEventList.length > 1) {
        // This is a multi-date event - consolidate it
        const sortedGroup = groupedEventList.sort((a, b) => {
          const dateA = new Date(a.date || '').getTime();
          const dateB = new Date(b.date || '').getTime();
          return dateA - dateB; // Earliest date first
        });
        
        // Use the earliest event as the base and collect all dates
        const primaryEvent = sortedGroup[0];
        const allDates = sortedGroup.map(e => e.date).filter(Boolean);
        
        // Update description to include all dates
        const consolidatedEvent = {
          ...primaryEvent,
          description: `Termine: ${allDates.join(', ')}`
        };
        
        consolidatedEvents.push(consolidatedEvent);
        processedTitles.add(event.title);
      } else {
        // Single date event or no group found
        consolidatedEvents.push(event);
        processedTitles.add(event.title);
      }
    });
    
    return consolidatedEvents.slice(0, 10);
  };
  
  const latestEvents = getLatestEvents();

  const eventsToShow = view === "favorites" ? favoriteEvents : 
                     view === "grid" ? sortEventsByDate(gridFilteredEvents) : 
                     view === "latest" ? latestEvents :
                     sortEventsByDate(filteredEvents);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedAudience("");
    setDateFrom("");
    setDateTo("");
    setShowFreeOnly(false);
  };

  if (isLoading) {
    console.log("Events loading...");
    return <LoadingScreen />;
  }

  if (error) {
    console.error("Events error:", error);
    return <div className="p-8 text-center text-red-500">Fehler beim Laden der Events: {error.message}</div>;
  }

  console.log("Events loaded:", events.length, "Rendering view:", view);
  
  // Add debug visibility test
  console.log("Component render test - this should be visible");
  
  // Debug the current filtered events
  console.log("Events to show:", eventsToShow.length);

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(145deg, hsl(228, 25%, 9%) 0%, hsl(232, 30%, 12%) 20%, hsl(235, 35%, 15%) 40%, hsl(238, 40%, 18%) 60%, hsl(240, 45%, 21%) 80%, hsl(242, 50%, 24%) 100%), linear-gradient(45deg, hsl(280, 15%, 8%) 0%, hsl(285, 20%, 10%) 25%, hsl(290, 25%, 12%) 50%, hsl(295, 30%, 14%) 75%, hsl(300, 35%, 16%) 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url('/painting1.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
      
      <div className="relative z-10 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Header eventCount={eventsToShow.length} lastUpdated={new Date().toISOString()} />
          
          <SearchFilters
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedAudience={selectedAudience}
            onAudienceChange={setSelectedAudience}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            showFreeEventsOnly={showFreeOnly}
            onFreeEventsChange={setShowFreeOnly}
            onClearFilters={handleClearFilters}

            view={view}
            onViewChange={setView}
          />

          {view === "calendar" && (
            <>
              {!hasActiveFilters ? (
                <CalendarView 
                  events={events} 
                  onEventClick={handleEventClick}
                />
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <p className="text-white/80 text-sm drop-shadow-sm font-medium">
                      {eventsToShow.length} {eventsToShow.length === 1 ? 'Event gefunden' : 'Events gefunden'}
                    </p>
                  </div>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {eventsToShow.map((event) => (
                      <EventCard
                        key={event.notionId}
                        event={event}
                        onClick={() => handleEventClick(event)}
                        view="grid"
                      />
                    ))}
                    {eventsToShow.length === 0 && (
                      <div className="col-span-full text-center py-12 text-white">
                        <p className="text-lg font-semibold mb-2 drop-shadow-sm">Keine Events gefunden</p>
                        <p className="text-white/80 drop-shadow-sm">Probiere andere Filter oder erweitere den Zeitraum.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {view === "favorites" && (
            <>
              <div className="mb-6 text-center">
                <p className="text-white/80 text-sm drop-shadow-sm font-medium">
                  {favoriteEvents.length} {favoriteEvents.length === 1 ? 'Event gefunden' : 'Events gefunden'}
                </p>
              </div>
              <FavoritesView 
                events={favoriteEvents} 
                onEventClick={handleEventClick}
              />
            </>
          )}

          {view === "latest" && (
            <>
              <div className="mb-6 text-center">
                <p className="text-white/80 text-sm drop-shadow-sm font-medium">
                  Die {latestEvents.length} zuletzt hinzugefügten Events
                </p>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {latestEvents.map((event) => (
                  <EventCard
                    key={event.notionId}
                    event={event}
                    onClick={() => handleEventClick(event)}
                    view="grid"
                  />
                ))}
                {latestEvents.length === 0 && (
                  <div className="col-span-full text-center py-12 text-white">
                    <p className="text-lg font-semibold mb-2 drop-shadow-sm">Keine neuen Events</p>
                    <p className="text-white/80 drop-shadow-sm">Derzeit sind keine neuen Events verfügbar.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {view === "grid" && (
            <>
              <div className="mb-6 text-center">
                <p className="text-white/80 text-sm drop-shadow-sm font-medium">
                  {eventsToShow.length} {eventsToShow.length === 1 ? 'Event gefunden' : 'Events gefunden'}
                </p>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {eventsToShow.map((event) => (
                  <EventCard
                    key={event.notionId}
                    event={event}
                    onClick={() => handleEventClick(event)}
                  />
                ))}
                {eventsToShow.length === 0 && (
                  <div className="col-span-full text-center py-12 text-white">
                    <p className="text-lg font-semibold mb-2 drop-shadow-sm">Keine Events gefunden</p>
                    <p className="text-white/80 drop-shadow-sm">Probiere andere Filter oder erweitere den Zeitraum.</p>
                  </div>
                )}
              </div>
            </>
          )}
          
          <InstagramPreview />
          <Footer />
        </div>
      </div>
      
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <LatestEventPopup events={events} onEventClick={handleEventClick} />
    </div>
  );
}