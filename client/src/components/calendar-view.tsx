import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";

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

  // Group events by date
  const eventsByDate: { [key: string]: Event[] } = {};
  events.forEach(event => {
    if (event.date) {
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
    const title = event.title.toLowerCase();
    const category = event.category?.toLowerCase() || '';
    
    // Check for specific keywords and categories
    if (category.includes('dating') || category.includes('❤️')) return '❤️';
    if (category.includes('festivals') || category.includes('🃏')) return '🎉';
    if (category.includes('musik') || title.includes('konzert') || title.includes('musik')) return '🎵';
    if (category.includes('sport') || title.includes('sport')) return '⚽';
    if (category.includes('kunst') || title.includes('kunst') || title.includes('galerie')) return '🎨';
    if (category.includes('theater') || title.includes('theater')) return '🎭';
    if (category.includes('kino') || title.includes('film')) return '🎬';
    if (category.includes('essen') || title.includes('restaurant') || title.includes('food')) return '🍽️';
    if (category.includes('nacht') || title.includes('party') || title.includes('club')) return '🌙';
    if (category.includes('markt') || title.includes('markt')) return '🛍️';
    if (category.includes('workshop') || title.includes('workshop')) return '🛠️';
    if (category.includes('konferenz') || title.includes('meeting')) return '👥';
    if (title.includes('weihnacht') || title.includes('christmas')) return '🎄';
    if (title.includes('silvester') || title.includes('new year')) return '🎆';
    if (title.includes('outdoor') || title.includes('wandern')) return '🏞️';
    
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
      <Card className="rounded-[2rem] border-0 liquid-glass">
        <CardContent className="p-8">
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
              const isToday = 
                new Date().getDate() === day && 
                new Date().getMonth() === currentDate.getMonth() && 
                new Date().getFullYear() === currentDate.getFullYear();
              
              const weekend = isWeekend(day);
              const holiday = isHoliday(day);
              const isSpecialDay = weekend || holiday;

              return (
                <div
                  key={`day-${day}`}
                  className={`p-3 h-32 border-0 rounded-2xl relative overflow-hidden transition-all duration-300 ${
                    isToday 
                      ? 'bg-brand-lime/80 liquid-glass-strong ring-2 ring-brand-blue/50' 
                      : isSpecialDay
                        ? 'liquid-glass bg-brand-purple/20 hover:liquid-glass-strong'
                        : 'liquid-glass hover:liquid-glass-strong'
                  }`}
                >
                  <div className={`text-sm font-bold mb-1 ${
                    isToday 
                      ? 'text-brand-black' 
                      : isSpecialDay 
                        ? 'text-brand-purple drop-shadow-sm'
                        : 'text-white drop-shadow-sm'
                  }`}>
                    {day}
                    {holiday && <span className="ml-1">🎄</span>}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={`${day}-event-${eventIndex}`}
                        className="text-xs px-2 py-1 rounded-full truncate liquid-glass bg-white/40 text-gray-900 border border-white/20 cursor-pointer hover:bg-white/50 transition-colors"
                        title={`${event.title} - ${event.time || 'Ganztägig'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <span className="mr-1">{getEventEmoji(event)}</span>
                        {event.title}
                      </div>
                    ))}
                    
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
        </CardContent>
      </Card>

      {/* Events List for Selected Month */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white drop-shadow-sm">
          Alle Events im {monthNames[currentDate.getMonth()]}
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events
            .filter(event => {
              if (!event.date) return false;
              const eventDate = new Date(event.date);
              return eventDate.getMonth() === currentDate.getMonth() && 
                     eventDate.getFullYear() === currentDate.getFullYear();
            })
            .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
            .map((event, index) => (
              <Card 
                key={`monthly-event-${index}-${event.notionId}`} 
                className="liquid-glass rounded-2xl border-0 hover:liquid-glass-strong transition-all duration-300 cursor-pointer"
                onClick={() => onEventClick?.(event)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white drop-shadow-sm line-clamp-2">
                      <span className="mr-2">{getEventEmoji(event)}</span>
                      {event.title}
                    </h4>
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-white/80 mb-3 line-clamp-2 drop-shadow-sm">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="space-y-1 text-sm text-white/70 drop-shadow-sm">
                    {event.date && (
                      <div>
                        📅 {new Date(event.date).toLocaleDateString('de-DE')}
                        {event.time && ` um ${event.time}`}
                      </div>
                    )}
                    {event.location && <div>📍 {event.location}</div>}
                    {event.price && <div>💰 €{event.price}</div>}
                  </div>
                  
                  {event.website && (
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-brand-blue hover:text-brand-lime text-sm drop-shadow-sm transition-colors"
                    >
                      Mehr Infos →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}