import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { SearchFilters } from "@/components/search-filters";
import { CalendarView } from "@/components/calendar-view";
import { GridView } from "@/components/grid-view";
import { EventCard } from "@/components/event-card";
import { EventModal } from "@/components/event-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarX, List, Calendar, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstagramPreview } from "@/components/instagram-preview";
import { Footer } from "@/components/footer";
import { LatestEventPopup } from "@/components/latest-event-popup";
import type { Event } from "@shared/schema";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFreeEventsOnly, setShowFreeEventsOnly] = useState(false);
  const [sortOption, setSortOption] = useState("date-asc");
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "grid">("calendar");
  const [userChangedView, setUserChangedView] = useState(false);
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
  });

  // Debug logging
  console.log('Events data:', events);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  // Merge events with identical titles and process dates
  const mergedEvents = useMemo(() => {
    const eventMap = new Map<string, Event>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    events.forEach(event => {
      const title = event.title;
      if (eventMap.has(title)) {
        const existing = eventMap.get(title)!;
        // Merge logic: keep first event but combine dates if different
        if (existing.date !== event.date && event.date) {
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
        eventMap.set(title, { ...event });
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
            event.date = futureDates[0];
            
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
            // No future dates, keep original logic but mark as past
            // This will be filtered out later
          }
        }
      }
      
      return event;
    });

    return processedEvents;
  }, [events]);

  // Helper function to check if an event is in the past
  const isEventInPast = (event: Event): boolean => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    return eventDate < today;
  };

  // Helper function to check if an event has any future dates
  const hasEventFutureDates = (event: Event): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Since we now process events to set the main date to the next future date,
    // we just need to check if the main date is in the future
    if (event.date) {
      const mainDate = new Date(event.date);
      return mainDate >= today;
    }
    
    return false;
  };

  // Filtered and sorted events (includes all events, past events will be grayed out in components)
  const filteredEvents = useMemo(() => {
    let filtered = mergedEvents;

    // Apply filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by audience
    if (selectedAudience && selectedAudience !== "all") {
      filtered = filtered.filter(event => {
        if (!event.attendees) return false;
        // Split attendees by comma and check if any matches the selected audience
        const eventAudiences = event.attendees.split(',').map(a => a.trim());
        return eventAudiences.includes(selectedAudience);
      });
    }

    // Filter by free events only
    if (showFreeEventsOnly) {
      filtered = filtered.filter(event => {
        if (!event.price) return false; // No price field does NOT mean free
        const eventPrice = parseFloat(event.price);
        return !isNaN(eventPrice) && eventPrice === 0;
      });
    }

    // Date filtering - exact match for single date, range for date range
    if (dateFrom && dateTo && dateFrom === dateTo) {
      // Single date selected - show only events on this exact date
      filtered = filtered.filter(event => {
        if (!event.date) return false;
        
        // Check main date
        if (event.date === dateFrom) return true;
        
        // Check if event has multiple dates in description
        if (event.description.includes('Termine:')) {
          const termineMatch = event.description.match(/^Termine: ([^\n]+)/);
          if (termineMatch) {
            const dates = termineMatch[1].split(',').map(d => d.trim());
            return dates.includes(dateFrom);
          }
        }
        
        // Check endDate for multi-day events
        if (event.endDate) {
          const startDate = new Date(event.date);
          const endDate = new Date(event.endDate);
          const selectedDate = new Date(dateFrom);
          return selectedDate >= startDate && selectedDate <= endDate;
        }
        
        return false;
      });
    } else {
      // Date range filtering
      if (dateFrom) {
        filtered = filtered.filter(event => 
          event.date && event.date >= dateFrom
        );
      }

      if (dateTo) {
        filtered = filtered.filter(event => 
          event.date && event.date <= dateTo
        );
      }
    }

    // Apply sorting
    switch (sortOption) {
      case "date-desc":
        filtered.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "category":
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default: // date-asc
        filtered.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }

    return filtered;
  }, [mergedEvents, searchQuery, selectedCategory, selectedAudience, dateFrom, dateTo, showFreeEventsOnly, sortOption]);

  // Events for list and grid views - hide completely past events, but show events with future dates
  const eventsForListAndGrid = useMemo(() => {
    return filteredEvents.filter(event => {
      // Show events that have any future dates (main date or additional dates)
      return hasEventFutureDates(event);
    });
  }, [filteredEvents, hasEventFutureDates]);

  // Events for calendar view - show all events with original dates (past events will be grayed out in calendar component)
  const eventsForCalendar = useMemo(() => {
    // For calendar view, we want to show ALL dates (including past ones)
    // So we need to re-process the original events without filtering past dates
    const eventMap = new Map<string, Event>();
    
    events.forEach(event => {
      const title = event.title;
      if (eventMap.has(title)) {
        const existing = eventMap.get(title)!;
        // Merge logic: keep first event but combine dates if different
        if (existing.date !== event.date && event.date) {
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
        eventMap.set(title, { ...event });
      }
    });

    return Array.from(eventMap.values()).filter(event => {
      // Apply same filtering logic as filteredEvents but keep all dates
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory && selectedCategory !== "all" && event.category !== selectedCategory) {
        return false;
      }
      if (selectedAudience && selectedAudience !== "all" && !event.attendees.includes(selectedAudience)) {
        return false;
      }
      if (showFreeEventsOnly && event.price && event.price !== "0") {
        return false;
      }
      // Apply same date filtering logic for calendar
      if (dateFrom && dateTo && dateFrom === dateTo) {
        // Single date selected
        if (event.date !== dateFrom) {
          // Check if event has multiple dates in description
          if (event.description.includes('Termine:')) {
            const termineMatch = event.description.match(/^Termine: ([^\n]+)/);
            if (termineMatch) {
              const dates = termineMatch[1].split(',').map(d => d.trim());
              if (!dates.includes(dateFrom)) return false;
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      } else {
        // Date range filtering
        if (dateFrom && event.date && event.date < dateFrom) {
          return false;
        }
        if (dateTo && event.date && event.date > dateTo) {
          return false;
        }
      }
      return true;
    });
  }, [events, searchQuery, selectedCategory, selectedAudience, dateFrom, dateTo, showFreeEventsOnly]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedAudience("all");
    setDateFrom("");
    setDateTo("");
    setShowFreeEventsOnly(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || 
    (selectedCategory && selectedCategory !== "all") || 
    (selectedAudience && selectedAudience !== "all") || 
    dateFrom || 
    dateTo || 
    showFreeEventsOnly;

  // Auto-switch to grid view when filters are applied (unless user manually changed view)
  useEffect(() => {
    if (hasActiveFilters && !userChangedView) {
      setViewMode("grid");
    } else if (!hasActiveFilters && !userChangedView) {
      setViewMode("calendar");
    }
  }, [hasActiveFilters, userChangedView]);

  // Reset user changed view when filters are cleared
  useEffect(() => {
    if (!hasActiveFilters) {
      setUserChangedView(false);
    }
  }, [hasActiveFilters]);

  const getLastUpdated = () => {
    const now = new Date();
    return `vor ${Math.floor((now.getTime() - (now.getTime() % (2 * 60 * 1000))) / (60 * 1000))} Min.`;
  };

  const getFilterSummary = () => {
    const parts = [];
    if (selectedCategory && selectedCategory !== "all") {
      parts.push(selectedCategory);
    }
    if (selectedAudience && selectedAudience !== "all") {
      parts.push(selectedAudience);
    }
    if (dateFrom && dateTo) {
      parts.push(`${dateFrom} bis ${dateTo}`);
    } else if (dateFrom) {
      parts.push(`ab ${dateFrom}`);
    } else if (dateTo) {
      parts.push(`bis ${dateTo}`);
    }
    return parts.length > 0 ? ` • ${parts.join(" • ")}` : "";
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <Header eventCount={0} lastUpdated="Fehler" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Alert variant="destructive">
            <AlertDescription>
              Fehler beim Laden der Events: {error instanceof Error ? error.message : "Unbekannter Fehler"}
              <br />
              <br />
              Stellen Sie sicher, dass:
              <br />
              • NOTION_INTEGRATION_SECRET korrekt gesetzt ist
              <br />
              • NOTION_PAGE_URL auf eine gültige Notion-Seite verweist
              <br />
              • Die Events-Datenbank existiert (führen Sie setup-notion.ts aus)
              <br />
              • Die Notion-Integration Zugriff auf die Seite hat
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      
      <Header eventCount={events.length} lastUpdated={getLastUpdated()} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="mt-0">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            selectedAudience={selectedAudience}
            onAudienceChange={setSelectedAudience}
            showFreeEventsOnly={showFreeEventsOnly}
            onFreeEventsChange={setShowFreeEventsOnly}
            onClearFilters={clearFilters}
          />
        </div>



        {/* View Mode Toggle */}
        <div className="flex flex-col items-center mb-6 space-y-4">
          {/* Event Count */}
          <div className="text-white/80 drop-shadow-sm text-center">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="text-sm">{viewMode === "calendar" ? eventsForCalendar.length : eventsForListAndGrid.length} Events gefunden</span>
            )}
          </div>
          
          {/* View Mode Toggle - Always Centered */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center liquid-glass-button rounded-full p-2">
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setViewMode("calendar");
                  setUserChangedView(true);
                }}
                className="flex items-center space-x-2 rounded-full px-3 py-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Kalender</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setViewMode("list");
                  setUserChangedView(true);
                }}
                className="flex items-center space-x-2 rounded-full px-3 py-2"
              >
                <List className="h-4 w-4" />
                <span>Liste</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setViewMode("grid");
                  setUserChangedView(true);
                }}
                className="flex items-center space-x-2 rounded-full px-3 py-2"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Liste</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setViewMode("grid");
                  setUserChangedView(true);
                }}
                className="flex items-center space-x-2 rounded-full px-3 py-2"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Raster</span>
              </Button>
            </div>
            
            {(viewMode === "list" || viewMode === "grid") && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/80 drop-shadow-sm">Sortierung:</span>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-40 rounded-full border-0 liquid-glass bg-white/20 text-white">
                    <SelectValue className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-0 ios-glass-popup">
                    <SelectItem value="date-asc" className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">Datum (aufsteigend)</SelectItem>
                    <SelectItem value="date-desc" className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">Datum (absteigend)</SelectItem>
                    <SelectItem value="title" className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">Titel (A-Z)</SelectItem>
                    <SelectItem value="category" className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">Kategorie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="liquid-glass rounded-[2rem] p-8">
                <div className="flex space-x-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (viewMode === "calendar" ? eventsForCalendar.length : eventsForListAndGrid.length) === 0 ? (
          <div className="text-center py-12">
            <CalendarX className="mx-auto h-12 w-12 text-white/50 mb-4" />
            <h3 className="text-lg font-medium text-white drop-shadow-sm mb-2">Keine Events gefunden</h3>
            <p className="text-white/80 drop-shadow-sm mb-6">
              {events.length === 0 
                ? "Es sind noch keine Events in der Datenbank verfügbar."
                : "Versuchen Sie, Ihre Suchkriterien oder Filter anzupassen."
              }
            </p>
            {(searchQuery || selectedCategory || dateFrom || dateTo) && (
              <Button
                className="bg-brand-blue hover:bg-brand-lime text-white rounded-full transition-colors"
                onClick={clearFilters}
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView events={eventsForCalendar} onEventClick={handleEventClick} />
        ) : viewMode === "grid" ? (
          <GridView events={eventsForListAndGrid} onEventClick={handleEventClick} />
        ) : (
          <div className="space-y-4">
            {eventsForListAndGrid.map((event) => (
              <EventCard 
                key={event.notionId} 
                event={event} 
                onClick={() => handleEventClick(event)}
                viewMode="list"
              />
            ))}
          </div>
        )}

        {/* Event Modal */}
        <EventModal 
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        {/* Instagram Preview */}
        <InstagramPreview />

        {/* Footer */}
        <Footer />

        {/* Latest Event Popup */}
        <LatestEventPopup events={events} onEventClick={handleEventClick} />
      </div>
    </div>
  );
}
