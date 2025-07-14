import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { SearchFilters } from "@/components/search-filters";
import { CalendarView } from "@/components/calendar-view";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarX, List, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@shared/schema";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOption, setSortOption] = useState("date-asc");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

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

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    let filtered = events;

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
  }, [events, searchQuery, selectedCategory, dateFrom, dateTo, sortOption]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setDateFrom("");
    setDateTo("");
  };

  const getLastUpdated = () => {
    const now = new Date();
    return `vor ${Math.floor((now.getTime() - (now.getTime() % (2 * 60 * 1000))) / (60 * 1000))} Min.`;
  };

  const getFilterSummary = () => {
    const parts = [];
    if (selectedCategory && selectedCategory !== "all") {
      const categoryNames: Record<string, string> = {
        musik: "Musik",
        theater: "Theater", 
        kunst: "Kunst",
        sport: "Sport",
        food: "Food & Drink",
        workshop: "Workshop",
        festival: "Festival",
      };
      parts.push(categoryNames[selectedCategory] || selectedCategory);
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
      <div className="min-h-screen bg-neutral">
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
    <div className="min-h-screen bg-neutral">
      <Header eventCount={events.length} lastUpdated={getLastUpdated()} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onClearFilters={clearFilters}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
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
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="flex items-center space-x-1"
              >
                <Calendar className="h-4 w-4" />
                <span>Kalender</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center space-x-1"
              >
                <List className="h-4 w-4" />
                <span>Liste</span>
              </Button>
            </div>
            
            {viewMode === "list" && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sortierung:</span>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-asc">Datum (aufsteigend)</SelectItem>
                    <SelectItem value="date-desc">Datum (absteigend)</SelectItem>
                    <SelectItem value="title">Titel (A-Z)</SelectItem>
                    <SelectItem value="category">Kategorie</SelectItem>
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
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            <CalendarX className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Events gefunden</h3>
            <p className="text-gray-600 mb-6">
              {events.length === 0 
                ? "Es sind noch keine Events in der Datenbank verfügbar."
                : "Versuchen Sie, Ihre Suchkriterien oder Filter anzupassen."
              }
            </p>
            {(searchQuery || selectedCategory || dateFrom || dateTo) && (
              <button
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={clearFilters}
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView events={filteredEvents} />
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.notionId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {event.category}
                  </span>
                </div>
                
                {event.description && (
                  <p className="text-gray-600 mb-4">{event.description}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                  {event.date && (
                    <div>
                      <strong>Datum:</strong> {new Date(event.date).toLocaleDateString('de-DE')}
                    </div>
                  )}
                  {event.time && (
                    <div>
                      <strong>Zeit:</strong> {event.time}
                    </div>
                  )}
                  {event.location && (
                    <div>
                      <strong>Ort:</strong> {event.location}
                    </div>
                  )}
                  {event.price && (
                    <div>
                      <strong>Preis:</strong> €{event.price}
                    </div>
                  )}
                </div>
                
                {event.website && (
                  <div className="mt-4">
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Mehr Informationen →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
