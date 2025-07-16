import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "range">("range");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: dateFrom ? new Date(dateFrom) : undefined,
    to: dateTo ? new Date(dateTo) : undefined,
  });

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

  const handleDateSelect = (date: Date | undefined | { from?: Date; to?: Date }) => {
    if (!date) return;

    if (mode === "single") {
      if (date instanceof Date) {
        setDateRange({ from: date, to: undefined });
        // Auto-apply for single date selection for better UX
        setTimeout(() => {
          onDateFromChange(date.toISOString().split('T')[0]);
          onDateToChange(""); // Clear any existing end date
          setIsOpen(false);
        }, 100);
      }
    } else if (mode === "range") {
      if (typeof date === 'object' && 'from' in date) {
        // Range object from calendar (this is the proper way for range selection)
        setDateRange(date);
        
        // If we have a complete range, auto-apply it
        if (date.from && date.to) {
          setTimeout(() => {
            onDateFromChange(date.from!.toISOString().split('T')[0]);
            onDateToChange(date.to!.toISOString().split('T')[0]);
            setIsOpen(false);
          }, 100);
        }
      } else if (date instanceof Date) {
        // Single date click in range mode - start new range
        if (!dateRange.from || (dateRange.from && dateRange.to)) {
          setDateRange({ from: date, to: undefined });
        } else {
          // Complete range
          if (date < dateRange.from) {
            setDateRange({ from: date, to: dateRange.from });
          } else {
            setDateRange({ from: dateRange.from, to: date });
          }
        }
      }
    }
  };

  const handleApply = () => {
    applyDates();
  };

  const handleCancel = () => {
    setDateRange({
      from: dateFrom ? new Date(dateFrom) : undefined,
      to: dateTo ? new Date(dateTo) : undefined,
    });
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setDateRange({ from: today, to: mode === "single" ? undefined : dateRange.to });
    if (mode === "single") {
      // Auto-apply today for single date mode
      onDateFromChange(today.toISOString().split('T')[0]);
      onDateToChange("");
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="rounded-2xl border-0 liquid-glass bg-white/20 text-white hover:bg-white/30 justify-start text-left font-normal min-w-[200px]"
        >
          <CalendarDays className="mr-2 h-4 w-4 text-white/60" />
          <span className="text-white/90">
            {formatDateRange()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0 rounded-3xl overflow-hidden ios-glass-popup" align="start">
        <div className="p-6 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-3 p-1 bg-white/10 rounded-2xl backdrop-blur-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("single");
                setTempToDate(undefined);
              }}
              className={`flex-1 text-xs rounded-xl transition-all duration-300 ${
                mode === "single" 
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-xl" 
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              📅 Einzelnes Datum
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("range");
              }}
              className={`flex-1 text-xs rounded-xl transition-all duration-300 ${
                mode === "range" 
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-xl" 
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              📅 Zeitraum
            </Button>
          </div>

          {/* Calendar */}
          {mode === "range" ? (
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              initialFocus
              locale={de}
              className="rounded-2xl border-0 ios-calendar ios-calendar-range"
            />
          ) : (
            <Calendar
              mode="single"
              selected={dateRange.from}
              onSelect={handleDateSelect}
              initialFocus
              locale={de}
              className="rounded-2xl border-0 ios-calendar ios-calendar-single"
            />
          )}

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="flex-1 text-xs rounded-2xl bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-xl transition-all duration-300"
            >
              ☀️ Heute
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="flex-1 text-xs rounded-2xl bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-xl transition-all duration-300"
            >
              🗑️ Löschen
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="flex-1 rounded-2xl bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-xl transition-all duration-300"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 rounded-2xl bg-brand-blue/80 hover:bg-brand-blue text-white backdrop-blur-xl transition-all duration-300 shadow-lg"
            >
              Anwenden
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}