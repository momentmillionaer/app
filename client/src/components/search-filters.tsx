import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  onClearFilters,
}: SearchFiltersProps) {
  
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

  // Create audience options with emojis
  const getAudienceEmoji = (audience: string): string => {
    if (audience.toLowerCase().includes('kind')) return '👶';
    if (audience.toLowerCase().includes('jugend')) return '🧒';
    if (audience.toLowerCase().includes('erwachsen')) return '🧑';
    if (audience.toLowerCase().includes('senior')) return '👴';
    if (audience.toLowerCase().includes('famili')) return '👨‍👩‍👧‍👦';
    if (audience.toLowerCase().includes('paar')) return '💑';
    if (audience.toLowerCase().includes('single')) return '🙋';
    if (audience.toLowerCase().includes('student')) return '🎓';
    return '🎯';
  };

  const audienceOptions = [
    { value: "all", label: "🎯 Alle Zielgruppen", emoji: "🎯" },
    ...audiences.map(audience => ({
      value: audience,
      label: `${getAudienceEmoji(audience)} ${audience}`,
      emoji: getAudienceEmoji(audience)
    }))
  ];

  const hasActiveFilters = (selectedCategory && selectedCategory !== "all") || 
                          (selectedAudience && selectedAudience !== "all") || 
                          dateFrom || dateTo || searchQuery;

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
      case 'search':
        onSearchChange("");
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
            className="pl-10 py-4 rounded-2xl border-0 liquid-glass bg-white/20 text-white placeholder:text-white/50"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Controls - Horizontal Layout */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Category Filter */}
        <div className="min-w-[200px]">
          <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">🎭 Kategorie</label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="rounded-2xl border-0 liquid-glass bg-white/20">
              <SelectValue placeholder="Alle Kategorien" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-0 liquid-glass-strong">
              <SelectItem value="all">🎭 Alle Kategorien</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audience Filter */}
        <div className="min-w-[200px]">
          <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">🎯 Zielgruppe</label>
          <Select value={selectedAudience} onValueChange={onAudienceChange}>
            <SelectTrigger className="rounded-2xl border-0 liquid-glass bg-white/20">
              <SelectValue placeholder="Alle Zielgruppen" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-0 liquid-glass-strong">
              {audienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">📅 Von Datum</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="rounded-2xl border-0 liquid-glass bg-white/20 text-white"
          />
        </div>

        {/* Date To */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">📅 Bis Datum</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="rounded-2xl border-0 liquid-glass bg-white/20 text-white"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div>
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 px-6"
            >
              🗑️ Filter löschen
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-white/80 drop-shadow-sm mr-2">Aktive Filter:</span>
          {searchQuery && (
            <Badge variant="default" className="bg-brand-blue text-white rounded-full shadow-sm">
              🔍 Suche: {searchQuery}
              <button
                className="ml-2 hover:text-gray-200"
                onClick={() => removeFilter('search')}
              >
                ×
              </button>
            </Badge>
          )}
          {selectedCategory && selectedCategory !== "all" && (
            <Badge variant="default" className="bg-brand-blue text-white rounded-full shadow-sm">
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
          {dateFrom && (
            <Badge variant="default" className="bg-brand-blue text-white rounded-full shadow-sm">
              Von: {dateFrom}
              <button
                className="ml-2 hover:text-gray-200"
                onClick={() => removeFilter('dateFrom')}
              >
                ×
              </button>
            </Badge>
          )}
          {dateTo && (
            <Badge variant="default" className="bg-brand-blue text-white rounded-full shadow-sm">
              Bis: {dateTo}
              <button
                className="ml-2 hover:text-gray-200"
                onClick={() => removeFilter('dateTo')}
              >
                ×
              </button>
            </Badge>
          )}
          <Button
            variant="link"
            className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto rounded-2xl"
            onClick={onClearFilters}
          >
            Alle Filter löschen
          </Button>
        </div>
      )}
    </div>
  );
}
