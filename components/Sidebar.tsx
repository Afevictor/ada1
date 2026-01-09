
import React from 'react';
import { Sparkles, Calendar as CalendarIcon, Filter, Layers } from 'lucide-react';
import { format, getDaysInMonth, isSameDay, isSameMonth, startOfMonth } from '../utils/dateUtils';

interface SidebarProps {
  currentDate: Date;
  onDateSelect: (d: Date) => void;
  onOpenSmart: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentDate, onDateSelect, onOpenSmart }) => {
  const days = getDaysInMonth(currentDate);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col p-4 shrink-0 overflow-y-auto">
      <button 
        onClick={onOpenSmart}
        className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-semibold text-sm border border-indigo-100 hover:bg-indigo-100 transition-all mb-8 shadow-sm group"
      >
        <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
        Smart Schedule
      </button>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Navigator</h3>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {weekDays.map(d => (
            <div key={d} className="text-[10px] font-bold text-gray-400 h-6 flex items-center justify-center">{d}</div>
          ))}
          {days.map((day, i) => {
            const isSelected = isSameDay(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <button
                key={i}
                onClick={() => onDateSelect(day)}
                className={`
                  text-xs h-8 w-8 rounded-full flex items-center justify-center m-auto transition-all
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 font-medium'}
                  ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100'}
                  ${isToday && !isSelected ? 'text-blue-600 border border-blue-200 ring-2 ring-blue-50' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Calendars</h3>
          <div className="space-y-1">
            <CalendarItem label="Personal" color="bg-blue-500" checked />
            <CalendarItem label="Work" color="bg-indigo-500" checked />
            <CalendarItem label="Family" color="bg-emerald-500" />
            <CalendarItem label="Tasks" color="bg-amber-500" checked />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Upcoming</h3>
          <p className="px-2 text-xs text-gray-500 italic">No events scheduled for the next 24 hours.</p>
        </div>
      </div>
    </aside>
  );
};

const CalendarItem: React.FC<{ label: string; color: string; checked?: boolean }> = ({ label, color, checked = false }) => (
  <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
    <input type="checkbox" defaultChecked={checked} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
    <span className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
  </label>
);

export default Sidebar;
