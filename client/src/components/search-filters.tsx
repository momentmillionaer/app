import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
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
            className="pl-10 py-4 rounded-full border-0 liquid-glass bg-white/20 text-white placeholder:text-white/50"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Controls - Horizontal Layout */}
      <div className={`flex flex-wrap items-start ${isMobile ? 'justify-center gap-3' : 'gap-4'}`}>
        {/* Category Filter */}
        <div className={isMobile ? "min-w-[48px]" : "min-w-[200px]"}>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className={`rounded-full border-0 liquid-glass bg-white/20 text-white ${isMobile ? 'w-12 h-12 p-0 justify-center [&>svg]:hidden' : ''}`}>
              {isMobile ? (
                <span className="text-lg">🗃️</span>
              ) : (
                <SelectValue placeholder="Alle Kategorien" className="text-white" />
              )}
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
        <div className={isMobile ? "min-w-[48px]" : "min-w-[200px]"}>
          <Select value={selectedAudience} onValueChange={onAudienceChange}>
            <SelectTrigger className={`rounded-full border-0 liquid-glass bg-white/20 text-white ${isMobile ? 'w-12 h-12 p-0 justify-center [&>svg]:hidden' : ''}`}>
              {isMobile ? (
                <span className="text-lg">
                  {selectedAudience === "all" ? "🎯" : audienceOptions.find(opt => opt.value === selectedAudience)?.emoji || "🎯"}
                </span>
              ) : (
                <SelectValue placeholder="Alle Zielgruppen" className="text-white" />
              )}
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
        <div className="min-w-[200px]">
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
          />
        </div>

        {/* Free Events Filter */}
        <Button
          variant={showFreeEventsOnly ? "default" : "outline"}
          onClick={() => onFreeEventsChange(!showFreeEventsOnly)}
          className={`rounded-full text-sm font-medium transition-all duration-200 ${
            isMobile ? 'w-12 h-12 p-0' : 'px-4 py-3'
          } ${
            showFreeEventsOnly 
              ? 'bg-brand-purple hover:bg-brand-orange text-black shadow-lg' 
              : isMobile
                ? 'bg-white/20 hover:bg-white/30 text-white border-0 liquid-glass'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/25'
          }`}
        >
          {isMobile ? (
            <span className="text-lg">🆓</span>
          ) : (
            "🆓 Nur kostenlose Events"
          )}
        </Button>

        {/* Add Event Button */}
        <Button
          onClick={() => window.open('https://tally.so/r/m606Pk', '_blank')}
          className={`rounded-full bg-brand-orange hover:bg-brand-purple text-white text-sm font-medium transition-all duration-200 shadow-lg ${
            isMobile ? 'w-12 h-12 p-0' : 'px-4 py-3'
          }`}
        >
          {isMobile ? (
            <span className="text-lg">➕</span>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Event hinzufügen
            </>
          )}
        </Button>

        {/* Clear Filters Button - Simple Trash Icon */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className={`rounded-full p-0 transition-all duration-200 ${
              isMobile 
                ? 'w-12 h-12 border-0 bg-white/20 text-white hover:bg-white/30 liquid-glass'
                : 'w-12 h-12 border-white/20 bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Filter löschen"
          >
            <span className="text-lg">🗑️</span>
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
    </div>
  );
}
