import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import { LotusIcon } from './SpiritualDecorations';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1C120C] text-[#EFE3CE] border-t-2 border-[#C99A3D]/40 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Sacred Shloka Banner */}
        <div className="text-center bg-[#2E2018] rounded-2xl p-4 border border-[#C99A3D]/30 max-w-3xl mx-auto shadow-inner">
          <p className="font-display text-sm sm:text-base text-[#FCD34D] font-bold tracking-wide">
            ॥ ಪೂಜ್ಯಾಯ ರಾಘವೇಂದ್ರಾಯ ಸತ್ಯಧರ್ಮ ರತಾಯ ಚ । ಭಜತಾಂ ಕಲ್ಪವೃಕ್ಷಾಯ ನಮತಾಂ ಕಾಮಧೇನವೇ ॥
          </p>
          <p className="text-[11px] text-[#EFE3CE]/70 mt-1 font-serif">
            || Poojyaya Raghavendraya Satyadharma Rathaya Cha | Bhajatham Kalpavrikshaya Namatham Kamadhenave ||
          </p>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          {/* Matha Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#8C2F22] text-white flex items-center justify-center font-display text-base font-bold border border-[#C99A3D]/40">
                🕉️
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base">
                  Mulabagala Sri Sripadaraja Matha
                </h4>
                <p className="text-[11px] text-[#C99A3D]">
                  Sri Raghavendra Swamy Brindavana Sannidhana
                </p>
              </div>
            </div>
            <p className="text-[#EFE3CE]/80 leading-relaxed max-w-md">
              No.542, 63rd Cross, 5th Block, Near Bhashyam Circle, Rajajinagar, Bengaluru, Karnataka 560010. Devotees visit for daily worship, Sevas, and Teertha Prasada under the holy tradition of Jagadguru Sri Madhvacharya and Sri Sripadaraja Swamiji.
            </p>
            <p className="text-[#C99A3D] font-mono font-semibold">
              Contact: +91 89046 74124
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2.5">
            <h5 className="font-display font-bold text-white text-sm uppercase tracking-wider text-[#C99A3D]">
              Quick Navigation
            </h5>
            <ul className="space-y-1.5 text-[#EFE3CE]/80">
              <li>
                <a href="#about" className="hover:text-[#FCD34D] transition-colors">
                  • About Rajajinagar Branch
                </a>
              </li>
              <li>
                <a href="#schedule" className="hover:text-[#FCD34D] transition-colors">
                  • Darshan &amp; Pooja Timings
                </a>
              </li>
              <li>
                <a href="#sevas" className="hover:text-[#FCD34D] transition-colors">
                  • Sevas &amp; Offerings
                </a>
              </li>
              <li>
                <a href="#events" className="hover:text-[#FCD34D] transition-colors">
                  • Temple Events &amp; News
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#FCD34D] transition-colors">
                  • Sacred Photo Gallery
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#FCD34D] transition-colors">
                  • Location &amp; Directions
                </a>
              </li>
            </ul>
          </div>

          {/* Devotee Services */}
          <div className="md:col-span-3 space-y-2.5">
            <h5 className="font-display font-bold text-white text-sm uppercase tracking-wider text-[#C99A3D]">
              Devotee Services
            </h5>
            <ul className="space-y-2 text-[#EFE3CE]/80">
              <li>
                <Link
                  to="/devotee-register"
                  className="inline-block px-3 py-1.5 rounded-lg bg-[#8C2F22]/40 hover:bg-[#8C2F22] border border-[#C99A3D]/30 text-white font-bold transition-colors"
                >
                  Devotee Registration →
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="inline-block px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-colors"
                >
                  Portal Login (Staff / Devotee) →
                </Link>
              </li>
              <li className="text-[11px] text-[#EFE3CE]/60 pt-1">
                Daily Teertha Prasada: 12:30 PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="border-t border-[#C99A3D]/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#EFE3CE]/60">
          <p>
            © {new Date().getFullYear()} Mulabagala Sri Sripadaraja Matha — Rajajinagar Branch. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="text-[#C99A3D] hover:text-[#FCD34D] transition-colors font-bold"
          >
            ↑ Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};
