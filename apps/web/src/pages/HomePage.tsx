import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GopuramDivider } from '../components/GopuramMotif.js';
import { apiClient } from '../api/client.js';

interface Announcement {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

interface Seva {
  id: string;
  name: string;
  code: string;
  amount: number;
  description?: string;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sevas, setSevas] = useState<Seva[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'timings' | 'sevas' | 'annadana' | 'future'>('about');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, sevaRes] = await Promise.all([
          apiClient.get('/announcements/public'),
          apiClient.get('/sevas')
        ]);
        setAnnouncements(annRes.data.data || []);
        setSevas((sevaRes.data.data || []).slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch public homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-amber-900/30 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/20">
            🕉️
          </div>
          <div>
            <h1 className="font-serif text-lg md:text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Sri Raghavendra Swamy Matha
            </h1>
            <p className="text-xs text-amber-300/70 font-sans tracking-wide">
              Mantralayam Kshetra • Official Devotee Portal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/devotee-register"
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/10 transition"
          >
            Devotee Signup
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg shadow-md hover:shadow-amber-500/30 transition transform hover:-translate-y-0.5"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 text-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-amber-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-amber-300 bg-amber-950/60 border border-amber-800/40 mb-6 shadow-inner">
            || SRI GURU RAGHAVENDRO VIJAYATE ||
          </span>

          <h2 className="font-serif text-3xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight mb-6">
            Holy Abode of <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Sri Raghavendra Swamiji
            </span>
          </h2>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Experience divine blessings, explore authentic Mutt history, sponsor sacred Annadana meals, and manage your family Seva receipts online with our unified Devotee Portal.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/devotee-register"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition transform"
            >
              🚩 Devotee Registration
            </Link>
            <button
              onClick={() => setActiveTab('sevas')}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-slate-800 hover:border-amber-400 transition"
            >
              🕉️ View Seva Offerings
            </button>
            <button
              onClick={() => setActiveTab('timings')}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-slate-900/60 text-slate-300 border border-slate-700 hover:bg-slate-800 transition"
            >
              📜 Darshan & Pooja Timings
            </button>
          </div>
        </div>

        {/* Live News Ticker */}
        {announcements.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12 bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 flex items-center space-x-3 text-left">
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider bg-amber-500 text-slate-950 rounded uppercase shrink-0">
              NEWS
            </span>
            <div className="overflow-hidden text-xs text-amber-200 truncate">
              <strong>{announcements[0].title}:</strong> {announcements[0].content}
            </div>
          </div>
        )}
      </section>

      <GopuramDivider />

      {/* Main Interactive Tabbed Content Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'about'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            🏛️ About the Mutt
          </button>
          <button
            onClick={() => setActiveTab('timings')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'timings'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            ⏰ Darshan & Pooja Timings
          </button>
          <button
            onClick={() => setActiveTab('sevas')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'sevas'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            🌸 Sevas & Offerings
          </button>
          <button
            onClick={() => setActiveTab('annadana')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'annadana'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            🍚 Nitya Annadana Seva
          </button>
          <button
            onClick={() => setActiveTab('future')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'future'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            🚀 Future Portal Additions
          </button>
        </div>

        {/* Tab 1: About the Mutt */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <h3 className="font-serif text-2xl font-bold text-amber-300 mb-4">
                The Heritage & Significance of Sri Raghavendra Swamy Matha
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm mb-4">
                Sri Raghavendra Swamy (1595–1671 AD) was a revered Madhwa saint, philosopher, and exponent of Dwaitha Vedanta. He entered Brindavan Pravesha alive at Mantralayam in 1671 AD, promising to bestow grace upon devotees for 700 years from his sacred Samadhi.
              </p>
              <p className="text-slate-300 leading-relaxed text-sm">
                Mantralayam is situated on the holy banks of the Tungabhadra River in Andhra Pradesh. Millions of devotees visit annually seeking peace, health, and spiritual enlightenment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 border border-amber-900/30 rounded-xl p-6">
                <div className="text-3xl mb-3">📜</div>
                <h4 className="font-bold text-amber-200 text-base mb-2">Guru Parampara</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tracing back through Jagadguru Sri Madhvacharya, Sri Jayateertha, Sri Vyasateertha, and Sri Vijayendra Teertha.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-amber-900/30 rounded-xl p-6">
                <div className="text-3xl mb-3">🔱</div>
                <h4 className="font-bold text-amber-200 text-base mb-2">Mula Rama Devara Pooja</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Daily worship of Sri Mula Rama and Sri Sita Devi idols consecrated by Chaturmukha Brahma and handed down through generations.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-amber-900/30 rounded-xl p-6">
                <div className="text-3xl mb-3">🌊</div>
                <h4 className="font-bold text-amber-200 text-base mb-2">Sacred Tungabhadra</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Holy river dip before entering the Mutt premises cleanses spiritual obstacles and prepares the mind for Darshan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Darshan & Pooja Timings */}
        {activeTab === 'timings' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-xl animate-fadeIn">
            <h3 className="font-serif text-2xl font-bold text-amber-300 mb-6 flex items-center space-x-2">
              <span>⏰</span>
              <span>Daily Shrine Schedule & Darshan Timings</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-6 rounded-xl border border-amber-900/40 space-y-4">
                <h4 className="text-amber-400 font-bold text-base border-b border-amber-900/40 pb-2">
                  Morning Sevas & Darshan
                </h4>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="font-semibold text-slate-200">Suprabhatha & Nirmalya Visarjana</span>
                    <span className="text-amber-300 font-mono">06:00 AM - 07:00 AM</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="font-semibold text-slate-200">Panchamrutha Abhisheka</span>
                    <span className="text-amber-300 font-mono">08:00 AM - 11:30 AM</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="font-semibold text-slate-200">Mula Rama Devara Pooja & Hastodaka</span>
                    <span className="text-amber-300 font-mono">11:30 AM - 01:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold text-slate-200">Mahamangalarathi & Teertha Prasada</span>
                    <span className="text-amber-300 font-mono">01:00 PM - 02:00 PM</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-amber-900/40 space-y-4">
                <h4 className="text-amber-400 font-bold text-base border-b border-amber-900/40 pb-2">
                  Evening Sevas & Darshan
                </h4>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="font-semibold text-slate-200">Evening General Darshan</span>
                    <span className="text-amber-300 font-mono">04:00 PM - 07:00 PM</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="font-semibold text-slate-200">Unjal Seva & Chariot Procession</span>
                    <span className="text-amber-300 font-mono">07:00 PM - 08:30 PM</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="font-semibold text-slate-200">Night Mangalarathi</span>
                    <span className="text-amber-300 font-mono">08:30 PM - 09:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold text-slate-200">Mahadwara Closure</span>
                    <span className="text-amber-300 font-mono">09:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sevas & Offerings */}
        {activeTab === 'sevas' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h3 className="font-serif text-2xl font-bold text-amber-300">Available Sacred Sevas</h3>
              <p className="text-xs text-slate-400 mt-1">
                Participate in daily poojas and receive divine prasada for your family's health & prosperity.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {sevas.map((s) => (
                <div key={s.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition">
                  <div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50">
                      {s.code}
                    </span>
                    <h4 className="font-bold text-slate-100 text-base mt-2">{s.name}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.description || 'Sacred temple seva offering.'}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-400 font-mono">₹{Number(s.amount).toLocaleString('en-IN')}</span>
                    <Link
                      to="/login"
                      className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 transition"
                    >
                      Book Seva
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Nitya Annadana Seva */}
        {activeTab === 'annadana' && (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 rounded-2xl p-8 shadow-xl animate-fadeIn">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">Sacred Food Distribution</span>
              <h3 className="font-serif text-2xl font-bold text-slate-100 mt-2 mb-4">
                Nitya Annadana — Serving Thousands Daily
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Annadana is considered the highest form of charity (*Annam Brahma*). At Sri Raghavendra Swamy Matha, over 10,000 pilgrims are served hot, sanctified meals every day in the huge Annadana Hall (*Sri Susheendra Prarthana Mandiram*).
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-amber-300 text-sm">One Day Meal Sponsorship</h4>
                  <p className="text-xs text-slate-400 mt-1">Sponsor full day meals for thousands of visiting pilgrims on your special occasion.</p>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-amber-300 text-sm">Shashwata Annadana Scheme</h4>
                  <p className="text-xs text-slate-400 mt-1">Perpetual annual meal sponsorship on your family birthday or anniversary date for 50 years.</p>
                </div>
              </div>

              <Link
                to="/devotee-register"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400 transition"
              >
                <span>Sponsor Annadana Online</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 5: Future Portal Additions */}
        {activeTab === 'future' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h3 className="font-serif text-2xl font-bold text-amber-300">Upcoming Portal Additions & Modules</h3>
              <p className="text-xs text-slate-400 mt-1">
                We are constantly enhancing the SRSmutt Devotee Portal to bring sacred services directly to your smartphone.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition">
                <div className="text-3xl mb-3">🏨</div>
                <h4 className="font-bold text-slate-100 text-sm mb-2">Online Room Booking</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Book Mutt choultries & cottages in Mantralayam ahead of your pilgrimage visit.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition">
                <div className="text-3xl mb-3">📅</div>
                <h4 className="font-bold text-slate-100 text-sm mb-2">Panchanga & Festival Calendar</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track Ekadashi, Aradhana dates, Tithis, and astrological timings with automatic SMS alerts.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition">
                <div className="text-3xl mb-3">📚</div>
                <h4 className="font-bold text-slate-100 text-sm mb-2">Digital Library & Stotras</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Access authentic Rayara Stotra, Dwaitha texts, audio chants, and Mutt publications in multiple languages.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition">
                <div className="text-3xl mb-3">📦</div>
                <h4 className="font-bold text-slate-100 text-sm mb-2">Prasada Courier Service</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Order consecrated Mrittika Prasada & Mantrakshate directly to your home address via speed post.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition">
                <div className="text-3xl mb-3">🎥</div>
                <h4 className="font-bold text-slate-100 text-sm mb-2">Live Darshan Streaming</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Watch live morning Abhisheka and evening Rathotsava from Mantralayam.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition">
                <div className="text-3xl mb-3">💳</div>
                <h4 className="font-bold text-slate-100 text-sm mb-2">80G Tax Exemption Certificates</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Download instant 80G tax receipt certificates for all donations & sponsorships.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-8 text-center text-xs text-slate-400">
        <p className="font-serif text-slate-300 font-semibold mb-1">Sri Raghavendra Swamy Matha • Mantralayam</p>
        <p className="text-[11px] text-slate-500">
          Official Temple Seva Billing & Devotee Portal • Built with React & Fastify
        </p>
      </footer>
    </div>
  );
};
