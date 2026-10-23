import React, { useState } from 'react';
import {
  Pin,
  Clock,
  MapPin,
  User,
  Plus,
  ExternalLink,
  Megaphone,
  CalendarDays,
} from 'lucide-react';
import { Announcement, CampusEvent, UserProfile } from '../types';

interface AnnouncementsEventsViewProps {
  announcements: Announcement[];
  events: CampusEvent[];
  currentUser: UserProfile;
  onAddAnnouncement: (announcement: Announcement) => void;
  onAddEvent: (event: CampusEvent) => void;
}

export const AnnouncementsEventsView: React.FC<AnnouncementsEventsViewProps> = ({
  announcements,
  events,
  currentUser,
  onAddAnnouncement,
  onAddEvent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'events'>('announcements');
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // New Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annAudience, setAnnAudience] = useState<'All' | 'Students' | 'Hostel Residents' | 'Campus Staff'>('All');
  const [annPinned, setAnnPinned] = useState(false);

  // New Event state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [eventRegUrl, setEventRegUrl] = useState('');

  const isWardenOrAdmin =
    currentUser.role === 'Admin' ||
    (currentUser.role === 'Campus Staff' &&
      (currentUser.designation === 'Warden' || currentUser.designation === 'Head Warden'));

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      message: annMessage.trim(),
      authorUid: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role === 'Campus Staff' ? currentUser.designation || 'Warden' : 'Admin',
      publishedAt: new Date().toISOString(),
      targetAudience: annAudience,
      isPinned: annPinned,
    };

    onAddAnnouncement(newAnn);
    setShowAnnModal(false);
    setAnnTitle('');
    setAnnMessage('');
    setAnnPinned(false);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDateTime.trim()) return;

    const newEvt: CampusEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle.trim(),
      description: eventDesc.trim(),
      dateTime: eventDateTime.trim(),
      location: eventLocation.trim() || 'Campus Main Grounds',
      organizer: eventOrganizer.trim() || currentUser.name,
      audience: 'All Campus Members',
      registrationUrl: eventRegUrl.trim() || undefined,
      isOfficial: true,
    };

    onAddEvent(newEvt);
    setShowEventModal(false);
    setEventTitle('');
    setEventDesc('');
    setEventDateTime('');
    setEventLocation('');
    setEventOrganizer('');
    setEventRegUrl('');
  };

  return (
    <div className="space-y-6 text-left pb-8">
      {/* Tab Switcher & Publisher controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-mocha-200/90 shadow-subtle">
        <div className="flex items-center gap-2 p-1 bg-mocha-100/90 rounded-2xl border border-mocha-200/80">
          <button
            onClick={() => setActiveSubTab('announcements')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 active:scale-95 ${
              activeSubTab === 'announcements'
                ? 'bg-burgundy-900 text-latte-50 shadow-sm'
                : 'text-mocha-700 hover:text-burgundy-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Official Notices ({announcements.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 active:scale-95 ${
              activeSubTab === 'events'
                ? 'bg-burgundy-900 text-latte-50 shadow-sm'
                : 'text-mocha-700 hover:text-burgundy-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Campus Events ({events.length})</span>
          </button>
        </div>

        {isWardenOrAdmin && (
          <div className="flex items-center gap-2">
            {activeSubTab === 'announcements' ? (
              <button
                onClick={() => setShowAnnModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 text-xs font-extrabold rounded-2xl transition-all shadow-[0_4px_16px_rgba(37,3,9,0.25)] active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-mocha-300 stroke-[2.5]" />
                <span>Publish Notice</span>
              </button>
            ) : (
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 text-xs font-extrabold rounded-2xl transition-all shadow-[0_4px_16px_rgba(37,3,9,0.25)] active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-mocha-300 stroke-[2.5]" />
                <span>Schedule Event</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Announcements Feed */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 rounded-3xl border transition-all text-left bg-white ${
                ann.isPinned
                  ? 'border-burgundy-200/90 shadow-[0_8px_30px_rgba(120,16,34,0.06)] bg-gradient-to-r from-burgundy-50/40 via-white to-white'
                  : 'border-mocha-200/90 shadow-subtle hover:border-mocha-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {ann.isPinned && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-burgundy-900 bg-burgundy-100/90 px-2.5 py-0.5 rounded-full border border-burgundy-200 font-mono uppercase tracking-wide">
                      <Pin className="w-3 h-3 text-burgundy-700" /> Pinned Notice
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-mocha-800 bg-mocha-100 px-2.5 py-0.5 rounded-lg border border-mocha-200/70 font-mono">
                    Audience: {ann.targetAudience}
                  </span>
                </div>
                <span className="text-xs text-mocha-500 font-mono">
                  {new Date(ann.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-burgundy-950 mb-2 tracking-tight">
                {ann.title}
              </h3>
              <p className="text-xs sm:text-sm text-mocha-900/90 leading-relaxed whitespace-pre-wrap font-medium">
                {ann.message}
              </p>

              <div className="mt-5 pt-3.5 border-t border-mocha-100 flex items-center justify-between text-xs text-mocha-600 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-mocha-100 flex items-center justify-center text-mocha-700">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>Published by <strong className="text-burgundy-950">{ann.authorName}</strong> ({ann.authorRole})</span>
                </div>
                <span className="text-[10px] font-mono text-mocha-400 uppercase">AIT Institutional Broadcast</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campus Events Calendar */}
      {activeSubTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-6 bg-white rounded-3xl border border-mocha-200/90 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold text-burgundy-900 bg-burgundy-50 px-2.5 py-0.5 rounded-full border border-burgundy-200/70 font-mono uppercase tracking-wider">
                    Official Event
                  </span>
                  <span className="text-xs font-bold text-mocha-600 font-mono">{evt.audience}</span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-burgundy-950 mb-2 tracking-tight">
                  {evt.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-mocha-800 leading-relaxed mb-4 font-medium">
                  {evt.description}
                </p>

                <div className="space-y-2 text-xs text-mocha-800 bg-mocha-50/70 p-4 rounded-2xl border border-mocha-200/60 mb-4 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-burgundy-700 flex-shrink-0" />
                    <span><strong>When:</strong> {evt.dateTime}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-mocha-500 flex-shrink-0" />
                    <span><strong>Where:</strong> {evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User className="w-3.5 h-3.5 text-mocha-500 flex-shrink-0" />
                    <span><strong>Organizer:</strong> {evt.organizer}</span>
                  </div>
                </div>
              </div>

              {evt.registrationUrl && (
                <a
                  href={evt.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 text-xs font-bold rounded-2xl transition-all shadow-subtle active:scale-95"
                >
                  <span>RSVP / Details</span>
                  <ExternalLink className="w-3.5 h-3.5 text-mocha-300" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Publish Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/60 backdrop-blur-md animate-sonner">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-elevated border border-mocha-200">
            <h3 className="text-base font-extrabold text-burgundy-950 mb-1 tracking-tight">
              Publish Campus Announcement
            </h3>
            <p className="text-xs text-mocha-700 mb-4 font-medium">
              Authorized broadcast transmitted to all student portal feeds.
            </p>

            <form onSubmit={handleAnnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-mocha-900 mb-1.5">
                  Notice Title:
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g., Scheduled Water Supply Pipeline Maintenance"
                  required
                  className="w-full text-xs p-3 border border-mocha-200 rounded-2xl bg-mocha-50/50 focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 font-medium text-mocha-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Notice Body:
                </label>
                <textarea
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Explain instructions, schedules, affected hostels, and contact personnel..."
                  rows={4}
                  required
                  className="w-full text-xs p-3 border border-mocha-200 rounded-2xl bg-mocha-50/50 resize-none focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 font-medium leading-relaxed text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Target Audience:
                  </label>
                  <select
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-mocha-200 rounded-2xl bg-mocha-50/50 font-medium cursor-pointer text-slate-800"
                  >
                    <option value="All">All Campus</option>
                    <option value="Hostel Residents">Hostel Residents</option>
                    <option value="Students">Students Only</option>
                    <option value="Campus Staff">Campus Staff Only</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs text-mocha-800 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annPinned}
                      onChange={(e) => setAnnPinned(e.target.checked)}
                      className="rounded border-mocha-300 text-burgundy-700 focus:ring-burgundy-600"
                    />
                    <span>Pin to Top of Feed</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-mocha-100">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 text-xs font-bold text-mocha-700 hover:bg-mocha-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-burgundy-900 text-latte-50 font-extrabold rounded-xl hover:bg-burgundy-800 transition-all active:scale-95 shadow-sm"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/60 backdrop-blur-md animate-sonner">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-elevated border border-mocha-200">
            <h3 className="text-base font-extrabold text-burgundy-950 mb-1 tracking-tight">
              Schedule Campus Event
            </h3>
            <p className="text-xs text-mocha-700 mb-4 font-medium">
              Publish upcoming town halls, cultural events, or workshops on the student calendar.
            </p>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Event Title:</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Annual Campus Hackathon & Open House"
                  required
                  className="w-full text-xs p-3 border border-mocha-200 rounded-2xl font-medium focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 text-slate-800 bg-mocha-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Description:</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Agenda, speakers, rules, and prerequisites..."
                  rows={3}
                  className="w-full text-xs p-3 border border-mocha-200 rounded-2xl resize-none font-medium focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 text-slate-800 bg-mocha-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Date & Time:</label>
                  <input
                    type="text"
                    value={eventDateTime}
                    onChange={(e) => setEventDateTime(e.target.value)}
                    placeholder="e.g. Saturday, 10:00 AM IST"
                    required
                    className="w-full text-xs p-2.5 border border-mocha-200 rounded-2xl font-medium text-slate-800 bg-mocha-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Location:</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Main Auditorium"
                    className="w-full text-xs p-2.5 border border-mocha-200 rounded-2xl font-medium text-slate-800 bg-mocha-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Organizer:</label>
                  <input
                    type="text"
                    value={eventOrganizer}
                    onChange={(e) => setEventOrganizer(e.target.value)}
                    placeholder="e.g. Office of Student Affairs"
                    className="w-full text-xs p-2.5 border border-mocha-200 rounded-2xl font-medium text-slate-800 bg-mocha-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">RSVP / Registration URL:</label>
                  <input
                    type="text"
                    value={eventRegUrl}
                    onChange={(e) => setEventRegUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-2.5 border border-mocha-200 rounded-2xl font-medium text-slate-800 bg-mocha-50/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-mocha-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-xs font-bold text-mocha-700 hover:bg-mocha-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-burgundy-900 text-latte-50 font-extrabold rounded-xl hover:bg-burgundy-800 transition-all active:scale-95 shadow-sm"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AnnouncementsEventsView;
