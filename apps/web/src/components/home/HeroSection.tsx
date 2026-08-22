import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Flower2, ChevronUp, ChevronDown, Diya } from 'lucide-react';
import { MandalaPattern, LotusIcon } from './SpiritualDecorations';
import { apiClient } from '../../api/client';

interface HeroSectionProps {
  announcements?: Array<{ id: string; title: string; content: string; category?: string }>;
}

const DEFAULT_HERO_PHOTOS = [
  {
    src: '/gallery/brindavana-1.jpg',
    title: 'Sri Raghavendra Swamy — Sacred Alankara Darshana',
    caption: 'Consecrated Mantralaya Mrittika Brindavana - Main Shrine, Rajajinagar'
  },
  {
    src: '/gallery/brindavana-2.jpg',
    title: 'Sri Raghavendra Swamy — Pushpa Alankara',
    caption: 'Sacred floral decoration during special festival celebrations'
  },
  {
    src: '/gallery/brindavana-3.jpg',
    title: 'Sri Raghavendra Swamy — Vastra Alankara',
    caption: 'Traditional silk vastra offering and golden sanctum view'
  },
  {
    src: '/gallery/brindavana-4.jpg',
    title: 'Sri Raghavendra Matha — Rajajinagar Sannidhana',
    caption: 'Consecrated Mrittika Brindavana sanctum sanctorum'
  }
];

export const HeroSection: React.FC<HeroSectionProps> = ({ announcements = [] }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [photos, setPhotos] = useState(DEFAULT_HERO_PHOTOS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch gallery images if available from API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await apiClient.get('/gallery/public');
        const list = res.data?.data;
        if (Array.isArray(list) && list.length > 0) {
          const heroBanners = list.filter((item: any) => item.category === 'HERO_BANNER');
          const finalItems = heroBanners.length > 0 ? heroBanners : list;

          setPhotos(
            finalItems.map((item: any) => ({
              src: item.imageUrl,
              title: item.title,
              caption: item.caption || item.title || 'Consecrated Mantralaya Mrittika Brindavana - Main Shrine, Rajajinagar'
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load hero gallery photos, using defaults:', err);
      }
    };
    fetchGallery();
  }, []);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-cycle hero images every 6 seconds
  useEffect(() => {
    if (isHovered || photos.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % photos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, photos.length]);

  const handlePrevSlide = () => {
    setActiveIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNextSlide = () => {
    setActiveIdx((prev) => (prev + 1) % photos.length);
  };

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const currentTotalMinutes = hours * 60 + minutes;

  // Live status calculation
  let statusText = 'SANNIDHANA CLOSED';
  let isDarshanOpen = false;
  let nextEventTitle = 'Evening Darshan (5:30 PM)';
  let targetTotalMinutes = 1050; // 5:30 PM

  if (currentTotalMinutes >= 420 && currentTotalMinutes < 480) {
    // 7:00 AM - 8:00 AM
    statusText = 'MORNING DARSHAN OPEN';
    isDarshanOpen = true;
    nextEventTitle = 'Panchamrutha Abhisheka (8:00 AM)';
    targetTotalMinutes = 480;
  } else if (currentTotalMinutes >= 480 && currentTotalMinutes < 540) {
    // 8:00 AM - 9:00 AM
    statusText = 'PANCHAMRUTHA ABHISHEKA & ARCHANA';
    isDarshanOpen = true;
    nextEventTitle = 'Pushpa Alankara Darshan (9:00 AM)';
    targetTotalMinutes = 540;
  } else if (currentTotalMinutes >= 540 && currentTotalMinutes < 720) {
    // 9:00 AM - 12:00 PM
    statusText = 'ALANKARA DARSHAN OPEN';
    isDarshanOpen = true;
    nextEventTitle = 'Mahamangalarathi (12:00 PM)';
    targetTotalMinutes = 720;
  } else if (currentTotalMinutes >= 720 && currentTotalMinutes < 750) {
    // 12:00 PM - 12:30 PM
    statusText = 'MAHAMANGALARATHI IN PROGRESS';
    isDarshanOpen = true;
    nextEventTitle = 'Evening Darshan (5:30 PM)';
    targetTotalMinutes = 1050;
  } else if (currentTotalMinutes >= 750 && currentTotalMinutes < 1050) {
    // 12:30 PM - 5:30 PM
    statusText = 'AFTERNOON CLOSURE';
    isDarshanOpen = false;
    nextEventTitle = 'Evening Darshan (5:30 PM)';
    targetTotalMinutes = 1050;
  } else if (currentTotalMinutes >= 1050 && currentTotalMinutes < 1230) {
    // 5:30 PM - 8:30 PM
    statusText = 'EVENING DARSHAN OPEN';
    isDarshanOpen = true;
    nextEventTitle = 'Ratri Mahamangalarathi (8:00 PM)';
    targetTotalMinutes = 1200;
  } else {
    // Night Closure
    statusText = 'SANNIDHANA CLOSED';
    isDarshanOpen = false;
    if (currentTotalMinutes < 420) {
      nextEventTitle = 'Morning Darshan (7:00 AM)';
      targetTotalMinutes = 420;
    } else {
      nextEventTitle = 'Morning Darshan (Tomorrow 7:00 AM)';
      targetTotalMinutes = 1440 + 420;
    }
  }

  // Calculate countdown
  let diffSecs = 0;
  if (targetTotalMinutes > currentTotalMinutes) {
    diffSecs = (targetTotalMinutes - currentTotalMinutes) * 60 - seconds;
  } else {
    diffSecs = (targetTotalMinutes + 1440 - currentTotalMinutes) * 60 - seconds;
  }
  if (diffSecs < 0) diffSecs = 0;

  const countH = Math.floor(diffSecs / 3600);
  const countM = Math.floor((diffSecs % 3600) / 60);
  const countS = diffSecs % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const newsItem = announcements.find((a) => a.category?.toUpperCase() === 'ANNOUNCEMENT');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      window.scrollTo({
        top: Math.max(0, elementRect - bodyRect - offset),
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="hero"
      className="snap-page-section relative overflow-hidden bg-gradient-to-b from-[#FAF6EE] via-[#FDFBF7] to-[#FAF6EE] border-b border-[#C99A3D]/25 pt-6 pb-12 sm:pt-10 sm:pb-16 min-h-[calc(100vh-80px)] flex flex-col justify-center"
    >
      {/* Background Spiritual Ambient Patterns */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-32 -left-32">
          <MandalaPattern size={600} opacity={0.06} />
        </div>
        <div className="absolute -bottom-32 -right-32">
          <MandalaPattern size={600} opacity={0.06} />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Sacred Typography, Live Countdown & Action Gateways */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 text-center lg:text-left z-20">
            {/* Sacred Shloka Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6EE] border border-[#C99A3D]/40 shadow-xs">
              <span className="text-xs">🕉️</span>
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#8C2F22] uppercase font-sans">
                ॥ SRI GURU RAGHAVENDRO VIJAYATE ॥
              </span>
            </div>

            {/* Main Title Heading */}
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-5xl xl:text-[54px] font-extrabold text-[#2C221E] leading-[1.15] tracking-tight">
                Sri Raghavendra Swamy <br />
                <span className="text-[#8C2F22] relative inline-block">
                  Brindavana Sannidhana
                </span>
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-1 text-[#6B1616]">
                <LotusIcon size={16} color="#8C2F22" />
                <p className="font-display text-sm sm:text-base font-bold">
                  Mulabagala Sri Sripadaraja Matha — Rajajinagar Branch
                </p>
              </div>
            </div>

            {/* Devotional Exposition */}
            <p className="text-xs sm:text-sm text-[#5C4D44] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Welcome to the sanctified Sannidhana housing the consecrated Mrittika Brindavana of Sri Raghavendra Swamy, established under the divine authority of Mulabagala Sri Sripadaraja Matha. Experience daily Panchamrutha Abhisheka, Hastodaka, and sacred Mahamangalarathi.
            </p>

            {/* Live Darshan Status & Countdown Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#C99A3D]/30 shadow-xs max-w-lg mx-auto lg:mx-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Status Indicator */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider ${
                      isDarshanOpen
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isDarshanOpen ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`} />
                    <span>{statusText}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#7A6B63]">
                    {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
                <p className="text-xs text-[#5C4D44] font-medium pt-0.5">
                  {nextEventTitle}
                </p>
              </div>

              {/* Live Seconds Countdown */}
              <div className="flex items-center gap-1.5 font-mono text-center shrink-0">
                <div className="bg-[#FAF6EE] px-2.5 py-1.5 rounded-xl border border-[#C99A3D]/30 min-w-[44px]">
                  <span className="text-sm sm:text-base font-bold text-[#8C2F22]">{pad(countH)}</span>
                  <span className="block text-[8px] font-sans font-semibold text-[#7A6B63]">HRS</span>
                </div>
                <span className="text-xs font-bold text-[#C99A3D]">:</span>
                <div className="bg-[#FAF6EE] px-2.5 py-1.5 rounded-xl border border-[#C99A3D]/30 min-w-[44px]">
                  <span className="text-sm sm:text-base font-bold text-[#8C2F22]">{pad(countM)}</span>
                  <span className="block text-[8px] font-sans font-semibold text-[#7A6B63]">MIN</span>
                </div>
                <span className="text-xs font-bold text-[#C99A3D]">:</span>
                <div className="bg-[#FAF6EE] px-2.5 py-1.5 rounded-xl border border-[#C99A3D]/30 min-w-[44px]">
                  <span className="text-sm sm:text-base font-bold text-[#8C2F22]">{pad(countS)}</span>
                  <span className="block text-[8px] font-sans font-semibold text-[#7A6B63]">SEC</span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
              <button
                onClick={() => scrollToSection('schedule')}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#8C2F22] hover:bg-[#732217] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer border border-[#C99A3D]/40"
              >
                <Clock className="w-4 h-4" />
                <span>View Today&apos;s Schedule</span>
              </button>

              <button
                onClick={() => scrollToSection('sevas')}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-[#8C2F22] bg-white hover:bg-[#FAF6EE] border border-[#C99A3D]/40 shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Flower2 className="w-4 h-4 text-[#8C2F22]" />
                <span>Sevas &amp; Offerings</span>
              </button>
            </div>

            {/* News Ticker */}
            {newsItem && (
              <div className="pt-1">
                <div className="bg-[#FAF6EE] border border-[#C99A3D]/30 rounded-2xl p-3 flex items-center gap-3 text-left shadow-2xs">
                  <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider bg-[#8C2F22] text-white rounded uppercase shrink-0 font-mono">
                    NOTICE
                  </span>
                  <div className="overflow-hidden text-xs text-[#5C4D44] truncate">
                    <strong className="text-[#2C221E]">{newsItem.title}:</strong> {newsItem.content}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Seamless Feathered Vignette Sanctum Shrine + Vertical Slider Navigator */}
          <div
            className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Outer Warm Golden Radial Glow Halo */}
            <div className="absolute inset-0 -m-8 bg-[radial-gradient(circle_at_center,rgba(201,154,61,0.35)_0%,rgba(140,47,34,0.15)_45%,transparent_72%)] rounded-full blur-2xl pointer-events-none -z-0" />

            <div className="relative w-full max-w-[540px] flex flex-col items-center">
              {/* Vignette-Feathered Sanctum Image */}
              <div
                className="relative w-full aspect-[4/3] sm:aspect-[1.15/1] overflow-hidden flex items-center justify-center"
                style={{
                  maskImage: 'radial-gradient(ellipse at center, black 52%, rgba(0,0,0,0.85) 68%, transparent 95%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 52%, rgba(0,0,0,0.85) 68%, transparent 95%)'
                }}
              >
                {photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo.src}
                    alt={photo.title || 'Sri Raghavendra Swamy Sanctum'}
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out ${
                      idx === activeIdx
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 pointer-events-none z-0'
                    }`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>

              {/* Bottom Caption */}
              <div className="mt-3 text-center sm:text-right w-full px-4">
                <p className="text-[11px] sm:text-xs text-[#5C4D44] font-serif font-medium tracking-wide">
                  {photos[activeIdx]?.caption || 'Consecrated Mantralaya Mrittika Brindavana - Main Shrine, Mantralayam'}
                </p>
              </div>

              {/* Right Vertical Pill Carousel Navigator (matching screenshot design) */}
              <div className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-white/90 backdrop-blur-xs border border-[#C99A3D]/40 rounded-full py-3 px-1.5 shadow-md space-y-2">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Previous Slide"
                  className="w-5 h-5 flex items-center justify-center text-[#8C2F22] hover:bg-[#8C2F22]/10 rounded-full transition cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* Dots indicator */}
                <div className="flex flex-col items-center gap-1.5 py-1">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        idx === activeIdx
                          ? 'w-2 h-4 bg-[#8C2F22] shadow-xs'
                          : 'w-1.5 h-1.5 bg-[#C99A3D]/40 hover:bg-[#C99A3D]'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Next Slide"
                  className="w-5 h-5 flex items-center justify-center text-[#8C2F22] hover:bg-[#8C2F22]/10 rounded-full transition cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                <span className="text-[9px] font-mono font-bold text-[#7A6B63] pt-0.5">
                  {activeIdx + 1}/{photos.length}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
