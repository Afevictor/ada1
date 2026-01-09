
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, Search, Sparkles, X, Trash2, Calendar as CalendarIcon, Clock, AlignLeft } from 'lucide-react';
import { 
  format, 
  addMonths, subMonths, 
  addWeeks, subWeeks, 
  addDays, subDays, 
  isSameDay, 
  isSameMonth, 
  startOfMonth,
  startOfDay,
  parseISO
} from './utils/dateUtils';
import { ViewMode, CalendarEvent } from './types';
import CalendarGrid from './components/CalendarGrid';
import Sidebar from './components/Sidebar';
import { parseSmartEvent } from './services/geminiService';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSmartInputOpen, setIsSmartInputOpen] = useState(false);
  const [smartInputText, setSmartInputText] = useState('');
  const [isProcessingSmartInput, setIsProcessingSmartInput] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('lumina_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end)
        }));
        setEvents(parsed);
      } catch (e) {
        console.error("Failed to parse saved events", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_events', JSON.stringify(events));
  }, [events]);

  const handlePrev = () => {
    if (viewMode === 'Month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'Month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: crypto.randomUUID() };
    setEvents([...events, newEvent]);
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setSelectedEvent(null);
  };

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInputText.trim()) return;
    
    setIsProcessingSmartInput(true);
    const suggestion = await parseSmartEvent(smartInputText, new Date());
    setIsProcessingSmartInput(false);

    if (suggestion) {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: suggestion.title,
        description: suggestion.description || '',
        start: parseISO(suggestion.startDate),
        end: parseISO(suggestion.endDate),
        color: '#3b82f6' // Default blue
      };
      setEvents([...events, newEvent]);
      setSmartInputText('');
      setIsSmartInputOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      {/* Sidebar */}
      <Sidebar 
        currentDate={currentDate} 
        onDateSelect={setCurrentDate} 
        onOpenSmart={() => setIsSmartInputOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Lumina
            </h1>
            <div className="flex items-center ml-8 gap-1">
              <button onClick={handlePrev} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleToday} className="px-3 py-1.5 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors">
                Today
              </button>
              <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-lg font-semibold ml-4">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {(['Month', 'Week', 'Day'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === mode 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsEventModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Event</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-white">
          <CalendarGrid 
            viewMode={viewMode} 
            currentDate={currentDate} 
            events={events}
            onEventClick={setSelectedEvent}
          />
        </main>
      </div>

      {/* Smart Input Overlay */}
      {isSmartInputOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">Smart Event Creation</h3>
              </div>
              <button onClick={() => setIsSmartInputOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSmartSubmit}>
              <textarea
                autoFocus
                value={smartInputText}
                onChange={(e) => setSmartInputText(e.target.value)}
                placeholder="e.g., 'Dinner with Sophie tomorrow at 7pm at Gusto'"
                className="w-full h-32 p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all mb-4"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">Powered by Gemini AI</p>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsSmartInputOpen(false)} 
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isProcessingSmartInput || !smartInputText.trim()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessingSmartInput ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    Create Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Event Modal */}
      {isEventModalOpen && (
        <EventModal 
          onClose={() => setIsEventModalOpen(false)} 
          onSave={handleAddEvent}
        />
      )}

      {/* Event Details Overlay */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

// --- Helper Components ---

const EventModal: React.FC<{ onClose: () => void; onSave: (e: any) => void }> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    onSave({ title, start, end, color });
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">Create Manual Event</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
            <input 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Event Title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
              <input 
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Color</label>
              <input 
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full h-10 p-1 border rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time</label>
              <input 
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Time</label>
              <input 
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventDetailsModal: React.FC<{ event: CalendarEvent; onClose: () => void; onDelete: (id: string) => void }> = ({ event, onClose, onDelete }) => (
  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="h-2" style={{ backgroundColor: event.color }} />
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
          <button onClick={() => onDelete(event.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium">{format(event.start, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium">
              {format(event.start, 'p')} - {format(event.end, 'p')}
            </span>
          </div>
          {event.description && (
            <div className="flex items-start gap-3 text-gray-600 pt-2 border-t">
              <AlignLeft className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default App;
