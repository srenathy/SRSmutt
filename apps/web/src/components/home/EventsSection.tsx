import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, ArrowRight, Sparkles } from 'lucide-react';
import { TempleArchMotif } from './SpiritualDecorations';

interface Announcement {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface EventsSectionProps {
  announcements: Announcement[];
  loading?: boolean;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  announcements = [],
  loading = false
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Announcement | null>(null);

  const pageSize = 4;
  const totalPages = Math.ceil(announcements.length / pageSize) || 1;
  const currentPage = Math.floor(startIndex / pageSize) + 1;

  const currentItems = announcements.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - pageSize));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + pageSize < announcements.length ? prev + pageSize : 0));
  };

  return (
    <section id="events" className="py-12 sm:py-16 bg-[#FAF6EE] border-b border-turmeric/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8C2F22]">
              <Calendar className="w-4 h-4 text-[#8C2F22]" />
              <span>ANNUAL CELEBRATIONS &amp; NOTICES</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C221E]">
              Upcoming Events &amp; Aradhana
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4D44]">
              Religious programs, festival celebrations, and announcements from Rajajinagar branch.
            </p>
          </div>

          {/* Slider Pagination Controls */}
          {announcements.length > pageSize && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={startIndex === 0}
                className="p-2 rounded-xl bg-white border border-turmeric/30 text-[#8C2F22] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ivory shadow-xs transition"
                aria-label="Previous events"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-[#5C4D44] px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-white border border-turmeric/30 text-[#8C2F22] hover:bg-ivory shadow-xs transition"
                aria-label="Next events"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-turmeric/20 rounded-2xl p-4 animate-pulse space-y-3">
                <div className="h-36 w-full bg-[#FAF6EE] rounded-xl" />
                <div className="h-4 w-20 bg-[#FAF6EE] rounded" />
                <div className="h-5 w-3/4 bg-[#FAF6EE] rounded" />
                <div className="h-10 w-full bg-[#FAF6EE] rounded" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          /* Graceful Devotional Empty State */
          <div className="bg-white border border-turmeric/20 rounded-3xl p-12 text-center text-xs text-[#5C4D44] max-w-2xl mx-auto space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-turmeric/30 flex items-center justify-center mx-auto text-xl text-[#8C2F22]">
              🛕
            </div>
            <p className="font-display font-bold text-base text-[#6B1616]">
              No special events currently scheduled.
            </p>
            <p className="text-xs leading-relaxed text-[#7A6B63]">
              Please check back regularly for upcoming Aradhana, Mahotsava &amp; Utsava details. Daily poojas and darshan continue as per regular schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedEvent(item)}
                className="group bg-white border border-turmeric/20 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#8C2F22]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Image Banner */}
                  <div className="w-full h-40 overflow-hidden bg-[#FAF6EE] relative border-b border-turmeric/10 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C99A3D]/10 to-[#8C2F22]/10 text-[#8C2F22] text-3xl font-bold">
                        🛕
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/95 text-[#8C2F22] shadow-xs border border-turmeric/30 font-mono">
                      {item.category || 'EVENT'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="text-[10px] text-[#7A6B63] font-mono font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#C99A3D] shrink-0" />
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>

                    <h3 className="font-display font-bold text-[#2C221E] text-base group-hover:text-[#8C2F22] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#5C4D44] leading-relaxed line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <span className="text-[11px] font-bold text-[#8C2F22] group-hover:text-[#6E2217] flex items-center gap-1">
                    Read Full Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Popup Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-turmeric/30 my-6 animate-in zoom-in-95 duration-200">
            {/* Header Image */}
            <div className="w-full max-h-72 overflow-hidden bg-[#FAF6EE] relative">
              {selectedEvent.imageUrl ? (
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover object-top max-h-72"
                />
              ) : (
                <div className="w-full h-44 flex items-center justify-center bg-gradient-to-br from-[#C99A3D]/20 to-[#8C2F22]/20 text-[#8C2F22] text-5xl font-bold">
                  🛕
                </div>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-xs transition shadow-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-turmeric/10 pb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider font-mono">
                  {selectedEvent.category || 'EVENT'}
                </span>
                <span className="text-xs text-[#7A6B63] font-mono font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C99A3D]" />
                  {new Date(selectedEvent.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl text-[#6B1616] leading-snug">
                {selectedEvent.title}
              </h3>

              <div className="text-sm text-[#4A3B32] leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto pr-2 bg-[#FAF6EE]/50 p-4 rounded-2xl border border-turmeric/20">
                {selectedEvent.content}
              </div>

              <div className="pt-4 border-t border-turmeric/20 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#8C2F22] text-white hover:bg-[#6E2217] transition shadow-md"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
