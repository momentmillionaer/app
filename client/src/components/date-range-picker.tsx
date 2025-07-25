import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, X, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangePickerProps {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  mobile?: boolean;
  compact?: boolean;
}

export function DateRangePicker({ dateFrom, dateTo, onDateFromChange, onDateToChange, mobile = false, compact = false }: DateRangePickerProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>();
  const [tempToDate, setTempToDate] = useState<Date | undefined>();

  // Initialize temp dates from props
  useEffect(() => {
    setTempFromDate(dateFrom ? new Date(dateFrom) : undefined);
    setTempToDate(dateTo ? new Date(dateTo) : undefined);
    setMode(dateTo ? 'range' : 'single');
  }, [dateFrom, dateTo]);

  // Format date to YYYY-MM-DD (local timezone)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle single date selection
  const handleSingleDateSelect = (date: Date | undefined) => {
    setTempFromDate(date);
    setTempToDate(undefined);
  };

  // Handle range selection
  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      setTempFromDate(undefined);
      setTempToDate(undefined);
      return;
    }
    
    setTempFromDate(range.from);
    setTempToDate(range.to);
  };

  // Apply changes and close
  const handleApply = () => {
    if (tempFromDate) {
      onDateFromChange(formatDateLocal(tempFromDate));
    } else {
      onDateFromChange("");
    }

    if (mode === 'range' && tempToDate) {
      onDateToChange(formatDateLocal(tempToDate));
    } else {
      onDateToChange("");
    }

    setIsOpen(false);
  };

  // Clear all dates
  const handleClear = () => {
    setTempFromDate(undefined);
    setTempToDate(undefined);
    onDateFromChange("");
    onDateToChange("");
    setIsOpen(false);
  };

  // Cancel changes
  const handleCancel = () => {
    setTempFromDate(dateFrom ? new Date(dateFrom) : undefined);
    setTempToDate(dateTo ? new Date(dateTo) : undefined);
    setIsOpen(false);
  };

  // Switch modes
  const handleModeChange = (newMode: 'single' | 'range') => {
    setMode(newMode);
    if (newMode === 'single') {
      setTempToDate(undefined);
    }
  };

  // Generate button text
  const getButtonText = () => {
    if (tempFromDate && mode === 'range' && tempToDate) {
      return `${format(tempFromDate, "dd.MM.yy", { locale: de })} - ${format(tempToDate, "dd.MM.yy", { locale: de })}`;
    } else if (tempFromDate) {
      return format(tempFromDate, "dd.MM.yyyy", { locale: de });
    }
    return "Datum wählen";
  };

  const hasSelection = tempFromDate || tempToDate;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`h-12 w-12 p-0 rounded-full border border-white/30 liquid-glass text-white transition-all duration-300 ${
            (dateFrom || dateTo) 
              ? 'bg-gradient-to-r from-lime-500 to-green-500 shadow-lg border-lime-400/50' 
              : 'bg-white/20 hover:bg-white/30'
          }`}
          title="Datum Filter"
        >
          <CalendarDays className="h-5 w-5 text-white" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0 rounded-2xl border-0 ios-glass-popup" align="start">
        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 p-2 bg-white/10 rounded-full mb-4">
            {mode === 'single' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleModeChange('single')}
                className="h-8 px-3 rounded-full text-sm bg-brand-orange text-white shadow-sm transition-all duration-200"
              >
                <CalendarDays className="w-3 h-3 mr-1" />
                Einzeltag
              </Button>
            ) : (
              <button
                onClick={() => handleModeChange('single')}
                className="h-8 px-3 text-sm text-white hover:text-white/80 transition-all duration-200 flex items-center"
              >
                <CalendarDays className="w-3 h-3 mr-1" />
                Einzeltag
              </button>
            )}
            
            {mode === 'range' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleModeChange('range')}
                className="h-8 px-3 rounded-full text-sm bg-brand-orange text-white shadow-sm transition-all duration-200"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Zeitraum
              </Button>
            ) : (
              <button
                onClick={() => handleModeChange('range')}
                className="h-8 px-3 text-sm text-white hover:text-white/80 transition-all duration-200 flex items-center"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Zeitraum
              </button>
            )}
          </div>

          {/* Calendar */}
          {mode === 'single' ? (
            <div className="border border-white/20 rounded-xl p-2 bg-white/5">
              <Calendar
                mode="single"
                selected={tempFromDate}
                onSelect={handleSingleDateSelect}
                numberOfMonths={1}
                locale={de}
                className="rounded-2xl date-range-calendar single-mode"
              />
            </div>
          ) : (
            <div className="border border-white/20 rounded-xl p-2 bg-white/5">
              <Calendar
                mode="range"
                selected={{ from: tempFromDate, to: tempToDate }}
                onSelect={handleRangeSelect}
                numberOfMonths={1}
                locale={de}
                className="rounded-2xl date-range-calendar range-mode"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs rounded-full px-3 py-1 bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              🗑️ Löschen
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              className="text-xs rounded-full px-3 py-1 bg-brand-orange text-white hover:bg-brand-orange/80"
            >
              ✓ Anwenden
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}