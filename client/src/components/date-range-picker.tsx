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
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>(
    dateFrom ? new Date(dateFrom) : undefined
  );
  const [tempToDate, setTempToDate] = useState<Date | undefined>(
    dateTo ? new Date(dateTo) : undefined
  );

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
        setTempFromDate(date);
        setTempToDate(undefined);
        // Auto-apply for single date selection for better UX
        setTimeout(() => {
          onDateFromChange(date.toISOString().split('T')[0]);
          onDateToChange("");
          setIsOpen(false);
        }, 100);
      }
    } else if (mode === "range") {
      if (date instanceof Date) {
        // Single date click in range mode
        if (!tempFromDate || (tempFromDate && tempToDate)) {
          // Start new range
          setTempFromDate(date);
          setTempToDate(undefined);
        } else {
          // Complete range
          if (date < tempFromDate) {
            setTempToDate(tempFromDate);
            setTempFromDate(date);
          } else {
            setTempToDate(date);
          }
        }
      } else if (typeof date === 'object' && 'from' in date) {
        // Range object from calendar
        setTempFromDate(date.from);
        setTempToDate(date.to);
      }
    }
  };

  const handleApply = () => {
    if (tempFromDate) {
      onDateFromChange(tempFromDate.toISOString().split('T')[0]);
    } else {
      onDateFromChange("");
    }
    
    if (tempToDate) {
      onDateToChange(tempToDate.toISOString().split('T')[0]);
    } else if (mode === "single") {
      onDateToChange("");
    }
    
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempFromDate(dateFrom ? new Date(dateFrom) : undefined);
    setTempToDate(dateTo ? new Date(dateTo) : undefined);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setTempFromDate(today);
    if (mode === "single") {
      setTempToDate(undefined);
      // Auto-apply today for single date mode
      onDateFromChange(today.toISOString().split('T')[0]);
      onDateToChange("");
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setTempFromDate(undefined);
    setTempToDate(undefined);
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
      <PopoverContent className="w-auto p-0 liquid-glass-strong border-0 rounded-2xl" align="start">
        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("single");
                setTempToDate(undefined);
              }}
              className="text-xs rounded-xl"
            >
              📅 Einzelnes Datum
            </Button>
            <Button
              variant={mode === "range" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("range")}
              className="text-xs rounded-xl"
            >
              📅 Zeitraum
            </Button>
          </div>

          {/* Calendar */}
          {mode === "range" ? (
            <Calendar
              mode="range"
              selected={
                tempFromDate && tempToDate
                  ? { from: tempFromDate, to: tempToDate }
                  : tempFromDate
                  ? { from: tempFromDate, to: undefined }
                  : undefined
              }
              onSelect={handleDateSelect}
              initialFocus
              locale={de}
              className="rounded-xl border-0"
            />
          ) : (
            <Calendar
              mode="single"
              selected={tempFromDate}
              onSelect={handleDateSelect}
              initialFocus
              locale={de}
              className="rounded-xl border-0"
            />
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="text-xs rounded-xl"
            >
              Heute
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs rounded-xl"
            >
              Löschen
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 rounded-xl"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 rounded-xl bg-brand-blue hover:bg-brand-blue/90"
            >
              Anwenden
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}