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
import type { Event } from "@shared/schema";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortOption, setSortOption] = useState("date-asc");
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "grid">("list");
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

  // Merge events with identical titles first
  const mergedEvents = useMemo(() => {
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

    return Array.from(eventMap.values());
  }, [events]);

  // Filtered and sorted events
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

    // Filter by price range
    if (priceMin || priceMax) {
      filtered = filtered.filter(event => {
        if (!event.price) return false;
        const eventPrice = parseFloat(event.price);
        if (isNaN(eventPrice)) return false;
        
        const minPrice = priceMin ? parseFloat(priceMin) : 0;
        const maxPrice = priceMax ? parseFloat(priceMax) : Infinity;
        
        return eventPrice >= minPrice && eventPrice <= maxPrice;
      });
    }

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
  }, [mergedEvents, searchQuery, selectedCategory, selectedAudience, dateFrom, dateTo, priceMin, priceMax, sortOption]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedAudience("all");
    setDateFrom("");
    setDateTo("");
    setPriceMin("");
    setPriceMax("");
  };

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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mt-2">
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
            priceMin={priceMin}
            onPriceMinChange={setPriceMin}
            priceMax={priceMax}
            onPriceMaxChange={setPriceMax}
            onClearFilters={clearFilters}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-white/80 drop-shadow-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span>{filteredEvents.length}</span> Events gefunden
                <span className="hidden sm:inline">{getFilterSummary()}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center liquid-glass-button rounded-2xl p-2">
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="flex items-center space-x-2 rounded-xl px-3 py-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Kalender</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center space-x-2 rounded-xl px-3 py-2"
              >
                <List className="h-4 w-4" />
                <span>Liste</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center space-x-2 rounded-xl px-3 py-2"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Raster</span>
              </Button>
            </div>
            
            {(viewMode === "list" || viewMode === "grid") && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/80 drop-shadow-sm">Sortierung:</span>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-40 rounded-2xl border-0 liquid-glass bg-white/20 text-white">
                    <SelectValue className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-0 ios-glass-popup">
                    <SelectItem value="date-asc" className="rounded-xl focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">Datum (aufsteigend)</SelectItem>
                    <SelectItem value="date-desc" className="rounded-xl focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">Datum (absteigend)</SelectItem>
                    <SelectItem value="title" className="rounded-xl focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">Titel (A-Z)</SelectItem>
                    <SelectItem value="category" className="rounded-xl focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">Kategorie</SelectItem>
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
        ) : filteredEvents.length === 0 ? (
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
                className="bg-brand-blue hover:bg-brand-lime text-white rounded-2xl transition-colors"
                onClick={clearFilters}
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView events={filteredEvents} onEventClick={handleEventClick} />
        ) : viewMode === "grid" ? (
          <GridView events={filteredEvents} onEventClick={handleEventClick} />
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.notionId} 
                event={event} 
                onClick={() => handleEventClick(event)}
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

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16 rounded-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <span className="text-gray-600">Momentmillionär</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Powered by Notion API</span>
                <a href="#" className="hover:text-gray-700">Kontakt</a>
                <a href="#" className="hover:text-gray-700">Impressum</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
