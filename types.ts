
export type ViewMode = 'Month' | 'Week' | 'Day';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color: string;
}

export interface SmartEventSuggestion {
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
}
