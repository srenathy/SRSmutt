import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SectionItem {
  id: string;
  label: string;
  short: string;
}

const SECTIONS: SectionItem[] = [
  { id: 'hero', label: 'Home & Darshan Overview', short: 'Home' },
  { id: 'schedule', label: 'Darshan & Pooja Timings', short: 'Timings' },
  { id: 'about', label: 'About Sannidhana', short: 'About' },
  { id: 'sevas', label: 'Sevas & Devotional Offerings', short: 'Sevas' },
  { id: 'events', label: 'Events & Aradhana News', short: 'Events' },
  { id: 'gallery', label: 'Sacred Photo Gallery', short: 'Gallery' },
  { id: 'contact', label: 'Visit & Temple Location', short: 'Visit' },
];

export const SidePageNavigator: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('hero');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentIdx = SECTIONS.findIndex((s) => s.id === activeId);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 75;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      window.scrollTo({
        top: Math.max(0, elementRect - bodyRect - offset),
        behavior: 'smooth'
      });
    }
  };

  const handleNext = () => {
    const nextIdx = Math.min(SECTIONS.length - 1, currentIdx + 1);
    scrollToSection(SECTIONS[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = Math.max(0, currentIdx - 1);
    scrollToSection(SECTIONS[prevIdx].id);
  };

  return (
    <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2 pointer-events-auto">
      {/* Floating Control Box */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-full border border-[#C99A3D]/40 shadow-xl flex flex-col items-center gap-1.5 transition-all">
        {/* Scroll Up Button */}
        <button
          onClick={handlePrev}
          disabled={currentIdx <= 0}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#8C2F22] hover:bg-[#FAF6EE] disabled:opacity-20 disabled:cursor-not-allowed transition"
          aria-label="Previous page section"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* Section Navigation Dots */}
        <div className="flex flex-col items-center gap-2 py-1">
          {SECTIONS.map((sec, idx) => {
            const isActive = activeId === sec.id;
            return (
              <div
                key={sec.id}
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHoveredId(sec.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Floating Tooltip */}
                {hoveredId === sec.id && (
                  <div className="absolute right-8 whitespace-nowrap bg-[#2C221E] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-[#C99A3D]/40 animate-fadeIn pointer-events-none">
                    {sec.label}
                  </div>
                )}

                <button
                  onClick={() => scrollToSection(sec.id)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-3.5 h-3.5 bg-[#8C2F22] ring-4 ring-[#C99A3D]/40 shadow-xs'
                      : 'w-2 h-2 bg-[#C99A3D]/50 hover:bg-[#8C2F22] hover:scale-125'
                  }`}
                  aria-label={`Scroll to ${sec.label}`}
                />
              </div>
            );
          })}
        </div>

        {/* Scroll Down Button */}
        <button
          onClick={handleNext}
          disabled={currentIdx >= SECTIONS.length - 1}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#8C2F22] hover:bg-[#FAF6EE] disabled:opacity-20 disabled:cursor-not-allowed transition"
          aria-label="Next page section"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Current Page Counter Badge */}
      <span className="text-[10px] font-mono font-bold text-[#8C2F22] bg-[#FAF6EE] px-2 py-0.5 rounded-full border border-[#C99A3D]/30 shadow-2xs">
        {currentIdx + 1}/{SECTIONS.length}
      </span>
    </div>
  );
};
