
import React from 'react';
import { 
  format, 
  getDaysInMonth, 
  getDaysInWeek, 
  isSameDay, 
  isSameMonth, 
  getTimeSlots, 
  startOfDay 
} from '../utils/dateUtils';
import { ViewMode, CalendarEvent } from '../types';

interface GridProps {
  viewMode: ViewMode;
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}

const CalendarGrid: React.FC<GridProps> = ({ viewMode, currentDate, events, onEventClick }) => {
  if (viewMode === 'Month') return <MonthView currentDate={currentDate} events={events} onEventClick={onEventClick} />;
  if (viewMode === 'Week') return <TimeGridView days={getDaysInWeek(currentDate)} events={events} onEventClick={onEventClick} />;
  return <TimeGridView days={[currentDate]} events={events} onEventClick={onEventClick} />;
};

const MonthView: React.FC<{ currentDate: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }> = ({ currentDate, events, onEventClick }) => {
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map(d => (
          <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr">
        {days.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(e.start, day)).slice(0, 3);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div key={i} className={`border-r border-b border-gray-100 p-2 min-h-0 flex flex-col ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}`}>
              <div className="flex justify-center mb-1">
                <span className={`
                  text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
                `}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full text-left px-2 py-0.5 rounded text-[10px] font-semibold truncate transition-transform active:scale-95 border border-black/5"
                    style={{ backgroundColor: event.color + '20', color: event.color, borderColor: event.color + '40' }}
                  >
                    {event.title}
                  </button>
                ))}
                {events.filter(e => isSameDay(e.start, day)).length > 3 && (
                  <div className="text-[9px] font-bold text-gray-400 pl-1">
                    + {events.filter(e => isSameDay(e.start, day)).length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimeGridView: React.FC<{ days: Date[]; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }> = ({ days, events, onEventClick }) => {
  const timeSlots = getTimeSlots();

  return (
    <div className="flex h-full overflow-hidden">
      {/* Time Sidebar */}
      <div className="w-20 border-r border-gray-200 flex flex-col bg-white shrink-0">
        <div className="h-12 border-b border-gray-200 shrink-0" />
        <div className="flex-1 overflow-hidden relative">
          {timeSlots.map(time => (
            <div key={time} className="h-20 border-b border-gray-50 px-2 flex justify-end">
              <span className="text-[10px] text-gray-400 font-bold -mt-2">{time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex overflow-x-auto">
        {days.map((day, di) => (
          <div key={di} className="flex-1 min-w-[150px] border-r border-gray-100 flex flex-col">
            <div className="h-12 border-b border-gray-200 flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(day, 'EEE')}</span>
              <span className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-700'}`}>{format(day, 'd')}</span>
            </div>
            <div className="flex-1 relative bg-gray-50/20">
              {timeSlots.map(time => (
                <div key={time} className="h-20 border-b border-gray-100/50" />
              ))}
              
              {/* Event layer */}
              {events.filter(e => isSameDay(e.start, day)).map(event => {
                const startHour = event.start.getHours();
                const startMin = event.start.getMinutes();
                const durationHours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                
                const top = (startHour * 80) + (startMin / 60 * 80);
                const height = Math.max(durationHours * 80, 20);

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="absolute left-1 right-1 rounded-lg border-l-4 p-2 text-left shadow-sm group transition-all hover:brightness-95 z-10"
                    style={{ 
                      top: `${top}px`, 
                      height: `${height}px`,
                      backgroundColor: event.color + '20',
                      color: event.color,
                      borderColor: event.color
                    }}
                  >
                    <div className="text-[11px] font-bold leading-none truncate mb-1">{event.title}</div>
                    <div className="text-[9px] font-medium opacity-80">{format(event.start, 'p')}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
