import React, { useState } from 'react';
import { Flower2, Sparkles, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TempleArchMotif, LotusIcon } from './SpiritualDecorations';

interface Seva {
  id: string;
  name: string;
  code: string;
  amount: number;
  description?: string;
  active?: boolean;
}

interface SevaSectionProps {
  sevas: Seva[];
  loading?: boolean;
}

export const SevaSection: React.FC<SevaSectionProps> = ({ sevas = [], loading = false }) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'daily' | 'abhisheka' | 'shashwata'>('all');

  const filteredSevas = sevas.filter((s) => {
    if (filterCategory === 'daily') {
      return s.name.toLowerCase().includes('archana') || s.name.toLowerCase().includes('nitya') || s.name.toLowerCase().includes('hastodaka');
    }
    if (filterCategory === 'abhisheka') {
      return s.name.toLowerCase().includes('abhisheka') || s.name.toLowerCase().includes('panchamrutha');
    }
    if (filterCategory === 'shashwata') {
      return s.name.toLowerCase().includes('shashwata') || s.name.toLowerCase().includes('corpus') || s.amount >= 5000;
    }
    return true;
  });

  return (
    <section id="sevas" className="snap-page-section py-12 sm:py-16 bg-white border-b border-turmeric/20 scroll-mt-24 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8C2F22]">
            <LotusIcon size={16} color="#8C2F22" />
            <span>SACRED OFFERINGS &amp; POOJA SEVAS</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E]">
            Sevas &amp; Devotional Offerings
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44]">
            Perform sacred sevas for the spiritual welfare and prosperity of your family. Bookings can be made at the Matha billing counter or tracked online.
          </p>
          <TempleArchMotif className="opacity-80" />
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'all'
                ? 'bg-[#8C2F22] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#5C4D44] hover:bg-[#F3EAD8] border border-turmeric/20'
            }`}
          >
            All Active Sevas ({sevas.length})
          </button>
          <button
            onClick={() => setFilterCategory('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'daily'
                ? 'bg-[#8C2F22] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#5C4D44] hover:bg-[#F3EAD8] border border-turmeric/20'
            }`}
          >
            Daily &amp; Archana Sevas
          </button>
          <button
            onClick={() => setFilterCategory('abhisheka')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'abhisheka'
                ? 'bg-[#8C2F22] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#5C4D44] hover:bg-[#F3EAD8] border border-turmeric/20'
            }`}
          >
            Panchamrutha &amp; Abhisheka
          </button>
          <button
            onClick={() => setFilterCategory('shashwata')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'shashwata'
                ? 'bg-[#8C2F22] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#5C4D44] hover:bg-[#F3EAD8] border border-turmeric/20'
            }`}
          >
            Shashwata Seva Corpus
          </button>
        </div>

        {/* Seva Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#FAF6EE] border border-turmeric/20 rounded-2xl p-6 animate-pulse space-y-4">
                <div className="h-4 w-16 bg-white rounded" />
                <div className="h-6 w-3/4 bg-white rounded" />
                <div className="h-3 w-full bg-white rounded" />
                <div className="h-8 w-full bg-white rounded" />
              </div>
            ))}
          </div>
        ) : filteredSevas.length === 0 ? (
          <div className="bg-[#FAF6EE] border border-turmeric/20 rounded-3xl p-12 text-center text-xs text-[#5C4D44] space-y-2">
            <p className="font-display font-bold text-base text-[#6B1616]">No sevas found for this filter.</p>
            <p>Please select another category or contact temple counter at +91 89046 74124.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSevas.map((s) => (
              <div
                key={s.id}
                className="group bg-white border border-turmeric/20 rounded-2xl p-6 flex flex-col justify-between hover:border-[#8C2F22]/40 hover:shadow-md transition-all duration-300 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md bg-[#C99A3D]/10 text-[#A67C29] border border-[#C99A3D]/30">
                      {s.code}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ACTIVE SEVA
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-[#2C221E] text-base sm:text-lg mt-3 group-hover:text-[#8C2F22] transition-colors leading-snug">
                    {s.name}
                  </h3>

                  <p className="text-xs text-[#5C4D44] mt-2 leading-relaxed line-clamp-3">
                    {s.description || 'Sacred ritual offering at Rajajinagar Sannidhana with Sankalpa and Mangalarathi.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-turmeric/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#7A6B63] block font-medium uppercase tracking-wider">SEVA AMOUNT</span>
                    <span className="text-xl font-bold text-[#8C2F22] font-mono">
                      ₹{Number(s.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#8C2F22] bg-[#FAF6EE] border border-[#C99A3D]/30 px-3.5 py-1.5 rounded-xl group-hover:bg-[#8C2F22] group-hover:text-white transition-colors">
                    Book at Counter
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Devotee Portal Link Banner */}
        <div className="bg-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-turmeric/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#8C2F22] border border-turmeric/30 flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#2C221E]">
                Are you a registered devotee?
              </h3>
              <p className="text-xs text-[#5C4D44]">
                Log in to the Devotee Portal to view your family Seva booking history and download official receipts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/devotee-register"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8C2F22] bg-white border border-[#8C2F22]/30 hover:bg-[#8C2F22]/5 transition"
            >
              Sign Up Devotee
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#8C2F22] hover:bg-[#6E2217] shadow-sm transition flex items-center gap-1.5"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
