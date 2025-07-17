import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangePickerProps {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export function DateRangePicker({ dateFrom, dateTo, onDateFromChange, onDateToChange }: DateRangePickerProps) {
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
          className={`
            rounded-full border-0 liquid-glass bg-white/20 text-white
            ${isMobile 
              ? 'w-12 h-12 p-0 justify-center' 
              : 'px-4 py-2 min-w-[140px] justify-between'
            }
            ${hasSelection ? 'bg-brand-lime/30 border-brand-lime/40 hover:bg-brand-lime/40' : 'hover:bg-white/20'}
          `}
        >
          {isMobile ? (
            <span className="text-lg">📅</span>
          ) : (
            <>
              <CalendarDays className="h-4 w-4 mr-2" />
              <span className="flex-1 text-left">{getButtonText()}</span>
              {hasSelection && (
                <X 
                  className="h-3 w-3 ml-2 hover:bg-white/20 rounded-full p-0.5" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0 rounded-2xl border-0 ios-glass-popup" align="start">
        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === 'single' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('single')}
              className={`text-xs rounded-full px-3 py-1 ${
                mode === 'single' 
                  ? 'bg-brand-orange text-white hover:bg-brand-orange/80' 
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
              }`}
            >
              📅 Einzeltag
            </Button>
            <Button
              variant={mode === 'range' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('range')}
              className={`text-xs rounded-full px-3 py-1 ${
                mode === 'range' 
                  ? 'bg-brand-orange text-white hover:bg-brand-orange/80' 
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
              }`}
            >
              📊 Zeitraum
            </Button>
          </div>

          {/* Calendar */}
          <Calendar
            mode={mode === 'single' ? 'single' : 'range'}
            selected={mode === 'single' ? tempFromDate : { from: tempFromDate, to: tempToDate }}
            onSelect={mode === 'single' ? handleSingleDateSelect : handleRangeSelect}
            numberOfMonths={1}
            locale={de}
            className={`rounded-2xl date-range-calendar ${mode === 'single' ? 'single-mode' : 'range-mode'}`}
          />

          {/* Action Buttons */}
          <div className="flex justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3"
            >
              Löschen
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3"
              >
                Abbrechen
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-brand-orange hover:bg-brand-purple text-white rounded-full px-4"
              >
                Übernehmen
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}