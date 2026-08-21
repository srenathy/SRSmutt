import React from 'react';
import { Sparkles, Clock, Flower2, ArrowRight } from 'lucide-react';
import { MandalaPattern, LotusIcon, DiyaIcon } from './SpiritualDecorations';

interface HeroSectionProps {
  announcements?: Array<{ id: string; title: string; content: string; category?: string }>;
  onSelectTab?: (tabId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ announcements = [], onSelectTab }) => {
  const newsItem = announcements.find((a) => a.category?.toUpperCase() === 'ANNOUNCEMENT');

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (onSelectTab) {
      onSelectTab(id);
    }
    const element = document.getElementById('main-content-view') || document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({
        top: Math.max(0, elementPosition - offset),
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6EE] via-[#FDFBF7] to-[#FAF6EE] border-b border-turmeric/20 pt-8 pb-14 sm:pt-12 sm:pb-20">
      {/* Background Spiritual Mandala Motifs */}
      <div className="absolute -top-24 -left-24 pointer-events-none">
        <MandalaPattern size={480} opacity={0.035} />
      </div>
      <div className="absolute -bottom-24 -right-24 pointer-events-none">
        <MandalaPattern size={520} opacity={0.035} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Sacred Typography & CTAs */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Sacred Shloka Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C99A3D]/10 border border-[#C99A3D]/30 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C99A3D]" />
              <span className="text-xs font-bold tracking-widest text-[#8C2F22] uppercase font-sans">
                ॥ SRI GURU RAGHAVENDRO VIJAYATE ॥
              </span>
            </div>

            {/* Main Sacred Title */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2C221E] leading-[1.15] tracking-tight">
              Sri Raghavendra Swamy <br className="hidden sm:inline" />
              <span className="text-[#8C2F22]">Brindavana Sannidhana</span>
            </h1>

            {/* Matha Branch Subtitle */}
            <div className="flex items-center justify-center lg:justify-start gap-2 pt-1">
              <LotusIcon size={20} color="#8C2F22" />
              <p className="font-display text-base sm:text-lg font-bold text-[#6B1616]">
                Mulabagala Sri Sripadaraja Matha — Rajajinagar Branch
              </p>
            </div>

            {/* Sacred Description */}
            <p className="text-sm sm:text-base text-[#5C4D44] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Experience divine blessings at our Rajajinagar branch housing the sanctified Mrittika Brindavana of Sri Raghavendra Swamy, established under the holy lineage of Sri Sripadaraja Swamiji. Devotees visit for daily worship, Sevas, and Teertha Prasada.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={(e) => scrollToSection(e, 'schedule')}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#8C2F22] hover:bg-[#6E2217] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>View Today&apos;s Timings</span>
              </button>

              <button
                onClick={(e) => scrollToSection(e, 'sevas')}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#8C2F22] bg-[#FAF6EE] hover:bg-[#F3EAD8] border border-[#C99A3D]/40 transition-all shadow-xs hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Flower2 className="w-4 h-4 text-[#8C2F22]" />
                <span>Seva &amp; Offerings</span>
              </button>
            </div>

            {/* Live News Ticker (if present) */}
            {newsItem && (
              <div className="pt-2">
                <div className="bg-[#FAF6EE] border border-[#C99A3D]/30 rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-2xs">
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider bg-[#8C2F22] text-white rounded-md uppercase shrink-0">
                    ANNOUNCEMENT
                  </span>
                  <div className="overflow-hidden text-xs text-[#5C4D44] truncate">
                    <strong className="text-[#2C221E]">{newsItem.title}:</strong> {newsItem.content}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sanctified Brindavana Visual Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Decorative Subtle Gold Backing Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#C99A3D]/20 via-[#8C2F22]/10 to-[#C99A3D]/20 rounded-3xl blur-md -z-0" />

              {/* Devotional Card Container */}
              <div className="relative bg-white rounded-3xl p-3 border border-[#C99A3D]/40 shadow-xl overflow-hidden">
                {/* Photo Aspect Frame */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-black/90 group">
                  <img
                    src="/gallery/brindavana-1.jpg"
                    alt="Sri Raghavendra Swamy — Sacred Alankara Darshana, Rajajinagar Sannidhana"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />

                  {/* Gradient Lighting & Caption Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center gap-1.5 text-[#FCD34D] mb-1">
                      <DiyaIcon size={18} color="#FCD34D" />
                      <span className="text-[11px] font-bold tracking-wider uppercase font-sans">
                        Moola Brindavana Sannidhana
                      </span>
                    </div>
                    <p className="font-display font-bold text-white text-base sm:text-lg leading-snug drop-shadow-md">
                      Sri Raghavendra Swamy — Rajajinagar Branch
                    </p>
                    <p className="text-[11px] text-[#EFE3CE]/80 mt-0.5">
                      Consecrated Mrittika Brindavana • Daily Mahamangalarathi
                    </p>
                  </div>
                </div>

                {/* Subtle Bottom Gold Trim */}
                <div className="flex items-center justify-between px-3 pt-2.5 text-[11px] text-[#7A6B63] font-medium font-sans">
                  <span>Bengaluru Sannidhana</span>
                  <span className="text-[#8C2F22] font-bold">Daily Darshan 7:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
