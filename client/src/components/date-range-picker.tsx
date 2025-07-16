import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange
}: DateRangePickerProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>(
    dateFrom ? new Date(dateFrom) : undefined
  );
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>(
    dateTo ? new Date(dateTo) : undefined
  );
  const [pendingUpdate, setPendingUpdate] = useState<NodeJS.Timeout | null>(null);

  // Format display text
  const formatDateRange = () => {
    if (dateFrom && dateTo) {
      const from = format(new Date(dateFrom), "dd.MM.yyyy", { locale: de });
      const to = format(new Date(dateTo), "dd.MM.yyyy", { locale: de });
      return `${from} - ${to}`;
    } else if (dateFrom) {
      return format(new Date(dateFrom), "dd.MM.yyyy", { locale: de });
    } else {
      return "Datum auswählen";
    }
  };

  // Update filters with delay after date selection
  const updateFiltersWithDelay = (from?: Date, to?: Date) => {
    // Clear previous timeout
    if (pendingUpdate) {
      clearTimeout(pendingUpdate);
    }

    // Set new timeout for delayed filter update
    const timeout = setTimeout(() => {
      if (from) {
        onDateFromChange(from.toISOString().split('T')[0]);
      } else {
        onDateFromChange("");
      }
      
      if (to) {
        onDateToChange(to.toISOString().split('T')[0]);
      } else {
        onDateToChange("");
      }
      setPendingUpdate(null);
    }, 800); // 800ms delay

    setPendingUpdate(timeout);
  };

  // Handle calendar date selection for range mode
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    
    setTempDateFrom(range.from);
    setTempDateTo(range.to);
    
    // Auto-apply with delay when both dates are selected
    if (range.from && range.to) {
      updateFiltersWithDelay(range.from, range.to);
    } else if (range.from && !range.to) {
      // Only start date selected, update immediately but clear end date
      updateFiltersWithDelay(range.from, undefined);
    }
  };

  // Quick selection handlers
  const handleToday = () => {
    const today = new Date();
    setTempDateFrom(today);
    setTempDateTo(today);
    updateFiltersWithDelay(today, today);
  };

  const handleThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    
    setTempDateFrom(startOfWeek);
    setTempDateTo(endOfWeek);
    updateFiltersWithDelay(startOfWeek, endOfWeek);
  };

  const handleThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setTempDateFrom(startOfMonth);
    setTempDateTo(endOfMonth);
    updateFiltersWithDelay(startOfMonth, endOfMonth);
  };

  const handleClear = () => {
    setTempDateFrom(undefined);
    setTempDateTo(undefined);
    updateFiltersWithDelay(undefined, undefined);
  };

  const handleCancel = () => {
    // Reset to current filter values
    setTempDateFrom(dateFrom ? new Date(dateFrom) : undefined);
    setTempDateTo(dateTo ? new Date(dateTo) : undefined);
    setIsOpen(false);
  };

  const handleApply = () => {
    // Apply current temp values immediately
    if (pendingUpdate) {
      clearTimeout(pendingUpdate);
      setPendingUpdate(null);
    }
    
    if (tempDateFrom) {
      onDateFromChange(tempDateFrom.toISOString().split('T')[0]);
    } else {
      onDateFromChange("");
    }
    
    if (tempDateTo) {
      onDateToChange(tempDateTo.toISOString().split('T')[0]);
    } else {
      onDateToChange("");
    }
    
    setIsOpen(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pendingUpdate) {
        clearTimeout(pendingUpdate);
      }
    };
  }, [pendingUpdate]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`justify-start text-left font-normal rounded-full h-10 bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-xl transition-all duration-300 ${
            isMobile ? 'w-12 p-0 justify-center' : 'w-full'
          }`}
        >
          {isMobile ? (
            <span className="text-lg">📅</span>
          ) : (
            <>
              <span className="mr-2 text-sm">📅</span>
              {formatDateRange()}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 rounded-2xl border-0 ios-glass-popup" 
        align="start"
      >
        <div className="p-4 space-y-4">
          {/* Calendar with range selection */}
          <Calendar
            mode="range"
            selected={{ from: tempDateFrom, to: tempDateTo }}
            onSelect={handleDateSelect}
            numberOfMonths={1}
            locale={de}
            className="rounded-3xl date-range-calendar"
          />

          {/* Quick Selection Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="text-xs rounded-full bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-xl transition-all duration-300"
            >
              ☀️ Heute
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThisWeek}
              className="text-xs rounded-full bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-xl transition-all duration-300"
            >
              📅 Diese Woche
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThisMonth}
              className="text-xs rounded-full bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-xl transition-all duration-300"
            >
              🗓️ Dieser Monat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs rounded-full bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-xl transition-all duration-300"
            >
              🗑️ Löschen
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="flex-1 rounded-full bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-xl transition-all duration-300"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 rounded-full bg-brand-orange hover:bg-brand-purple text-white backdrop-blur-xl transition-all duration-300 shadow-lg"
            >
              Anwenden
            </Button>
          </div>

          {/* Status indicator for pending updates */}
          {pendingUpdate && (
            <div className="text-center text-xs text-white/60">
              Filter wird in Kürze aktualisiert...
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}