import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Clock, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About Sannidhana', id: 'about' },
    { label: 'Darshan & Timings', id: 'schedule' },
    { label: 'Sevas & Offerings', id: 'sevas' },
    { label: 'Events & News', id: 'events' },
    { label: 'Sacred Glimpses', id: 'gallery' },
    { label: 'Visit & Contact', id: 'contact' },
  ];

  const handleNav = (id: string) => {
    setMobileMenuOpen(false);
    if (onTabChange) {
      onTabChange(id);
    }
    const el = document.getElementById(id) || document.getElementById('main-content-view');
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
          ? 'bg-[#FAF6EE]/95 backdrop-blur-md shadow-md py-2 border-b border-[#C99A3D]/30'
          : 'bg-[#FAF6EE] py-3.5 border-b border-[#C99A3D]/20'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        {/* Left: Sannidhana Branding & Sacred Typography */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3.5 group focus:outline-none shrink-0"
        >
          {/* Logo / Sacred Emblem */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#6E2217] via-[#8C2F22] to-[#A63C2E] text-white flex items-center justify-center font-display text-2xl font-bold shadow-md border-2 border-[#C99A3D]/50 group-hover:scale-105 transition-transform shrink-0">
            🕉️
          </div>

          <div className="flex flex-col">
            <span className="font-display font-bold text-[#6B1616] text-base sm:text-lg lg:text-xl leading-tight tracking-tight group-hover:text-[#8C2F22] transition-colors">
              Mulabagala Sri Sripadaraja Matha
            </span>
            <span className="text-[11px] sm:text-xs text-[#63534B] font-medium tracking-wide flex items-center gap-1.5">
              <span>Sri Raghavendra Swamy Brindavana Sannidhana</span>
              <span className="text-[#C99A3D]">•</span>
              <span className="font-semibold text-[#8C2F22]">Rajajinagar, Bengaluru</span>
            </span>
          </div>
        </Link>

        {/* Center: Streamlined Nav Items */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/70 p-1.5 rounded-2xl border border-[#C99A3D]/25 shadow-2xs">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white bg-[#8C2F22] shadow-xs scale-102'
                    : 'text-[#4A3B32] hover:text-[#8C2F22] hover:bg-[#8C2F22]/10'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Corner: Quick Action Buttons & Auth Gateways */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/devotee-register"
            className="hidden md:inline-flex px-3.5 py-2 text-xs font-bold text-[#8C2F22] bg-white border border-[#8C2F22]/30 rounded-xl hover:bg-[#8C2F22]/5 hover:border-[#8C2F22] transition-all shadow-2xs"
          >
            Devotee Signup
          </Link>

          <Link
            to="/login"
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#6E2217] to-[#8C2F22] hover:from-[#541010] hover:to-[#6E2217] shadow-sm rounded-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 border border-[#C99A3D]/40"
          >
            <span>Portal Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-[#8C2F22] bg-white border border-[#C99A3D]/30 hover:bg-[#FAF6EE] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-3 px-4 pt-3 border-t border-[#C99A3D]/20 space-y-1.5 pb-4 bg-[#FAF6EE] animate-fadeIn">
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
          <div className="pt-3 border-t border-[#C99A3D]/20 flex flex-col gap-2">
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
              Portal Login →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
