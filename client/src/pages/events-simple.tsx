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
import { type Event } from "@shared/schema";

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [view, setView] = useState<"calendar" | "grid" | "favorites">("calendar");

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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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

  // Filter past events for grid and favorites view
  const filterPastEvents = (eventsArray: Event[]) => {
    if (view === "grid" || view === "favorites") {
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

  const favoriteEvents = filterPastEvents(events.filter(event => event.isFavorite));
  const gridFilteredEvents = filterPastEvents(filteredEvents);
  
  const eventsToShow = view === "favorites" ? favoriteEvents : 
                     view === "grid" ? gridFilteredEvents : 
                     filteredEvents;

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Header eventCount={0} lastUpdated={new Date().toISOString()} />
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-white">Loading events...</div>
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
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Error loading events</div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
                  <div className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
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

          {view === "grid" && (
            <>
              <div className="mb-6 text-center">
                <p className="text-white/80 text-sm drop-shadow-sm font-medium">
                  {eventsToShow.length} {eventsToShow.length === 1 ? 'Event gefunden' : 'Events gefunden'}
                </p>
              </div>
              <div className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
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