import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, CalendarDays, List, Grid3X3, Sparkles, Theater, Users, DollarSign, Filter, Trash2 } from "lucide-react";
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

      {/* Filter Controls and View Toggles - All in one line for desktop */}
      {!isMobile ? (
        <div className="flex items-center justify-center gap-6">
          {/* Filter Button Group */}
          <div className="flex items-center gap-3 liquid-glass-strong rounded-full p-2">
            {/* Category Filter - Icon button */}
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className={`h-12 w-12 p-0 rounded-full border border-white/30 liquid-glass text-white justify-center transition-all duration-300 ${
                selectedCategory && selectedCategory !== "all" 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg border-orange-400/50' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}>
                <Theater className="h-5 w-5 text-white" />
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

            {/* Audience Filter - Icon button */}
            <Select value={selectedAudience} onValueChange={onAudienceChange}>
              <SelectTrigger className={`h-12 w-12 p-0 rounded-full border border-white/30 liquid-glass text-white justify-center transition-all duration-300 ${
                selectedAudience && selectedAudience !== "all" 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg border-blue-400/50' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}>
                <Users className="h-5 w-5 text-white" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl border-0 ios-glass-popup">
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Filter - Icon button */}
            <DateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={onDateFromChange}
              onDateToChange={onDateToChange}
              compact={true}
            />

            {/* Free Events Filter - Icon button */}
            <Button
              variant="outline"
              onClick={() => onFreeEventsChange(!showFreeEventsOnly)}
              className={`h-12 w-12 p-0 rounded-full border border-white/30 liquid-glass transition-all duration-300 ${
                showFreeEventsOnly 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-green-400/50' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Kostenlose Events"
            >
              <DollarSign className="h-5 w-5 text-white" />
            </Button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={onClearFilters}
                className="h-12 w-12 p-0 rounded-full border-0 liquid-glass bg-red-500/80 text-white hover:bg-red-600/90 transition-all duration-200 shadow-lg"
                title="Filter löschen"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </Button>
            )}
          </div>

          {/* View Toggle Button Group */}
          <div className="flex items-center gap-3 liquid-glass-strong rounded-full p-2">
            <Button
              variant="outline"
              onClick={() => onViewChange("calendar")}
              className={`h-12 w-12 p-0 rounded-full border border-white/30 liquid-glass transition-all duration-300 ${
                view === "calendar" 
                  ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg border-lime-400/50' 
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Kalender"
            >
              <CalendarDays className="h-5 w-5 text-white" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onViewChange("grid")}
              className={`h-12 w-12 p-0 rounded-full border border-white/30 liquid-glass transition-all duration-300 ${
                view === "grid" 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border-blue-400/50' 
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Raster"
            >
              <Grid3X3 className="h-5 w-5 text-white" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onViewChange("favorites")}
              className={`h-12 w-12 p-0 rounded-full border border-white/30 liquid-glass transition-all duration-300 ${
                view === "favorites" 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg border-yellow-400/50' 
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Conni's Favoriten"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </Button>
          </div>

          {/* Add Event Button - Positioned at the far right */}
          <Button
            onClick={() => window.open('https://tally.so/r/m606Pk', '_blank')}
            className="h-12 w-12 p-0 rounded-full liquid-glass bg-gradient-to-r from-orange-500 to-purple-500 text-white transition-all duration-300 border border-orange-400/50 hover:from-orange-600 hover:to-purple-600 shadow-lg"
            title="Event hinzufügen"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>
      ) : (
        /* Mobile: Emoji-only circular buttons with equal spacing */
        <div className="flex items-center justify-center gap-4 px-2">
          {/* Category Filter Mobile */}
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className={`h-12 w-12 p-0 rounded-full border-0 liquid-glass text-lg transition-all duration-300 flex items-center justify-center ${
              selectedCategory && selectedCategory !== "all" 
                ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            } [&>svg]:hidden`}>
              <span>🎭</span>
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

          {/* Audience Filter Mobile */}
          <Select value={selectedAudience} onValueChange={onAudienceChange}>
            <SelectTrigger className={`h-12 w-12 p-0 rounded-full border-0 liquid-glass text-lg transition-all duration-300 flex items-center justify-center ${
              selectedAudience && selectedAudience !== "all" 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            } [&>svg]:hidden`}>
              <span>🎯</span>
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-0 ios-glass-popup">
              {audienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-full focus:bg-white/10 text-white data-[highlighted]:text-white hover:text-white">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filter Mobile */}
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            mobile={true}
          />

          {/* Free Events Filter Mobile */}
          <Button
            variant="outline"
            onClick={() => onFreeEventsChange(!showFreeEventsOnly)}
            className={`h-12 w-12 p-0 rounded-full border-0 liquid-glass text-lg transition-all duration-300 ${
              showFreeEventsOnly 
                ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title="Kostenlose Events"
          >
            <span>🆓</span>
          </Button>

          {/* Add Event Button Mobile */}
          <Button
            onClick={() => window.open('https://tally.so/r/m606Pk', '_blank')}
            className="h-12 w-12 p-0 rounded-full liquid-glass bg-white/20 text-white transition-all duration-300 border-0 hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 text-lg"
            title="Event hinzufügen"
          >
            <span>➕</span>
          </Button>

          {/* Clear Filters Button Mobile */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="h-12 w-12 p-0 rounded-full border-0 liquid-glass bg-white/20 text-white hover:bg-white/30 transition-all duration-200 text-lg"
              title="Filter löschen"
            >
              <span>🗑️</span>
            </Button>
          )}
        </div>
      )}

      

      

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl">
            {searchQuery && (
              <div className="flex items-center gap-1 bg-purple-500/20 text-white px-3 py-1 rounded-full text-sm border border-purple-400/30">
                <span>🔍 "{searchQuery}"</span>
                <button 
                  onClick={() => removeFilter('search')}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
            {selectedCategory && selectedCategory !== "all" && (
              <div className="flex items-center gap-1 bg-orange-500/20 text-white px-3 py-1 rounded-full text-sm border border-orange-400/30">
                <span>{selectedCategory}</span>
                <button 
                  onClick={() => removeFilter('category')}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
            {selectedAudience && selectedAudience !== "all" && (
              <div className="flex items-center gap-1 bg-blue-500/20 text-white px-3 py-1 rounded-full text-sm border border-blue-400/30">
                <span>{getAudienceLabel(selectedAudience)}</span>
                <button 
                  onClick={() => removeFilter('audience')}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
            {(dateFrom || dateTo) && (
              <div className="flex items-center gap-1 bg-lime-500/20 text-white px-3 py-1 rounded-full text-sm border border-lime-400/30">
                <span>📅 {dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : dateFrom || dateTo}</span>
                <button 
                  onClick={() => removeFilter('date')}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
            {showFreeEventsOnly && (
              <div className="flex items-center gap-1 bg-green-500/20 text-white px-3 py-1 rounded-full text-sm border border-green-400/30">
                <span>🆓 Kostenlos</span>
                <button 
                  onClick={() => removeFilter('freeEvents')}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}

export default SearchFilters;
