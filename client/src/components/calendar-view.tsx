import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";
import { EventCard } from "./event-card";

interface CalendarViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  const daysInMonth = lastDayOfMonth.getDate();

  // Create array of dates for the calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Group events by date - handle merged events with multiple dates
  const eventsByDate: { [key: string]: Event[] } = {};
  events.forEach(event => {
    // Check if this event has multiple dates in description (merged event)
    if (event.description && event.description.startsWith('Termine:')) {
      const termineMatch = event.description.match(/^Termine: ([^\n]+)/);
      if (termineMatch) {
        const dates = termineMatch[1].split(',').map(d => d.trim());
        dates.forEach(dateStr => {
          if (dateStr) {
            const eventDate = new Date(dateStr);
            const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
            if (!eventsByDate[dateKey]) {
              eventsByDate[dateKey] = [];
            }
            eventsByDate[dateKey].push(event);
          }
        });
      }
    } else if (event.date) {
      // Single date event
      const eventDate = new Date(event.date);
      const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    }
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  // Function to generate emoji based on event content
  const getEventEmoji = (event: Event): string => {
    const title = event.title?.toLowerCase() || '';
    const category = event.category?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';
    const location = event.location?.toLowerCase() || '';
    
    // Combine all text for comprehensive analysis
    const fullText = `${title} ${category} ${description} ${location}`;
    
    // Food & Drinks - very specific matching
    if (fullText.includes('brunch') || fullText.includes('breakfast')) return '🥐';
    if (fullText.includes('pizza')) return '🍕';
    if (fullText.includes('burger')) return '🍔';
    if (fullText.includes('sushi') || fullText.includes('japanisch')) return '🍣';
    if (fullText.includes('pasta') || fullText.includes('italienisch')) return '🍝';
    if (fullText.includes('taco') || fullText.includes('mexikanisch')) return '🌮';
    if (fullText.includes('coffee') || fullText.includes('kaffee') || fullText.includes('café')) return '☕';
    if (fullText.includes('wein') || fullText.includes('wine') || fullText.includes('weinprobe')) return '🍷';
    if (fullText.includes('bier') || fullText.includes('beer') || fullText.includes('brewery')) return '🍺';
    if (fullText.includes('cocktail') || fullText.includes('bar')) return '🍸';
    if (fullText.includes('restaurant') || fullText.includes('dinner') || fullText.includes('essen') || category.includes('kulinarik')) return '🍽️';
    
    // Music & Entertainment
    if (fullText.includes('konzert') || fullText.includes('live music') || fullText.includes('band')) return '🎤';
    if (fullText.includes('dj') || fullText.includes('electronic') || fullText.includes('techno')) return '🎧';
    if (fullText.includes('klassik') || fullText.includes('orchester') || fullText.includes('symphony')) return '🎼';
    if (fullText.includes('jazz')) return '🎷';
    if (fullText.includes('rock') || fullText.includes('metal')) return '🎸';
    if (fullText.includes('karaoke')) return '🎙️';
    if (category.includes('musik') || title.includes('musik')) return '🎵';
    
    // Arts & Culture
    if (fullText.includes('theater') || fullText.includes('schauspiel') || fullText.includes('drama')) return '🎭';
    if (fullText.includes('kino') || fullText.includes('film') || fullText.includes('movie')) return '🎬';
    if (fullText.includes('ausstellung') || fullText.includes('galerie') || fullText.includes('kunst')) return '🎨';
    if (fullText.includes('museum')) return '🏛️';
    if (fullText.includes('fotografie') || fullText.includes('photo')) return '📸';
    if (fullText.includes('literatur') || fullText.includes('buch') || fullText.includes('lesung')) return '📚';
    
    // Sports & Fitness
    if (fullText.includes('fußball') || fullText.includes('football')) return '⚽';
    if (fullText.includes('tennis')) return '🎾';
    if (fullText.includes('basketball')) return '🏀';
    if (fullText.includes('volleyball')) return '🏐';
    if (fullText.includes('schwimmen') || fullText.includes('pool')) return '🏊';
    if (fullText.includes('laufen') || fullText.includes('marathon') || fullText.includes('running')) return '🏃';
    if (fullText.includes('yoga') || fullText.includes('meditation')) return '🧘';
    if (fullText.includes('fitness') || fullText.includes('gym')) return '💪';
    if (fullText.includes('wandern') || fullText.includes('hiking')) return '🥾';
    if (fullText.includes('ski') || fullText.includes('snowboard')) return '⛷️';
    if (fullText.includes('bike') || fullText.includes('rad') || fullText.includes('cycling')) return '🚴';
    
    // Nightlife & Entertainment
    if (fullText.includes('party') || fullText.includes('club') || fullText.includes('nightclub')) return '🎉';
    if (fullText.includes('disco') || fullText.includes('dance')) return '💃';
    if (fullText.includes('pub') || fullText.includes('kneipe')) return '🍻';
    
    // Dating & Social
    if (category.includes('dating') || category.includes('❤️') || fullText.includes('dating')) return '💕';
    if (fullText.includes('singles') || fullText.includes('flirt')) return '😍';
    if (fullText.includes('speed dating')) return '⚡';
    
    // Business & Networking
    if (fullText.includes('networking') || fullText.includes('business')) return '🤝';
    if (fullText.includes('workshop') || fullText.includes('seminar')) return '🛠️';
    if (fullText.includes('konferenz') || fullText.includes('conference')) return '👥';
    if (fullText.includes('startup') || fullText.includes('pitch')) return '💼';
    
    // Shopping & Markets
    if (fullText.includes('markt') || fullText.includes('market') || category.includes('märkte')) return '🛍️';
    if (fullText.includes('flohmarkt') || fullText.includes('flea market')) return '🧸';
    if (fullText.includes('weihnachtsmarkt') || fullText.includes('christmas market')) return '🎄';
    
    // Festivals & Events
    if (category.includes('festivals') || category.includes('🃏') || fullText.includes('festival')) return '🎪';
    if (fullText.includes('straßenfest') || fullText.includes('street festival')) return '🏮';
    if (fullText.includes('volksfest')) return '🎠';
    
    // Wellness & Health
    if (fullText.includes('spa') || fullText.includes('wellness')) return '💆';
    if (fullText.includes('massage')) return '🧘';
    if (fullText.includes('sauna')) return '🧖';
    
    // Nature & Outdoor
    if (fullText.includes('park') || fullText.includes('garden')) return '🌳';
    if (fullText.includes('beach') || fullText.includes('strand')) return '🏖️';
    if (fullText.includes('outdoor') || fullText.includes('nature')) return '🏞️';
    if (fullText.includes('picknick') || fullText.includes('picnic')) return '🧺';
    
    // Seasonal & Holiday
    if (fullText.includes('weihnacht') || fullText.includes('christmas')) return '🎄';
    if (fullText.includes('silvester') || fullText.includes('new year')) return '🎆';
    if (fullText.includes('ostern') || fullText.includes('easter')) return '🐰';
    if (fullText.includes('halloween')) return '🎃';
    if (fullText.includes('valentine')) return '💝';
    
    // Education & Learning
    if (fullText.includes('kurs') || fullText.includes('course') || fullText.includes('class')) return '📖';
    if (fullText.includes('sprache') || fullText.includes('language')) return '🗣️';
    if (fullText.includes('computer') || fullText.includes('tech')) return '💻';
    
    // Travel & Tourism
    if (fullText.includes('reise') || fullText.includes('travel') || fullText.includes('tour')) return '✈️';
    if (fullText.includes('stadtführung') || fullText.includes('city tour')) return '🗺️';
    
    // Default based on category
    if (category.includes('❤️')) return '💕';
    if (category.includes('🃏')) return '🎪';
    if (category.includes('🍽️')) return '🍽️';
    if (category.includes('🎵')) return '🎵';
    if (category.includes('🎨')) return '🎨';
    if (category.includes('⚽')) return '⚽';
    
    return '📅'; // Default calendar emoji
  };

  // Function to check if a day is weekend
  const isWeekend = (day: number): boolean => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  // Function to check if a day is a holiday (simplified - you can expand this)
  const isHoliday = (day: number): boolean => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const month = date.getMonth();
    const dayOfMonth = date.getDate();
    
    // Austrian holidays (simplified list)
    const holidays = [
      { month: 0, day: 1 },   // New Year
      { month: 4, day: 1 },   // Labour Day
      { month: 9, day: 26 },  // National Day
      { month: 11, day: 25 }, // Christmas Day
      { month: 11, day: 26 }, // Boxing Day
    ];
    
    return holidays.some(holiday => holiday.month === month && holiday.day === dayOfMonth);
  };

  const getCategoryColor = (category: string) => {
    return "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="p-3 border-0 text-brand-blue liquid-glass-button rounded-2xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="p-3 border-0 text-brand-blue liquid-glass-button rounded-2xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-[2rem] border-0 liquid-glass-strong p-8">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-white/80 drop-shadow-sm">
                {day}
              </div>
            ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2 h-32"></div>;
              }

              const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
              const dayEvents = eventsByDate[dateKey] || [];
              const today = new Date();
              const isToday = 
                today.getDate() === day && 
                today.getMonth() === currentDate.getMonth() && 
                today.getFullYear() === currentDate.getFullYear();
              
              const weekend = isWeekend(day);
              const holiday = isHoliday(day);
              const isSpecialDay = weekend || holiday;

              return (
                <div
                  key={`day-${day}`}
                  className={`p-3 h-32 border-0 rounded-2xl relative overflow-hidden transition-all duration-300 ${
                    isToday 
                      ? 'ring-2 ring-[#9DFF00]/70' 
                      : weekend
                        ? 'liquid-glass bg-black/30 hover:liquid-glass-strong'
                        : holiday
                        ? 'liquid-glass bg-brand-purple/20 hover:liquid-glass-strong'
                        : 'liquid-glass hover:liquid-glass-strong'
                  }`}
                  style={isToday ? { 
                    backgroundColor: 'rgba(157, 255, 0, 0.25)', // Pastel version of #9DFF00
                    backdropFilter: 'blur(30px) saturate(140%) brightness(1.2)',
                    WebkitBackdropFilter: 'blur(30px) saturate(140%) brightness(1.2)',
                    border: '2px solid rgba(157, 255, 0, 0.6)',
                    boxShadow: '0 0 20px rgba(157, 255, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  } : {}}
                >
                  <div className={`text-sm font-bold mb-1 ${
                    isToday 
                      ? 'text-black drop-shadow-lg font-extrabold' 
                      : isSpecialDay 
                        ? 'text-brand-purple drop-shadow-sm'
                        : 'text-white drop-shadow-sm'
                  }`}>
                    {day}
                    {holiday && <span className="ml-1">🎄</span>}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => {
                      // Check if THIS SPECIFIC event instance is in the past
                      const eventDate = new Date(event.date || '');
                      const todayMidnight = new Date();
                      todayMidnight.setHours(0, 0, 0, 0);
                      const isEventPast = eventDate < todayMidnight;
                      
                      return (
                        <div
                          key={`${day}-event-${eventIndex}`}
                          className={`text-xs px-2 py-1 rounded-full truncate liquid-glass border cursor-pointer transition-colors ${
                            isEventPast 
                              ? "bg-gray-400/20 border-gray-400/30 text-gray-400 opacity-60" // Past events are grayed out
                              : event.price === "0" 
                                ? "bg-brand-lime/80 border-brand-lime text-brand-black font-bold hover:bg-white/50" 
                                : "bg-white/40 border-white/20 text-gray-900 hover:bg-white/50"
                          }`}
                          title={`${event.title} - ${event.time || 'Ganztägig'}${event.price === "0" ? " • GRATIS" : ""}${isEventPast ? ' (Vergangen)' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <span className="mr-1">{getEventEmoji(event)}</span>
                          {event.title}
                          {!isEventPast && event.price === "0" && <span className="ml-1">🎉</span>}
                        </div>
                      );
                    })}
                    
                    {/* Show "+X more" if there are more events */}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-white/70 px-2 drop-shadow-sm">
                        +{dayEvents.length - 3} weitere
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Events List for Selected Month */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white drop-shadow-sm">
          Alle Events im {monthNames[currentDate.getMonth()]}
        </h3>
        
        <div className="space-y-4">
          {events
            .filter(event => {
              if (!event.date) return false;
              const eventDate = new Date(event.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // Filter to current month/year and exclude past events
              return eventDate.getMonth() === currentDate.getMonth() && 
                     eventDate.getFullYear() === currentDate.getFullYear() &&
                     eventDate >= today; // Only show future events
            })
            .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
            .map((event) => (
              <EventCard
                key={`monthly-event-${event.notionId}`}
                event={event}
                onClick={() => onEventClick?.(event)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}