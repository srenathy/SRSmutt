import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sparkles, UserCheck, ArrowRight } from 'lucide-react';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Determine active section based on scroll
      const sections = ['about', 'schedule', 'sevas', 'events', 'gallery', 'contact'];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(s);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Darshan & Pooja', href: '#schedule', id: 'schedule' },
    { label: 'Sevas', href: '#sevas', id: 'sevas' },
    { label: 'Events & News', href: '#events', id: 'events' },
    { label: 'Photo Gallery', href: '#gallery', id: 'gallery' },
    { label: 'Location & Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-turmeric/30'
          : 'bg-[#FCF8F0]/90 backdrop-blur-xs py-4 border-b border-turmeric/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Matha Logo & Title Branding */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-kumkum/40 rounded-xl p-1"
          >
            {/* Sacred Emblem Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#8C2F22] to-[#6E2217] text-white flex items-center justify-center font-display text-xl font-bold shadow-md border border-[#C99A3D]/40 group-hover:scale-105 transition-transform shrink-0">
              🕉️
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[#6B1616] text-base sm:text-lg leading-tight tracking-tight group-hover:text-[#8C2F22] transition-colors">
                Mulabagala Sri Sripadaraja Matha
              </span>
              <span className="text-[11px] sm:text-xs text-[#63534B] font-medium tracking-wide">
                Sri Raghavendra Swamy Brindavana Sannidhana — Rajajinagar, Bengaluru
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 relative ${
                    isActive
                      ? 'text-[#8C2F22] bg-[#8C2F22]/10 font-extrabold'
                      : 'text-[#4A3B32] hover:text-[#8C2F22] hover:bg-[#8C2F22]/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#8C2F22] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA Buttons (Desktop) */}
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

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#8C2F22] rounded-lg shadow-xs"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#8C2F22] hover:bg-[#8C2F22]/10 transition-colors border border-turmeric/30"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-turmeric/20 space-y-1.5 pb-3 animate-fadeIn">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-3.5 py-2 rounded-xl text-xs font-bold text-[#4A3B32] hover:text-[#8C2F22] hover:bg-[#8C2F22]/10 transition-colors"
              >
                {link.label}
              </a>
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
      </div>
    </header>
  );
};
