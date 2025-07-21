import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, CalendarDays, List, Grid3X3, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DateRangePicker } from "@/components/date-range-picker";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  selectedAudience: string;
  onAudienceChange: (audience: string) => void;
  showFreeEventsOnly: boolean;
  onFreeEventsChange: (showFree: boolean) => void;
  onClearFilters: () => void;
  eventCount?: number;
  view: "calendar" | "grid" | "favorites";
  onViewChange: (view: "calendar" | "grid" | "favorites") => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  selectedAudience,
  onAudienceChange,
  showFreeEventsOnly,
  onFreeEventsChange,
  onClearFilters,
  eventCount,
  view,
  onViewChange,
}: SearchFiltersProps) {
  const isMobile = useIsMobile();
  
  // Fetch categories from API
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/categories"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch audiences from API
  const { data: audiences = [] } = useQuery<string[]>({
    queryKey: ["/api/audiences"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create audience options with German labels
  const getAudienceLabel = (audience: string): string => {
    if (audience.includes('❤️')) return '❤️ Paare';
    if (audience.includes('👯')) return '👯‍♀️ Freunde';
    if (audience.includes('🦸')) return '🦸🏼‍♀️ Solo';
    if (audience.includes('🧑‍🧒‍🧒')) return '🧑‍🧒‍🧒 Familie';
    return audience; // Fallback to original value
  };

  const audienceOptions = [
    { value: "all", label: "🎯 Alle Zielgruppen", emoji: "🎯" },
    ...audiences.map(audience => ({
      value: audience,
      label: getAudienceLabel(audience),
      emoji: audience.charAt(0) // First character is the emoji
    }))
  ];

  const hasActiveFilters = (selectedCategory && selectedCategory !== "all") || 
                          (selectedAudience && selectedAudience !== "all") || 
                          dateFrom || dateTo || searchQuery || showFreeEventsOnly;

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'category':
        onCategoryChange("all");
        break;
      case 'audience':
        onAudienceChange("all");
        break;
      case 'dateFrom':
        onDateFromChange("");
        break;
      case 'dateTo':
        onDateToChange("");
        break;
      case 'date':
        onDateFromChange("");
        onDateToChange("");
        break;
      case 'search':
        onSearchChange("");
        break;
      case 'freeEvents':
        onFreeEventsChange(false);
        break;
    }
  };

  return (
    <div className="liquid-glass-strong rounded-[2rem] p-8 mb-8 border-0">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
          <Input
            type="text"
            placeholder="Events, Veranstaltungsorte oder Beschreibungen durchsuchen..."
            className="pl-10 py-2 rounded-full border-0 liquid-glass bg-white/20 text-white placeholder:text-white/50"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Controls - Uniform button layout aligned with search field */}
      <div className="flex items-center justify-between gap-3">
        {/* Category Filter */}
        <div className="flex-1">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-10 rounded-full border-0 liquid-glass bg-white/20 text-white text-sm font-medium px-4 justify-start">
              <span className="mr-2 text-base">🎭</span>
              <span className="text-white">
                {selectedCategory && selectedCategory !== "all" 
                  ? categories.find(c => c === selectedCategory)?.replace(/^[^\s]+\s/, '') || "Kategorien"
                  : "Kategorien"
                }
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-0 ios-glass-popup">
              <SelectItem value="all" className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">🎭 Alle Kategorien</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audience Filter */}
        <div className="flex-1">
          <Select value={selectedAudience} onValueChange={onAudienceChange}>
            <SelectTrigger className="h-10 rounded-full border-0 liquid-glass bg-white/20 text-white text-sm font-medium px-4 justify-start">
              <span className="mr-2 text-base">🎯</span>
              <span className="text-white">
                {selectedAudience && selectedAudience !== "all" 
                  ? audienceOptions.find(opt => opt.value === selectedAudience)?.label.replace(/^[^\s]+\s/, '') || "Zielgruppe"
                  : "Zielgruppe"
                }
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-0 ios-glass-popup">
              {audienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1">
          <Button
            variant="outline"
            className={`h-10 rounded-full border-0 liquid-glass bg-white/20 text-white text-sm font-medium px-4 w-full justify-start transition-all duration-300 ${
              dateFrom || dateTo 
                ? 'bg-gradient-to-r from-lime-500 to-lime-600 text-black hover:from-lime-600 hover:to-lime-700'
                : 'hover:bg-white/30'
            }`}
          >
            <span className="mr-2 text-base">📅</span>
            <span className="text-current">
              {(dateFrom || dateTo) 
                ? (dateFrom && dateTo 
                  ? `${new Date(dateFrom).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit'})} - ${new Date(dateTo).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit'})}`
                  : dateFrom 
                  ? new Date(dateFrom).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'})
                  : new Date(dateTo!).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'}))
                : "Datum"
              }
            </span>
          </Button>
        </div>

        {/* Free Events Filter */}
        <div className="flex-1">
          <Button
            variant="outline"
            onClick={() => onFreeEventsChange(!showFreeEventsOnly)}
            className={`h-10 rounded-full border-0 liquid-glass text-sm font-medium px-4 w-full justify-start transition-all duration-300 ${
              showFreeEventsOnly 
                ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white hover:from-purple-600 hover:to-orange-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <span className="mr-2 text-base">🆓</span>
            <span className="text-current">Kostenlos</span>
          </Button>
        </div>

        {/* Add Event Button */}
        <Button
          onClick={() => window.open('https://tally.so/r/m606Pk', '_blank')}
          className="h-10 w-10 p-0 rounded-full liquid-glass bg-white/20 text-white transition-all duration-300 border-0 hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 flex-shrink-0"
          title="Event hinzufügen"
        >
          <span className="text-base">➕</span>
        </Button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="h-10 w-10 p-0 rounded-full border-0 liquid-glass bg-white/20 text-white hover:bg-white/30 transition-all duration-200 flex-shrink-0"
            title="Filter löschen"
          >
            <span className="text-base">🗑️</span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-white/80 drop-shadow-sm mr-2">Aktive Filter:</span>
          {searchQuery && (
            <Badge variant="default" className="bg-brand-purple text-black rounded-full shadow-sm">
              🔍 Suche: {searchQuery}
              <button
                className="ml-2 hover:text-gray-600"
                onClick={() => removeFilter('search')}
              >
                ×
              </button>
            </Badge>
          )}
          {selectedCategory && selectedCategory !== "all" && (
            <Badge variant="default" className="bg-brand-orange text-white rounded-full shadow-sm">
              🎭 {selectedCategory}
              <button
                className="ml-2 hover:text-gray-200"
                onClick={() => removeFilter('category')}
              >
                ×
              </button>
            </Badge>
          )}
          {selectedAudience && selectedAudience !== "all" && (
            <Badge variant="default" className="bg-brand-blue text-white rounded-full shadow-sm">
              {audienceOptions.find(opt => opt.value === selectedAudience)?.label || selectedAudience}
              <button
                className="ml-2 hover:text-gray-200"
                onClick={() => removeFilter('audience')}
              >
                ×
              </button>
            </Badge>
          )}
          {(dateFrom || dateTo) && (
            <Badge variant="default" className="bg-brand-lime text-black rounded-full shadow-sm">
              📅 {dateFrom && dateTo 
                ? `${new Date(dateFrom).toLocaleDateString('de-DE')} - ${new Date(dateTo).toLocaleDateString('de-DE')}`
                : dateFrom 
                ? new Date(dateFrom).toLocaleDateString('de-DE')
                : new Date(dateTo).toLocaleDateString('de-DE')
              }
              <button
                className="ml-2 hover:text-gray-600"
                onClick={() => removeFilter('date')}
              >
                ×
              </button>
            </Badge>
          )}
          {showFreeEventsOnly && (
            <Badge variant="default" className="bg-brand-cream text-black rounded-full shadow-sm">
              🆓 Nur kostenlose Events
              <button
                className="ml-2 hover:text-gray-600"
                onClick={() => removeFilter('freeEvents')}
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* View Toggle Buttons */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 liquid-glass-strong rounded-full p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("calendar")}
            className={`rounded-full w-10 h-10 p-0 transition-all duration-300 ${
              view === "calendar" 
                ? "bg-white/20 text-white shadow-lg border border-white/30" 
                : "text-white/60 hover:text-white/80 border-0"
            }`}
          >
            <CalendarDays className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("grid")}
            className={`rounded-full w-10 h-10 p-0 transition-all duration-300 ${
              view === "grid" 
                ? "bg-white/20 text-white shadow-lg border border-white/30" 
                : "text-white/60 hover:text-white/80 border-0"
            }`}
          >
            <Grid3X3 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("favorites")}
            className={`rounded-full w-10 h-10 p-0 transition-all duration-300 ${
              view === "favorites" 
                ? "bg-white/20 text-white shadow-lg border border-white/30" 
                : "text-white/60 hover:text-white/80 border-0"
            }`}
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Event Count Display */}
      {eventCount !== undefined && (
        <div className="mt-4 text-center">
          <p className="text-white/80 text-sm drop-shadow-sm font-medium">
            {eventCount} {eventCount === 1 ? 'Event gefunden' : 'Events gefunden'}
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchFilters;
