import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { SearchFilters } from "@/components/search-filters";
import { EventCard } from "@/components/event-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarX } from "lucide-react";
import type { Event } from "@shared/schema";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOption, setSortOption] = useState("date-asc");

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

    if (selectedCategory) {
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
    setSelectedCategory("");
    setDateFrom("");
    setDateTo("");
  };

  const getLastUpdated = () => {
    const now = new Date();
    return `vor ${Math.floor((now.getTime() - (now.getTime() % (2 * 60 * 1000))) / (60 * 1000))} Min.`;
  };

  const getFilterSummary = () => {
    const parts = [];
    if (selectedCategory) {
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

        {/* Results Summary */}
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
        </div>

        {/* Event List */}
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
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.notionId} event={event} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16 rounded-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <span className="text-gray-600">Eventkalender Graz</span>
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
