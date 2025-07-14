import { useState } from "react";
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
  onClearFilters: () => void;
}

const CATEGORIES = [
  { value: "all", label: "Alle Kategorien" },
  { value: "musik", label: "Musik" },
  { value: "theater", label: "Theater" },
  { value: "kunst", label: "Kunst" },
  { value: "sport", label: "Sport" },
  { value: "food", label: "Food & Drink" },
  { value: "workshop", label: "Workshops" },
  { value: "festival", label: "Festivals" },
];

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
}: SearchFiltersProps) {
  const hasActiveFilters = (selectedCategory && selectedCategory !== "all") || dateFrom || dateTo || searchQuery;

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(cat => cat.value === value)?.label || value;
  };

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'category':
        onCategoryChange("all");
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Events, Veranstaltungsorte oder Beschreibungen durchsuchen..."
            className="pl-10 py-3"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Alle Kategorien" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Von Datum</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bis Datum</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {searchQuery && (
            <Badge variant="default" className="bg-primary text-white">
              Suche: {searchQuery}
              <button
                className="ml-2 hover:text-gray-200"
                onClick={() => removeFilter('search')}
              >
                ×
              </button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="default" className="bg-primary text-white">
              {getCategoryLabel(selectedCategory)}
              <button
                className="ml-2 hover:text-gray-200"
                onClick={() => removeFilter('category')}
              >
                ×
              </button>
            </Badge>
          )}
          {dateFrom && (
            <Badge variant="default" className="bg-primary text-white">
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
            <Badge variant="default" className="bg-primary text-white">
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
            className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto"
            onClick={onClearFilters}
          >
            Alle Filter löschen
          </Button>
        </div>
      )}
    </div>
  );
}
