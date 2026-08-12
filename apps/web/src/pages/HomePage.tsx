import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GopuramDivider } from '../components/GopuramMotif.js';
import { apiClient } from '../api/client.js';
import { MapPin, Phone, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';

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
  active?: boolean;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sevas, setSevas] = useState<Seva[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'timings' | 'sevas' | 'annadana' | 'contact'>('about');

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

          <p className="text-sm md:text-base text-textInk/80 max-w-3xl mx-auto leading-relaxed mb-8">
            Experience divine blessings at our Rajajinagar branch housing the sacred Mrittika Brindavana of Sri Raghavendra Swamy under the holy lineage of Sri Sripadaraja Swamiji. Book Sevas online, view daily Darshan timings, and sponsor Nitya Annadana.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/devotee-register"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-kumkum text-ivory shadow-lg shadow-kumkum/20 hover:bg-kumkum-light hover:shadow-kumkum/30 hover:scale-105 transition transform flex items-center gap-2"
            >
              🚩 Devotee Registration
            </Link>
            <button
              onClick={() => setActiveTab('sevas')}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-kumkum border border-kumkum/30 hover:bg-kumkum/5 transition flex items-center gap-2"
            >
              🌸 View Seva Offerings
            </button>
            <button
              onClick={() => setActiveTab('timings')}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-ivory text-textInk/80 border border-turmeric/30 hover:bg-ivory-dark transition flex items-center gap-2"
            >
              ⏰ Darshan & Pooja Timings
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-white text-turmeric-dark border border-turmeric/30 hover:bg-ivory transition flex items-center gap-2"
            >
              📍 Branch Address & Info
            </button>
          </div>
        </div>

        {/* Live News Ticker */}
        {announcements.length > 0 && (
          <div className="max-w-4xl mx-auto mt-10 bg-turmeric/10 border border-turmeric/30 rounded-xl p-4 flex items-center space-x-3 text-left">
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider bg-kumkum text-ivory rounded uppercase shrink-0">
              NEWS
            </span>
            <div className="overflow-hidden text-xs text-textInk/80 truncate">
              <strong>{announcements[0].title}:</strong> {announcements[0].content}
            </div>
          </div>
        )}
      </section>

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
            onClick={() => setActiveTab('annadana')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === 'annadana'
                ? 'bg-kumkum text-ivory shadow-md font-bold'
                : 'text-textInk/60 hover:text-kumkum hover:bg-kumkum/5'
            }`}
          >
            🍚 Nitya Annadana Seva
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
                Under the holy tradition of Jagadguru Sri Madhvacharya and Sri Sripadaraja Swamiji, daily rituals including Panchamrutha Abhisheka, Hastodaka, Mahamangalarathi, and Nitya Annadana (Teertha Prasada) are conducted with utmost devotion.
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
                    <span className="font-semibold text-textInk">Teertha Prasada (Nitya Annadana)</span>
                    <span className="text-turmeric-dark font-mono font-bold">12:30 PM – 2:00 PM</span>
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
                Book Sevas online or at our Rajajinagar billing counter to receive divine Prasada.
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
                <p>Please contact temple counter at +91 89046 74124 / +91 98800 54620 for Seva details.</p>
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
                      <Link
                        to="/login"
                        className="px-4 py-2 text-xs font-bold bg-kumkum text-ivory rounded-lg hover:bg-kumkum-light transition shadow-xs"
                      >
                        Book Seva
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Nitya Annadana Seva */}
        {activeTab === 'annadana' && (
          <div className="bg-white border border-turmeric/20 rounded-2xl p-8 shadow-sm animate-fadeIn">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-turmeric-dark tracking-widest uppercase">Sacred Food Distribution</span>
              <h3 className="font-display text-2xl font-bold text-kumkum mt-2 mb-4">
                Nitya Annadana — Teertha Prasada Daily
              </h3>
              <p className="text-textInk/80 text-sm leading-relaxed mb-6">
                Annadana is considered the highest form of charity (*Annam Brahma*). At our Rajajinagar Branch, hot sanctified meals (Teertha Prasada) are served daily to pilgrims from 12:30 PM to 2:00 PM following afternoon Mahamangalarathi.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-ivory p-4 rounded-xl border border-turmeric/20">
                  <h4 className="font-bold text-kumkum text-sm">One Day Meal Sponsorship</h4>
                  <p className="text-xs text-textInk/60 mt-1">Sponsor meals for visiting pilgrims on your special family occasion.</p>
                </div>
                <div className="bg-ivory p-4 rounded-xl border border-turmeric/20">
                  <h4 className="font-bold text-kumkum text-sm">Shashwata Annadana Scheme</h4>
                  <p className="text-xs text-textInk/60 mt-1">Perpetual annual meal sponsorship on your birthday or anniversary date.</p>
                </div>
              </div>

              <Link
                to="/devotee-register"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs bg-kumkum text-ivory shadow-md hover:bg-kumkum-light transition"
              >
                <span>Sponsor Annadana Online</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 5: Branch Location & Contact Info */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-turmeric/20 rounded-2xl p-8 shadow-sm">
              <h3 className="font-display text-2xl font-bold text-kumkum mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-kumkum" />
                <span>Rajajinagar Branch Contact & Location</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-ivory p-6 rounded-xl border border-turmeric/20 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-kumkum shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-ink text-sm">Branch Address</h4>
                      <p className="text-xs text-textInk/80 mt-1 leading-relaxed">
                        541, 63rd Cross Rd, 5th Block,<br />
                        Rajajinagar, Bengaluru,<br />
                        Karnataka 560010
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-turmeric/20 pt-4 flex items-start gap-3">
                    <Phone className="w-5 h-5 text-kumkum shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-ink text-sm">Phone Numbers</h4>
                      <p className="text-xs text-textInk/80 mt-1 font-mono font-semibold">
                        +91 89046 74124 / +91 98800 54620
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-turmeric/20 pt-4 flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-kumkum shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-ink text-sm">In-Charge Contacts</h4>
                      <p className="text-xs text-textInk/80 mt-1 font-semibold">
                        Sri Ashwatha Narayan / Sri Ravikiran
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
                      <span className="font-semibold">Teertha Prasada</span> — Daily afternoon Annadana (12:30 PM - 2:00 PM)
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
