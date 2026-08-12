import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GopuramDivider } from '../components/GopuramMotif.js';
import { apiClient } from '../api/client.js';
import { MapPin, Phone, UserCheck, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, X, Calendar, Info } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface Seva {
  id: string;
  name: string;
  code: string;
  amount: number;
  description?: string;
  active?: boolean;
}

/* ─────── Gallery Photo Data ─────── */
const GALLERY_PHOTOS = [
  { src: '/gallery/brindavana-1.jpg', caption: 'Sri Raghavendra Swamy — Alankara Darshana' },
  { src: '/gallery/brindavana-2.jpg', caption: 'Sri Raghavendra Swamy — Pushpa Alankara' },
  { src: '/gallery/brindavana-3.jpg', caption: 'Sri Raghavendra Swamy — Vastra Alankara' },
  { src: '/gallery/brindavana-4.jpg', caption: 'Sri Raghavendra Matha — Rajajinagar, Bengaluru' },
];
const GALLERY_LS_KEY = 'srsmuth_gallery_cache_v2';
const GALLERY_MAX_PX = 600; // compress max dimension

function compressImageToBase64(imgUrl: string, maxPx: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxPx || h > maxPx) {
        const ratio = Math.min(maxPx / w, maxPx / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => reject(new Error('Failed to load image: ' + imgUrl));
    img.src = imgUrl;
  });
}

const PhotoGallerySection: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  // Load & compress images, cache in localStorage
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Try cache first
      try {
        const cached = localStorage.getItem(GALLERY_LS_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length === GALLERY_PHOTOS.length) {
            if (!cancelled) setPhotos(parsed);
            return;
          }
        }
      } catch { /* ignore parse errors */ }

      // Compress and store
      try {
        const compressed = await Promise.all(
          GALLERY_PHOTOS.map((p) => compressImageToBase64(p.src, GALLERY_MAX_PX))
        );
        if (!cancelled) {
          setPhotos(compressed);
          try { localStorage.setItem(GALLERY_LS_KEY, JSON.stringify(compressed)); } catch { /* quota */ }
        }
      } catch (err) {
        console.warn('Gallery compression failed, using originals', err);
        if (!cancelled) setPhotos(GALLERY_PHOTOS.map((p) => p.src));
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (photos.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-ivory to-ivory-light">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-kumkum tracking-[0.25em] uppercase">📸 Sacred Glimpses</span>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-kumkum mt-1">
            Photo Gallery — Sri Raghavendra Brindavana
          </h3>
          <p className="text-xs text-textInk/60 mt-1">Daily Alankara Darshana from our Rajajinagar Sannidhana</p>
        </div>

        {/* Carousel Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-turmeric/30 bg-ink/5">
          <div className="relative w-full" style={{ paddingBottom: '60%' }}>
            {photos.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={GALLERY_PHOTOS[idx]?.caption || `Gallery photo ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-contain bg-black/90 transition-opacity duration-700 ease-in-out ${
                  idx === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              />
            ))}

            {/* Caption Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 py-5">
              <p className="text-ivory text-sm md:text-base font-display font-semibold drop-shadow-lg">
                {GALLERY_PHOTOS[activeIdx]?.caption}
              </p>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setActiveIdx((prev) => (prev - 1 + photos.length) % photos.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-ivory/80 hover:bg-ivory text-kumkum flex items-center justify-center shadow-lg transition-all border border-turmeric/30"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveIdx((prev) => (prev + 1) % photos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-ivory/80 hover:bg-ivory text-kumkum flex items-center justify-center shadow-lg transition-all border border-turmeric/30"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2.5 mt-5">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === activeIdx
                  ? 'w-8 h-2.5 bg-kumkum shadow-md'
                  : 'w-2.5 h-2.5 bg-turmeric/40 hover:bg-turmeric/70'
              }`}
              aria-label={`Go to photo ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sevas, setSevas] = useState<Seva[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'timings' | 'events' | 'sevas' | 'contact'>('about');
  const [eventStartIndex, setEventStartIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [annRes, sevaRes] = await Promise.all([
          apiClient.get('/announcements/public'),
          apiClient.get('/sevas')
        ]);
        setAnnouncements(annRes.data.data || []);
        const rawSevas = sevaRes.data.data || sevaRes.data || [];
        setSevas(Array.isArray(rawSevas) ? rawSevas.filter((s: Seva) => s.active !== false) : []);
      } catch (err) {
        console.error('Failed to fetch public homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide effect for events carousel (cycles 4 items every 5 seconds)
  useEffect(() => {
    if (activeTab !== 'events' || announcements.length <= 4) return;
    const timer = setInterval(() => {
      setEventStartIndex((prev) => (prev + 4 >= announcements.length ? 0 : prev + 4));
    }, 5000);
    return () => clearInterval(timer);
  }, [activeTab, announcements.length]);

  return (
    <div className="min-h-screen bg-ivory-light text-textInk flex flex-col font-sans selection:bg-turmeric selection:text-white">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-white backdrop-blur-md border-b border-turmeric/20 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-kumkum/10 border border-kumkum/30 flex items-center justify-center text-kumkum font-bold text-xl shadow-xs">
            🕉️
          </div>
          <div>
            <h1 className="font-display text-kumkum text-lg md:text-xl font-bold leading-tight">
              Mulabagala Sri Sripadaraja Matha
            </h1>
            <p className="text-xs text-textInk/60 font-sans tracking-wide">
              Shri Raghavendra Swamy Brindavana Sannidhana – Rajajinagar, Bengaluru
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/devotee-register"
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-kumkum border border-kumkum/30 rounded-lg hover:bg-kumkum/5 transition"
          >
            Devotee Signup
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 text-xs font-bold text-ivory bg-kumkum hover:bg-kumkum-light shadow-md rounded-lg transition transform hover:-translate-y-0.5"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 text-center bg-gradient-to-b from-ivory to-ivory-light border-b border-turmeric/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-turmeric/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-turmeric-dark bg-turmeric/10 border border-turmeric/30 mb-6 shadow-xs">
            || SRI GURU RAGHAVENDRO VIJAYATE ||
          </span>

          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-tight mb-3">
            Shri Raghavendra Swamy Brindavana Sannidhana
          </h2>

          <p className="font-display text-lg md:text-xl font-bold text-kumkum mb-6">
            Mulabagala Sri Sripadaraja Matha — Rajajinagar Branch
          </p>

          <p className="text-sm md:text-base text-textInk/80 max-w-3xl mx-auto leading-relaxed">
            Experience divine blessings at our Rajajinagar branch housing the sacred Mrittika Brindavana of Sri Raghavendra Swamy under the holy lineage of Sri Sripadaraja Swamiji. View daily Darshan timings, Seva offerings, and sponsor Teertha Prasada.
          </p>
        </div>

        {/* Live News Ticker (ONLY for ANNOUNCEMENT category items) */}
        {(() => {
          const newsAnnouncement = announcements.find(
            (a) => a.category?.toUpperCase() === 'ANNOUNCEMENT'
          );
          if (!newsAnnouncement) return null;
          return (
            <div className="max-w-4xl mx-auto mt-8 bg-turmeric/10 border border-turmeric/30 rounded-xl p-4 flex items-center space-x-3 text-left">
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider bg-kumkum text-ivory rounded uppercase shrink-0">
                NEWS ANNOUNCEMENT
              </span>
              <div className="overflow-hidden text-xs text-textInk/80 truncate">
                <strong>{newsAnnouncement.title}:</strong> {newsAnnouncement.content}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ── Photo Gallery Auto-Scroll Section ── */}
      <PhotoGallerySection />

      <GopuramDivider />

      {/* Main Interactive Tabbed Content Section */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-turmeric/20 pb-4">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'about'
                ? 'bg-kumkum text-ivory shadow-md font-bold'
                : 'text-textInk/60 hover:text-kumkum hover:bg-kumkum/5'
            }`}
          >
            🏛️ About Rajajinagar Branch
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'events'
                ? 'bg-kumkum text-ivory shadow-md font-bold'
                : 'text-textInk/60 hover:text-kumkum hover:bg-kumkum/5'
            }`}
          >
            🚩 Temple Events & News
          </button>
          <button
            onClick={() => setActiveTab('timings')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'timings'
                ? 'bg-kumkum text-ivory shadow-md font-bold'
                : 'text-textInk/60 hover:text-kumkum hover:bg-kumkum/5'
            }`}
          >
            ⏰ Darshan & Pooja Timings
          </button>
          <button
            onClick={() => setActiveTab('sevas')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'sevas'
                ? 'bg-kumkum text-ivory shadow-md font-bold'
                : 'text-textInk/60 hover:text-kumkum hover:bg-kumkum/5'
            }`}
          >
            🌸 Sevas & Offerings
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'contact'
                ? 'bg-kumkum text-ivory shadow-md font-bold'
                : 'text-textInk/60 hover:text-kumkum hover:bg-kumkum/5'
            }`}
          >
            📍 Location & Contacts
          </button>
        </div>

        {/* Tab 1: About Rajajinagar Branch */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white border border-turmeric/20 rounded-2xl p-8 shadow-sm">
              <h3 className="font-display text-2xl font-bold text-kumkum mb-4">
                Mulabagala Sri Sripadaraja Matha — Rajajinagar Branch, Bengaluru
              </h3>
              <p className="text-textInk/80 leading-relaxed text-sm mb-4">
                The Rajajinagar branch of Mulabagala Sri Sripadaraja Matha houses the sanctified Mrittika Brindavana of Sri Raghavendra Swamy, established under the divine guidance of the Matha. Devotees from all over Bengaluru visit this holy Sannidhana for daily worship, Sevas, and spiritual solace.
              </p>
              <p className="text-textInk/80 leading-relaxed text-sm">
                Under the holy tradition of Jagadguru Sri Madhvacharya and Sri Sripadaraja Swamiji, daily rituals including Panchamrutha Abhisheka, Hastodaka, Mahamangalarathi, and Teertha Prasada are conducted with utmost devotion.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-ivory border border-turmeric/20 rounded-xl p-6">
                <div className="text-3xl mb-3">🛕</div>
                <h4 className="font-bold text-kumkum text-base mb-2">Sacred Mrittika Brindavana</h4>
                <p className="text-xs text-textInk/60 leading-relaxed">
                  Consecrated Mrittika from Mantralayam Kshetra, bestowing divine peace and blessings upon all visiting devotees.
                </p>
              </div>

              <div className="bg-ivory border border-turmeric/20 rounded-xl p-6">
                <div className="text-3xl mb-3">📜</div>
                <h4 className="font-bold text-kumkum text-base mb-2">Sri Sripadaraja Lineage</h4>
                <p className="text-xs text-textInk/60 leading-relaxed">
                  Preserving the rich Dwaitha Vedanta tradition, Haridasa Sahitya, and authentic Madhwa pooja vidhi.
                </p>
              </div>

              <div className="bg-ivory border border-turmeric/20 rounded-xl p-6">
                <div className="text-3xl mb-3">🍚</div>
                <h4 className="font-bold text-kumkum text-base mb-2">Nitya Teertha Prasada</h4>
                <p className="text-xs text-textInk/60 leading-relaxed">
                  Daily sanctified meal distribution (Annadana) served to visiting pilgrims after afternoon Mahamangalarathi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Events & Announcements Showcase (4-Card Auto-Slide Carousel) */}
        {activeTab === 'events' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-turmeric/20 pb-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-kumkum flex items-center gap-2">
                  <span>🚩</span> Temple Events, Aradhana & Special News
                </h3>
                <p className="text-xs text-textInk/60 mt-1">
                  Upcoming religious programs, festival celebrations, and important branch announcements.
                </p>
              </div>

              {/* Slider Controls */}
              {announcements.length > 4 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEventStartIndex((prev) => Math.max(0, prev - 4))}
                    disabled={eventStartIndex === 0}
                    className="p-2 rounded-xl bg-white border border-turmeric/30 text-kumkum disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ivory shadow-xs transition"
                    title="Previous events"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-textInk/60 px-2">
                    {Math.floor(eventStartIndex / 4) + 1} / {Math.ceil(announcements.length / 4)}
                  </span>
                  <button
                    onClick={() => setEventStartIndex((prev) => (prev + 4 < announcements.length ? prev + 4 : 0))}
                    className="p-2 rounded-xl bg-white border border-turmeric/30 text-kumkum hover:bg-ivory shadow-xs transition"
                    title="Next events"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-turmeric/20 rounded-2xl p-4 animate-pulse space-y-3">
                    <div className="h-36 w-full bg-ivory rounded-xl" />
                    <div className="h-4 w-20 bg-ivory rounded" />
                    <div className="h-5 w-3/4 bg-ivory rounded" />
                    <div className="h-10 w-full bg-ivory rounded" />
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white border border-turmeric/20 rounded-2xl p-12 text-center text-xs text-textInk/60 space-y-2">
                <p className="font-bold text-sm text-kumkum">No special events currently scheduled.</p>
                <p>Check back regularly for upcoming Aradhana Mahotsava & Utsava details.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {announcements.slice(eventStartIndex, eventStartIndex + 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvent(item)}
                    className="group bg-white border border-turmeric/20 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-kumkum/40 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header with Fixed Height & Cover */}
                      <div className="w-full h-44 overflow-hidden bg-ivory-dark/30 relative border-b border-turmeric/10 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-turmeric/10 to-kumkum/10 text-kumkum text-3xl font-bold">
                            🛕
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/95 text-kumkum shadow-xs border border-turmeric/30">
                          {item.category || 'EVENT'}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-2">
                        <div className="text-[10px] text-textInk/50 font-mono font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-turmeric-dark shrink-0" />
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>

                        <h4 className="font-display font-bold text-kumkum text-base group-hover:text-kumkum-light transition line-clamp-2 leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-xs text-textInk/70 leading-relaxed line-clamp-2">
                          {item.content}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <span className="text-[11px] font-bold text-turmeric-dark group-hover:text-kumkum flex items-center gap-1">
                        Read Full Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Verified Darshan & Pooja Timings */}
        {activeTab === 'timings' && (
          <div className="bg-white border border-turmeric/20 rounded-2xl p-8 shadow-sm animate-fadeIn space-y-6">
            <div className="border-b border-turmeric/20 pb-4">
              <h3 className="font-display text-2xl font-bold text-kumkum flex items-center space-x-2">
                <span>⏰</span>
                <span>Branch Darshan & Pooja Schedule</span>
              </h3>
              <p className="text-xs text-textInk/60 mt-1">Verified daily timings for Rajajinagar Branch Sannidhana</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-ivory p-6 rounded-xl border border-turmeric/20 space-y-4">
                <h4 className="text-kumkum font-bold text-base border-b border-turmeric/20 pb-2 flex items-center gap-2">
                  <span>🌅</span> Morning Schedule
                </h4>
                <ul className="space-y-3 text-xs text-textInk/80">
                  <li className="flex justify-between border-b border-turmeric/10 pb-2">
                    <span className="font-semibold text-textInk">Morning Darshan & Pooja</span>
                    <span className="text-turmeric-dark font-mono font-bold">7:00 AM – 12:30 PM</span>
                  </li>
                  <li className="flex justify-between border-b border-turmeric/10 pb-2">
                    <span className="font-semibold text-textInk">Daily Mahamangalarathi</span>
                    <span className="text-turmeric-dark font-mono font-bold">12:00 PM – 12:30 PM</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="font-semibold text-textInk">Teertha Prasada</span>
                    <span className="text-turmeric-dark font-mono font-bold">12:30 PM</span>
                  </li>
                </ul>
              </div>

              <div className="bg-ivory p-6 rounded-xl border border-turmeric/20 space-y-4">
                <h4 className="text-kumkum font-bold text-base border-b border-turmeric/20 pb-2 flex items-center gap-2">
                  <span>🌆</span> Evening Schedule
                </h4>
                <ul className="space-y-3 text-xs text-textInk/80">
                  <li className="flex justify-between border-b border-turmeric/10 pb-2">
                    <span className="font-semibold text-textInk">Evening Darshan & Pooja</span>
                    <span className="text-turmeric-dark font-mono font-bold">5:30 PM – 8:30 PM</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="font-semibold text-textInk">Evening Mahamangalarathi</span>
                    <span className="text-turmeric-dark font-mono font-bold">8:00 PM – 8:30 PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dynamic Seva Integration (Backend API Wiring) */}
        {activeTab === 'sevas' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h3 className="font-display text-2xl font-bold text-kumkum">Sacred Sevas & Offerings</h3>
              <p className="text-xs text-textInk/60 mt-1">
                View active Seva details. Seva bookings can be performed directly at our Rajajinagar billing counter.
              </p>
            </div>

            {loading ? (
              /* Loading Skeleton */
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-turmeric/20 rounded-xl p-6 animate-pulse space-y-4">
                    <div className="h-4 w-16 bg-ivory rounded" />
                    <div className="h-6 w-3/4 bg-ivory rounded" />
                    <div className="h-3 w-full bg-ivory rounded" />
                    <div className="h-8 w-full bg-ivory rounded" />
                  </div>
                ))}
              </div>
            ) : sevas.length === 0 ? (
              /* Empty State Fallback */
              <div className="bg-white border border-turmeric/20 rounded-2xl p-12 text-center text-xs text-textInk/60 space-y-3">
                <p className="font-bold text-sm text-kumkum">No active Sevas currently published.</p>
                <p>Please contact temple counter at +91 89046 74124 for Seva details.</p>
              </div>
            ) : (
              /* Dynamic Seva Cards */
              <div className="grid md:grid-cols-3 gap-6">
                {sevas.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white border border-turmeric/20 rounded-xl p-6 flex flex-col justify-between hover:border-kumkum/40 transition shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-turmeric/10 text-turmeric-dark border border-turmeric/30">
                          {s.code}
                        </span>
                        <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          ACTIVE SEVA
                        </span>
                      </div>
                      <h4 className="font-bold text-ink text-base mt-3">{s.name}</h4>
                      <p className="text-xs text-textInk/60 mt-2 leading-relaxed">
                        {s.description || 'Sacred ritual offering at Rajajinagar Sannidhana.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-turmeric/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-textInk/50 block text-[10px]">SEVA AMOUNT</span>
                        <span className="text-lg font-bold text-turmeric-dark font-mono">
                          ₹{Number(s.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-turmeric-dark bg-turmeric/10 border border-turmeric/30 px-3 py-1.5 rounded-lg">
                        Book at Counter
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Branch Location & Contact Info */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-turmeric/20 rounded-2xl p-8 shadow-sm">
              <h3 className="font-display text-2xl font-bold text-kumkum mb-6 border-b border-turmeric/20 pb-3 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-kumkum" /> Rajajinagar Branch Address & Contact
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 text-sm text-textInk/80">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-kumkum shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-ink text-sm">Branch Address</h4>
                      <p className="text-xs text-textInk/80 mt-1 leading-relaxed">
                        Mulabagala Sri Sripadaraja Matha,<br />
                        Shri Raghavendra Swamy Brindavana Sannidhana,<br />
                        No.542, 63rd Cross, 5th Block,<br />
                        Near Bhashyam Circle,<br />
                        Rajajinagar, Bengaluru,<br />
                        Karnataka 560010
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-turmeric/20 pt-4 flex items-start gap-3">
                    <Phone className="w-5 h-5 text-kumkum shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-ink text-sm">Phone Number</h4>
                      <p className="text-xs text-textInk/80 mt-1 font-mono font-semibold">
                        +91 89046 74124
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-ivory p-6 rounded-xl border border-turmeric/20 space-y-4">
                  <h4 className="font-bold text-kumkum text-base border-b border-turmeric/20 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Available Branch Facilities
                  </h4>
                  <ul className="space-y-3 text-xs text-textInk/80">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                      <span className="font-semibold">Pooja Facility</span> — Daily Archana, Abhisheka, & Special Sevas
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                      <span className="font-semibold">Teertha Prasada</span> — Daily afternoon meals (12:30 PM)
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                      <span className="font-semibold">Shrardh Facility</span> — Traditional ancestral ritual facility
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Event Details Popup Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-turmeric/30 my-6 animate-in zoom-in-95 duration-200">
            {/* Header Image */}
            <div className="w-full max-h-80 overflow-hidden bg-ivory-dark/40 relative">
              {selectedEvent.imageUrl ? (
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover object-top max-h-80"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-turmeric/20 to-kumkum/20 text-kumkum text-5xl font-bold">
                  🛕
                </div>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-xs transition shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-turmeric/10 pb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                  {selectedEvent.category || 'EVENT'}
                </span>
                <span className="text-xs text-textInk/60 font-mono font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-turmeric-dark" />
                  {new Date(selectedEvent.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl text-kumkum leading-snug">
                {selectedEvent.title}
              </h3>

              <div className="text-sm text-textInk/80 leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto pr-2 bg-ivory-light/40 p-4 rounded-2xl border border-turmeric/20">
                {selectedEvent.content}
              </div>

              <div className="pt-4 border-t border-turmeric/20 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-kumkum text-white hover:bg-kumkum-light transition shadow-md"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-ink border-t border-turmeric/20 px-6 py-8 text-center text-xs text-ivory/60">
        <p className="font-display text-ivory font-semibold mb-1">
          Mulabagala Sri Sripadaraja Matha • Rajajinagar Branch, Bengaluru | Official Devotee Portal
        </p>
        <p className="text-[11px] text-ivory/40">
          Shri Raghavendra Swamy Brindavana Sannidhana • 541, 63rd Cross Rd, 5th Block, Rajajinagar
        </p>
      </footer>
    </div>
  );
};
