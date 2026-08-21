import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Flower2, ArrowRight, Sun, Moon, MapPin } from 'lucide-react';
import { MandalaPattern, LotusIcon, DiyaIcon } from './SpiritualDecorations';

interface HeroSectionProps {
  announcements?: Array<{ id: string; title: string; content: string; category?: string }>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ announcements = [] }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const currentTotalMinutes = hours * 60 + minutes;

  // Live status calculation
  let statusText = 'Sannidhana Closed';
  let isDarshanOpen = false;
  let nextEventTitle = 'Evening Darshan (5:30 PM)';
  let targetTotalMinutes = 1050; // 5:30 PM

  if (currentTotalMinutes >= 420 && currentTotalMinutes < 750) {
    // 7:00 AM - 12:30 PM
    statusText = 'Darshan & Pooja Open';
    isDarshanOpen = true;
    nextEventTitle = 'Mahamangalarathi (12:00 PM)';
    targetTotalMinutes = 720;
  } else if (currentTotalMinutes >= 750 && currentTotalMinutes < 840) {
    // 12:30 PM - 2:00 PM
    statusText = 'Teertha Prasada Serving';
    isDarshanOpen = true;
    nextEventTitle = 'Evening Darshan (5:30 PM)';
    targetTotalMinutes = 1050;
  } else if (currentTotalMinutes >= 1050 && currentTotalMinutes < 1230) {
    // 5:30 PM - 8:30 PM
    statusText = 'Evening Darshan Open';
    isDarshanOpen = true;
    nextEventTitle = 'Ratri Mahamangalarathi (8:00 PM)';
    targetTotalMinutes = 1200;
  } else {
    // Night or Afternoon Closure
    statusText = 'Sannidhana Closed';
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF6EE] via-[#FDFBF7] to-[#FAF6EE] border-b border-[#C99A3D]/25 pt-8 pb-12 sm:pt-12 sm:pb-16">
      {/* Background Spiritual Ambient Patterns */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-32 -left-32">
          <MandalaPattern size={600} opacity={0.06} />
        </div>
        <div className="absolute -bottom-32 -right-32">
          <MandalaPattern size={600} opacity={0.06} />
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Sacred Typography, Live Countdown & Action Gateways */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Sacred Shloka Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF6EE] border border-[#C99A3D]/40 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C99A3D]" />
              <span className="text-xs font-bold tracking-widest text-[#8C2F22] uppercase font-sans">
                ॥ SRI GURU RAGHAVENDRO VIJAYATE ॥
              </span>
            </div>

            {/* Main Title Heading */}
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-5xl xl:text-6xl font-extrabold text-[#2C221E] leading-[1.12] tracking-tight">
                Sri Raghavendra Swamy <br />
                <span className="text-[#8C2F22] relative inline-block">
                  Brindavana Sannidhana
                  <span className="absolute bottom-1 left-0 right-0 h-1 bg-[#C99A3D]/30 rounded-full" />
                </span>
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-1 text-[#6B1616]">
                <LotusIcon size={18} color="#8C2F22" />
                <p className="font-display text-base sm:text-lg font-bold">
                  Mulabagala Sri Sripadaraja Matha — Rajajinagar Branch
                </p>
              </div>
            </div>

            {/* Devotional Exposition */}
            <p className="text-sm sm:text-base text-[#5C4D44] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Welcome to the sanctified Sannidhana housing the consecrated Mrittika Brindavana of Sri Raghavendra Swamy, established under the divine authority of Mulabagala Sri Sripadaraja Matha. Experience daily Panchamrutha Abhisheka, Hastodaka, and sanctified Teertha Prasada.
            </p>

            {/* Live Darshan Status & Countdown Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#C99A3D]/30 shadow-xs max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Status Indicator */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    isDarshanOpen
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isDarshanOpen ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`} />
                    <span>{statusText}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#7A6B63]">
                    {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
                <p className="text-xs text-[#5C4D44] font-medium">
                  {nextEventTitle}
                </p>
              </div>

              {/* Live Seconds Countdown */}
              <div className="flex items-center gap-1.5 font-mono text-center shrink-0">
                <div className="bg-[#FAF6EE] px-2.5 py-1.5 rounded-xl border border-[#C99A3D]/30">
                  <span className="text-sm sm:text-base font-bold text-[#8C2F22]">{pad(countH)}</span>
                  <span className="block text-[8px] font-sans font-semibold text-[#7A6B63]">HRS</span>
                </div>
                <span className="text-xs font-bold text-[#C99A3D]">:</span>
                <div className="bg-[#FAF6EE] px-2.5 py-1.5 rounded-xl border border-[#C99A3D]/30">
                  <span className="text-sm sm:text-base font-bold text-[#8C2F22]">{pad(countM)}</span>
                  <span className="block text-[8px] font-sans font-semibold text-[#7A6B63]">MIN</span>
                </div>
                <span className="text-xs font-bold text-[#C99A3D]">:</span>
                <div className="bg-[#FAF6EE] px-2.5 py-1.5 rounded-xl border border-[#C99A3D]/30">
                  <span className="text-sm sm:text-base font-bold text-[#8C2F22]">{pad(countS)}</span>
                  <span className="block text-[8px] font-sans font-semibold text-[#7A6B63]">SEC</span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
              <button
                onClick={() => scrollToSection('schedule')}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#6E2217] to-[#8C2F22] hover:from-[#541010] hover:to-[#6E2217] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer border border-[#C99A3D]/40"
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

          {/* Right Column: Arched Temple Portal Frame with Real Brindavana Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Outer Golden Aura */}
              <div className="absolute -inset-2.5 bg-gradient-to-r from-[#C99A3D]/30 via-[#8C2F22]/15 to-[#C99A3D]/30 rounded-[32px] blur-md -z-0" />

              {/* Devotional Sanctum Card */}
              <div className="relative bg-white rounded-[28px] p-3.5 border-2 border-[#C99A3D]/50 shadow-2xl overflow-hidden">
                {/* Photo Aspect Frame */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-black group">
                  <img
                    src="/gallery/brindavana-1.jpg"
                    alt="Sri Raghavendra Swamy — Sacred Alankara Darshana"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />

                  {/* Sacred Lighting Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-center gap-1.5 text-[#FCD34D] mb-1">
                      <DiyaIcon size={16} color="#FCD34D" />
                      <span className="text-[10px] font-bold tracking-widest uppercase font-sans">
                        Moola Brindavana Sannidhana
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-white text-lg sm:text-xl drop-shadow-md leading-snug">
                      Sri Raghavendra Swamy
                    </h2>
                    <p className="text-[11px] text-[#EFE3CE]/90 mt-0.5">
                      Rajajinagar Sannidhana • Consecrated Mantralaya Mrittika
                    </p>
                  </div>
                </div>

                {/* Bottom Ribbon */}
                <div className="flex items-center justify-between px-3 pt-3 text-[11px] text-[#7A6B63] font-medium font-sans">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8C2F22]" />
                    <span>Rajajinagar, Bengaluru</span>
                  </span>
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
