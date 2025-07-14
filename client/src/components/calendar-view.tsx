import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";

interface CalendarViewProps {
  events: Event[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
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

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  const getCategoryColor = (category: string) => {
    return "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
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
      <Card className="rounded-3xl border-0 liquid-glass-strong">
        <CardContent className="p-8">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2 h-24"></div>;
              }

              const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = 
                new Date().getDate() === day && 
                new Date().getMonth() === currentDate.getMonth() && 
                new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={`day-${day}`}
                  className={`p-3 h-28 border-0 rounded-2xl relative overflow-hidden transition-all duration-300 ${
                    isToday ? 'bg-brand-lime/90 liquid-glass-strong ring-2 ring-brand-blue/50' : 'liquid-glass hover:liquid-glass-strong'
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-brand-black' : 'text-gray-900'}`}>
                    {day}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={`${day}-event-${eventIndex}`}
                        className="text-xs px-2 py-1 rounded-full truncate liquid-glass bg-white/30 text-gray-800"
                        title={`${event.title} - ${event.time || 'Ganztägig'}`}
                      >
                        {event.time && (
                          <span className="font-medium">{event.time.slice(0, 5)} </span>
                        )}
                        {event.title}
                      </div>
                    ))}
                    
                    {/* Show "+X more" if there are more events */}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - 2} weitere
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
        <h3 className="text-lg font-semibold text-gray-900">
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
              <Card key={`monthly-event-${index}-${event.notionId}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h4>
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="space-y-1 text-sm text-gray-500">
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
                      className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm"
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