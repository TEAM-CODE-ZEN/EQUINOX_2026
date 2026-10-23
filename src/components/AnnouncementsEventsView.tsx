import React, { useState } from 'react';
import {
  Pin,
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  ExternalLink,
  Megaphone,
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
    <div className="space-y-6 text-left">
      {/* Tab Switcher & Publisher controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('announcements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'announcements'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 inline mr-1.5" />
            Official Announcements ({announcements.length})
          </button>
          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'events'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
            Campus Events ({events.length})
          </button>
        </div>

        {isWardenOrAdmin && (
          <div className="flex items-center gap-2">
            {activeSubTab === 'announcements' ? (
              <button
                onClick={() => setShowAnnModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-teal-400" />
                <span>Publish Announcement</span>
              </button>
            ) : (
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-teal-400" />
                <span>Create Campus Event</span>
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
              className={`p-5 rounded-2xl border transition-all text-left bg-white ${
                ann.isPinned
                  ? 'border-indigo-200 shadow-card bg-gradient-to-r from-indigo-50/30 to-white'
                  : 'border-slate-200 shadow-subtle hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    Audience: {ann.targetAudience}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(ann.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {ann.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {ann.message}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Published by <strong>{ann.authorName}</strong> ({ann.authorRole})</span>
                </div>
                <span className="text-[11px] text-slate-400">AIT Campus Broadcast</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campus Events Calendar */}
      {activeSubTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Official Event
                  </span>
                  <span className="text-xs text-slate-500">{evt.audience}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {evt.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>When:</strong> {evt.dateTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>Where:</strong> {evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>Organizer:</strong> {evt.organizer}</span>
                  </div>
                </div>
              </div>

              {evt.registrationUrl && (
                <a
                  href={evt.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <span>Register / RSVP Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Publish Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-elevated border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Publish Campus Announcement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Authorized broadcast visible to students and campus staff.
            </p>

            <form onSubmit={handleAnnSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title:
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g., Scheduled Water Supply Pipeline Maintenance"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Body:
                </label>
                <textarea
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Details of the announcement..."
                  rows={4}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Audience:
                  </label>
                  <select
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="All">All Campus</option>
                    <option value="Hostel Residents">Hostel Residents</option>
                    <option value="Students">Students Only</option>
                    <option value="Campus Staff">Campus Staff Only</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annPinned}
                      onChange={(e) => setAnnPinned(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Pin to top of feed</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800"
                >
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-elevated border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Create Official Campus Event
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add upcoming workshops, town halls, or sports events to the student calendar.
            </p>

            <form onSubmit={handleEventSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title:</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Annual Campus Tech Hackathon"
                  required
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description:</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Event schedule, rules, and speakers..."
                  rows={2}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time:</label>
                  <input
                    type="text"
                    value={eventDateTime}
                    onChange={(e) => setEventDateTime(e.target.value)}
                    placeholder="e.g., Saturday, 10:00 AM IST"
                    required
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location:</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g., Main Auditorium"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organizer:</label>
                  <input
                    type="text"
                    value={eventOrganizer}
                    onChange={(e) => setEventOrganizer(e.target.value)}
                    placeholder="e.g., Office of Student Affairs"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">RSVP / Registration Link:</label>
                  <input
                    type="text"
                    value={eventRegUrl}
                    onChange={(e) => setEventRegUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
