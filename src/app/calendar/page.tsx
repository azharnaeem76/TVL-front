'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { GavelSVG } from '@/components/CourtElements';
import { useToast } from '@/components/Toast';

const STORAGE_KEY = 'tvl_legal_calendar';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'hearing' | 'filing' | 'limitation' | 'meeting' | 'reminder' | 'other';
  court?: string;
  caseNumber?: string;
  notes?: string;
  completed: boolean;
}

const EVENT_TYPES = [
  { value: 'hearing', label: 'Court Hearing', color: 'bg-blue-500', textColor: 'text-blue-300', borderColor: 'border-blue-500/30' },
  { value: 'filing', label: 'Filing Deadline', color: 'bg-red-500', textColor: 'text-red-300', borderColor: 'border-red-500/30' },
  { value: 'limitation', label: 'Limitation Period', color: 'bg-amber-500', textColor: 'text-amber-300', borderColor: 'border-amber-500/30' },
  { value: 'meeting', label: 'Client Meeting', color: 'bg-emerald-500', textColor: 'text-emerald-300', borderColor: 'border-emerald-500/30' },
  { value: 'reminder', label: 'Reminder', color: 'bg-purple-500', textColor: 'text-purple-300', borderColor: 'border-purple-500/30' },
  { value: 'other', label: 'Other', color: 'bg-gray-500', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' },
];

const COURTS_LIST = [
  'Supreme Court of Pakistan',
  'Lahore High Court',
  'Sindh High Court',
  'Peshawar High Court',
  'Balochistan High Court',
  'Islamabad High Court',
  'Federal Shariat Court',
  'District & Sessions Court',
  'Civil Court',
  'Family Court',
  'Labour Court',
  'Banking Court',
  'Consumer Court',
  'Anti-Terrorism Court',
];

function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEvents(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((items: CalendarEvent[]) => {
    setEvents(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'completed'>) => {
    save([...events, { ...event, id: `evt_${Date.now()}`, completed: false }]);
  }, [events, save]);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    save(events.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [events, save]);

  const removeEvent = useCallback((id: string) => {
    save(events.filter(e => e.id !== id));
  }, [events, save]);

  return { events, addEvent, updateEvent, removeEvent };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [view, setView] = useState<'month' | 'list'>('month');
  const { events, addEvent, updateEvent, removeEvent } = useCalendarEvents();
  const { toast } = useToast();

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formType, setFormType] = useState<CalendarEvent['type']>('hearing');
  const [formCourt, setFormCourt] = useState('');
  const [formCaseNumber, setFormCaseNumber] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const resetForm = () => {
    setFormTitle('');
    setFormDate('');
    setFormTime('');
    setFormType('hearing');
    setFormCourt('');
    setFormCaseNumber('');
    setFormNotes('');
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;
    addEvent({
      title: formTitle,
      date: formDate,
      time: formTime || undefined,
      type: formType,
      court: formCourt || undefined,
      caseNumber: formCaseNumber || undefined,
      notes: formNotes || undefined,
    });
    toast('Event added', 'success');
    resetForm();
    setShowAddForm(false);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getDateStr = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDate = (dateStr: string) =>
    events.filter(e => e.date === dateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const getTypeConfig = (type: string) =>
    EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1];

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Upcoming events (next 30 days)
  const upcomingEvents = events
    .filter(e => {
      const d = new Date(e.date);
      const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30 && !e.completed;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <GavelSVG size={28} className="opacity-40" />
            <h1 className="text-3xl font-display font-bold text-white">Legal Calendar</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/[0.03] rounded-lg border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1.5 text-xs transition-colors ${view === 'month' ? 'bg-brass-400/15 text-brass-300' : 'text-gray-400 hover:text-white'}`}
              >Month</button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-xs transition-colors ${view === 'list' ? 'bg-brass-400/15 text-brass-300' : 'text-gray-400 hover:text-white'}`}
              >List</button>
            </div>
            <button
              onClick={() => { resetForm(); setFormDate(selectedDate || todayStr); setShowAddForm(true); }}
              className="btn-gavel !py-2 !px-4 text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Event
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar / List */}
          <div className="lg:col-span-2">
            {view === 'month' ? (
              <div className="court-panel p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevMonth} className="text-gray-400 hover:text-white transition-colors p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-center">
                    <h2 className="text-xl font-display font-bold text-white">{MONTHS[currentMonth]} {currentYear}</h2>
                    <button onClick={goToday} className="text-xs text-brass-400/60 hover:text-brass-300 transition-colors mt-1">Today</button>
                  </div>
                  <button onClick={nextMonth} className="text-gray-400 hover:text-white transition-colors p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">{d}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = getDateStr(day);
                    const dayEvents = getEventsForDate(dateStr);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                        className={`aspect-square rounded-lg p-1 flex flex-col items-center transition-all text-sm relative ${
                          isSelected
                            ? 'bg-brass-400/20 border border-brass-400/40'
                            : isToday
                              ? 'bg-brass-400/10 border border-brass-400/20'
                              : 'hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        <span className={`text-xs font-medium ${isToday ? 'text-brass-300' : isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                            {dayEvents.slice(0, 3).map(e => (
                              <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${getTypeConfig(e.type).color}`} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? upcomingEvents.map(e => {
                  const tc = getTypeConfig(e.type);
                  return (
                    <div key={e.id} className={`court-panel p-4 border-l-2 ${tc.borderColor}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tc.color}/20 ${tc.textColor}`}>{tc.label}</span>
                            {e.completed && <span className="text-xs text-emerald-400">Done</span>}
                          </div>
                          <h4 className={`font-semibold ${e.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{e.title}</h4>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                            <span>{new Date(e.date + 'T00:00:00').toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            {e.time && <span>{e.time}</span>}
                            {e.court && <span>{e.court}</span>}
                            {e.caseNumber && <span className="font-mono">{e.caseNumber}</span>}
                          </div>
                          {e.notes && <p className="text-xs text-gray-500 mt-2 italic">{e.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateEvent(e.id, { completed: !e.completed })}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                              e.completed ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-emerald-300'
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { removeEvent(e.id); toast('Event removed', 'info'); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-red-400 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500">No upcoming events in the next 30 days</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            {selectedDate && (
              <div className="court-panel p-5">
                <h3 className="text-sm font-semibold text-brass-400/60 uppercase tracking-wider mb-3">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                {selectedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEvents.map(e => {
                      const tc = getTypeConfig(e.type);
                      return (
                        <div key={e.id} className={`p-3 rounded-lg bg-white/[0.02] border ${tc.borderColor}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tc.color}/20 ${tc.textColor}`}>{tc.label}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => updateEvent(e.id, { completed: !e.completed })}
                                className={`text-xs ${e.completed ? 'text-emerald-400' : 'text-gray-600 hover:text-emerald-300'} transition-colors`}
                              >
                                {e.completed ? '✓ Done' : 'Mark done'}
                              </button>
                              <button
                                onClick={() => { removeEvent(e.id); toast('Removed', 'info'); }}
                                className="text-gray-600 hover:text-red-400 transition-colors ml-2"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm font-medium ${e.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{e.title}</p>
                          {e.time && <p className="text-xs text-gray-400 mt-1">{e.time}</p>}
                          {e.court && <p className="text-xs text-gray-500">{e.court}</p>}
                          {e.caseNumber && <p className="text-xs text-gray-500 font-mono">{e.caseNumber}</p>}
                          {e.notes && <p className="text-xs text-gray-600 mt-1 italic">{e.notes}</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No events on this date</p>
                )}
                <button
                  onClick={() => { resetForm(); setFormDate(selectedDate); setShowAddForm(true); }}
                  className="w-full mt-3 text-xs text-brass-400/60 hover:text-brass-300 py-2 border border-dashed border-brass-400/20 rounded-lg transition-colors"
                >
                  + Add event on this date
                </button>
              </div>
            )}

            {/* Upcoming */}
            <div className="court-panel p-5">
              <h3 className="text-xs font-semibold text-brass-400/50 uppercase tracking-wider mb-3">Upcoming Events</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 8).map(e => {
                    const tc = getTypeConfig(e.type);
                    const eventDate = new Date(e.date + 'T00:00:00');
                    const daysAway = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <button
                        key={e.id}
                        onClick={() => { setSelectedDate(e.date); setView('month'); const d = new Date(e.date); setCurrentMonth(d.getMonth()); setCurrentYear(d.getFullYear()); }}
                        className="w-full text-left flex items-center gap-3 py-2 hover:bg-white/[0.02] rounded-lg px-2 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${tc.color} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 truncate">{e.title}</p>
                          <p className="text-xs text-gray-500">{e.time || ''} {e.court || ''}</p>
                        </div>
                        <span className={`text-xs flex-shrink-0 ${daysAway <= 3 ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                          {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming events</p>
              )}
            </div>

            {/* Legend */}
            <div className="court-panel p-5">
              <h3 className="text-xs font-semibold text-brass-400/50 uppercase tracking-wider mb-3">Event Types</h3>
              <div className="space-y-2">
                {EVENT_TYPES.map(t => (
                  <div key={t.value} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                    <span className="text-xs text-gray-400">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowAddForm(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative w-full max-w-lg mx-4 court-panel p-4 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-white">Add Event</h2>
                <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="input-field !py-2.5"
                    placeholder="e.g., Hearing in Bail Application"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brass-400/60 mb-1">Date *</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="input-field !py-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brass-400/60 mb-1">Time</label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={e => setFormTime(e.target.value)}
                      className="input-field !py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Event Type</label>
                  <select value={formType} onChange={e => setFormType(e.target.value as CalendarEvent['type'])} className="input-field !py-2.5">
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Court</label>
                  <select value={formCourt} onChange={e => setFormCourt(e.target.value)} className="input-field !py-2.5">
                    <option value="">Select Court (optional)</option>
                    {COURTS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Case Number</label>
                  <input
                    type="text"
                    value={formCaseNumber}
                    onChange={e => setFormCaseNumber(e.target.value)}
                    className="input-field !py-2.5"
                    placeholder="e.g., Crl. Misc. No. 123/2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <button type="submit" className="btn-gavel w-full">
                  Add Event
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
