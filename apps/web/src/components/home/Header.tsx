import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', id: 'about' },
    { label: 'Darshan & Pooja', id: 'schedule' },
    { label: 'Sevas & Offerings', id: 'sevas' },
    { label: 'Events & News', id: 'events' },
    { label: 'Photo Gallery', id: 'gallery' },
    { label: 'Location & Contact', id: 'contact' },
  ];

  const handleNav = (id: string) => {
    setMobileMenuOpen(false);
    if (onTabChange) {
      onTabChange(id);
    }
    // Also smoothly scroll to view container if on mobile or lower on page
    const el = document.getElementById('main-content-view') || document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({
        top: Math.max(0, elementPosition - offset),
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-[#C99A3D]/30'
          : 'bg-[#FCF8F0]/95 backdrop-blur-xs py-3.5 border-b border-[#C99A3D]/20'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 flex items-center justify-between gap-4">
        {/* Left Side: Matha Title & Branch Description */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 group focus:outline-none shrink-0"
        >
          <div className="flex flex-col">
            <span className="font-display font-bold text-[#6B1616] text-base sm:text-lg lg:text-xl leading-tight tracking-tight group-hover:text-[#8C2F22] transition-colors">
              Mulabagala Sri Sripadaraja Matha
            </span>
            <span className="text-[11px] sm:text-xs text-[#63534B] font-medium tracking-wide">
              Sri Raghavendra Swamy Brindavana Sannidhana — Rajajinagar, Bengaluru
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links (Generously Spaced & Uncongested) */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-3 shrink-0">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white bg-[#8C2F22] shadow-xs'
                    : 'text-[#4A3B32] hover:text-[#8C2F22] hover:bg-[#8C2F22]/10'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Corner: Logo Emblem & CTA Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              to="/devotee-register"
              className="px-3.5 py-2 text-xs font-bold text-[#8C2F22] bg-white border border-[#8C2F22]/30 rounded-xl hover:bg-[#8C2F22]/5 hover:border-[#8C2F22] transition-all shadow-2xs"
            >
              Devotee Signup
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-white bg-[#8C2F22] hover:bg-[#6E2217] shadow-sm rounded-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Right Corner Sacred Matha Emblem */}
          <div
            title="Sri Raghavendra Swamy Sannidhana"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#8C2F22] to-[#6E2217] text-white flex items-center justify-center font-display text-xl font-bold shadow-md border border-[#C99A3D]/40 shrink-0 select-none"
          >
            🕉️
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#8C2F22] hover:bg-[#8C2F22]/10 transition-colors border border-turmeric/30"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 px-4 pt-3 border-t border-turmeric/20 space-y-1.5 pb-3 bg-[#FAF6EE] animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === link.id
                  ? 'bg-[#8C2F22] text-white'
                  : 'text-[#4A3B32] hover:text-[#8C2F22] hover:bg-[#8C2F22]/10'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-turmeric/10 flex flex-col gap-2">
            <Link
              to="/devotee-register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-bold text-[#8C2F22] bg-white border border-[#8C2F22]/30 rounded-xl"
            >
              Devotee Signup
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#8C2F22] rounded-xl shadow-xs"
            >
              Devotee / Staff Portal Login →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
