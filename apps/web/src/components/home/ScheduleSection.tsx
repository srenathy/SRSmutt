import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Sparkles, CheckCircle2 } from 'lucide-react';
import { TempleArchMotif, DiyaIcon } from './SpiritualDecorations';

interface ScheduleSlot {
  title: string;
  time: string;
  startMinutes: number;
  endMinutes: number;
  highlight?: boolean;
}

export const ScheduleSection: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Indian Standard Time or local current minutes of day
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const currentTotalMinutes = hours * 60 + minutes;

  // Daily Schedule Slots in Minutes
  // 7:00 AM = 420 mins, 12:00 PM = 720 mins, 12:30 PM = 750 mins, 2:00 PM = 840 mins, 5:30 PM = 1050 mins, 8:00 PM = 1200 mins, 8:30 PM = 1230 mins
  let darshanStatus = {
    isOpen: false,
    badgeText: 'SANNIDHANA CLOSED',
    statusColor: 'text-amber-800 bg-amber-100 border-amber-300',
    dotColor: 'bg-amber-500',
    description: 'Next Darshan opens at 5:30 PM',
    nextEventTitle: 'Evening Darshan',
    nextEventTimeMinutes: 1050
  };

  if (currentTotalMinutes >= 420 && currentTotalMinutes < 720) {
    darshanStatus = {
      isOpen: true,
      badgeText: 'DARSHAN OPEN',
      statusColor: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      dotColor: 'bg-emerald-500',
      description: 'Morning Darshan & Pooja ongoing until 12:30 PM',
      nextEventTitle: 'Daily Mahamangalarathi',
      nextEventTimeMinutes: 720
    };
  } else if (currentTotalMinutes >= 720 && currentTotalMinutes < 750) {
    darshanStatus = {
      isOpen: true,
      badgeText: 'MAHAMANGALARATHI',
      statusColor: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      dotColor: 'bg-emerald-500',
      description: 'Daily Mahamangalarathi in progress',
      nextEventTitle: 'Teertha Prasada',
      nextEventTimeMinutes: 750
    };
  } else if (currentTotalMinutes >= 750 && currentTotalMinutes < 840) {
    darshanStatus = {
      isOpen: true,
      badgeText: 'TEERTHA PRASADA',
      statusColor: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      dotColor: 'bg-emerald-500',
      description: 'Daily sanctified meal distribution ongoing',
      nextEventTitle: 'Evening Darshan',
      nextEventTimeMinutes: 1050
    };
  } else if (currentTotalMinutes >= 840 && currentTotalMinutes < 1050) {
    darshanStatus = {
      isOpen: false,
      badgeText: 'AFTERNOON CLOSURE',
      statusColor: 'text-amber-800 bg-amber-100 border-amber-300',
      dotColor: 'bg-amber-500',
      description: 'Sannidhana reopens at 5:30 PM for Evening Pooja',
      nextEventTitle: 'Evening Darshan & Pooja',
      nextEventTimeMinutes: 1050
    };
  } else if (currentTotalMinutes >= 1050 && currentTotalMinutes < 1200) {
    darshanStatus = {
      isOpen: true,
      badgeText: 'DARSHAN OPEN',
      statusColor: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      dotColor: 'bg-emerald-500',
      description: 'Evening Darshan & Pooja ongoing until 8:30 PM',
      nextEventTitle: 'Evening Mahamangalarathi',
      nextEventTimeMinutes: 1200
    };
  } else if (currentTotalMinutes >= 1200 && currentTotalMinutes < 1230) {
    darshanStatus = {
      isOpen: true,
      badgeText: 'MAHAMANGALARATHI',
      statusColor: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      dotColor: 'bg-emerald-500',
      description: 'Evening Mahamangalarathi in progress',
      nextEventTitle: 'Morning Darshan (Tomorrow)',
      nextEventTimeMinutes: 1440 + 420
    };
  } else {
    darshanStatus = {
      isOpen: false,
      badgeText: 'CLOSED FOR THE NIGHT',
      statusColor: 'text-stone-800 bg-stone-100 border-stone-300',
      dotColor: 'bg-stone-500',
      description: 'Sannidhana reopens tomorrow morning at 7:00 AM',
      nextEventTitle: 'Morning Darshan (Tomorrow)',
      nextEventTimeMinutes: currentTotalMinutes < 420 ? 420 : 1440 + 420
    };
  }

  // Calculate live countdown to next event in seconds
  let targetSeconds = 0;
  if (darshanStatus.nextEventTimeMinutes > currentTotalMinutes) {
    targetSeconds = (darshanStatus.nextEventTimeMinutes - currentTotalMinutes) * 60 - seconds;
  } else {
    targetSeconds = (darshanStatus.nextEventTimeMinutes + 1440 - currentTotalMinutes) * 60 - seconds;
  }
  if (targetSeconds < 0) targetSeconds = 0;

  const countHours = Math.floor(targetSeconds / 3600);
  const countMins = Math.floor((targetSeconds % 3600) / 60);
  const countSecs = targetSeconds % 60;

  const format2 = (n: number) => String(n).padStart(2, '0');

  const morningSlots: ScheduleSlot[] = [
    { title: 'Morning Darshan & Pooja', time: '7:00 AM – 12:30 PM', startMinutes: 420, endMinutes: 750 },
    { title: 'Daily Mahamangalarathi', time: '12:00 PM – 12:30 PM', startMinutes: 720, endMinutes: 750 },
    { title: 'Teertha Prasada (Annadana)', time: '12:30 PM onwards', startMinutes: 750, endMinutes: 840 },
  ];

  const eveningSlots: ScheduleSlot[] = [
    { title: 'Evening Darshan & Pooja', time: '5:30 PM – 8:30 PM', startMinutes: 1050, endMinutes: 1230 },
    { title: 'Evening Mahamangalarathi', time: '8:00 PM – 8:30 PM', startMinutes: 1200, endMinutes: 1230 },
  ];

  return (
    <section id="schedule" className="py-12 sm:py-16 bg-[#FAF6EE] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Heading with Temple Motif */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8C2F22]">
            <Clock className="w-4 h-4 text-[#8C2F22]" />
            <span>DAILY SANNIDHANA TIMINGS</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E]">
            Today&apos;s Darshan &amp; Pooja Schedule
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44]">
            Verified daily pooja and sanctified Teertha Prasada schedule at Rajajinagar Sannidhana.
          </p>
          <TempleArchMotif className="opacity-80" />
        </div>

        {/* Dynamic Live Darshan Status & Countdown Banner */}
        <div className="bg-white rounded-3xl border border-turmeric/30 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Live Status Badge & Description */}
            <div className="md:col-span-7 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${darshanStatus.statusColor}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${darshanStatus.dotColor} ${darshanStatus.isOpen ? 'animate-ping' : ''}`} />
                  <span>● {darshanStatus.badgeText}</span>
                </span>
                <span className="text-xs text-[#7A6B63] font-mono font-medium">
                  {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
              <p className="font-display text-lg font-bold text-[#2C221E]">
                {darshanStatus.description}
              </p>
              <p className="text-xs text-[#7A6B63]">
                Rajajinagar branch welcomes all devotees for daily Archana, Abhisheka, and sanctified Teertha Prasada.
              </p>
            </div>

            {/* Right: Live Real-Time Countdown to Next Pooja */}
            <div className="md:col-span-5 bg-[#FAF6EE] p-5 rounded-2xl border border-turmeric/20 text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#8C2F22] uppercase tracking-wider">
                <DiyaIcon size={14} color="#8C2F22" />
                <span>NEXT POOJA / DARSHAN</span>
              </div>
              <p className="font-display font-bold text-sm text-[#2C221E]">
                {darshanStatus.nextEventTitle}
              </p>

              {/* Countdown Digits */}
              <div className="flex items-center justify-center gap-2 font-mono pt-1">
                <div className="bg-white px-3 py-2 rounded-xl border border-turmeric/30 shadow-2xs">
                  <span className="text-lg sm:text-xl font-bold text-[#8C2F22]">{format2(countHours)}</span>
                  <span className="block text-[9px] font-sans font-semibold text-[#7A6B63] uppercase">HRS</span>
                </div>
                <span className="text-lg font-bold text-[#C99A3D]">:</span>
                <div className="bg-white px-3 py-2 rounded-xl border border-turmeric/30 shadow-2xs">
                  <span className="text-lg sm:text-xl font-bold text-[#8C2F22]">{format2(countMins)}</span>
                  <span className="block text-[9px] font-sans font-semibold text-[#7A6B63] uppercase">MINS</span>
                </div>
                <span className="text-lg font-bold text-[#C99A3D]">:</span>
                <div className="bg-white px-3 py-2 rounded-xl border border-turmeric/30 shadow-2xs">
                  <span className="text-lg sm:text-xl font-bold text-[#8C2F22]">{format2(countSecs)}</span>
                  <span className="block text-[9px] font-sans font-semibold text-[#7A6B63] uppercase">SECS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Cards Grid: Morning & Evening */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning Schedule Card */}
          <div className="bg-white rounded-3xl border border-turmeric/20 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#2C221E]">Morning Schedule</h3>
                  <p className="text-[11px] text-[#7A6B63]">Panchamrutha Abhisheka &amp; Mahamangalarathi</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#C99A3D] bg-[#C99A3D]/10 px-2.5 py-1 rounded-lg">
                7:00 AM – 12:30 PM
              </span>
            </div>

            <div className="space-y-3">
              {morningSlots.map((slot) => {
                const isActive = currentTotalMinutes >= slot.startMinutes && currentTotalMinutes < slot.endMinutes;
                return (
                  <div
                    key={slot.title}
                    className={`p-3.5 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-emerald-50/80 border-emerald-200 shadow-2xs'
                        : 'bg-[#FAF6EE]/70 border-turmeric/10 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? 'text-emerald-950' : 'text-[#2C221E]'}`}>
                        {slot.title}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#8C2F22]">{slot.time}</span>
                    </div>
                    {isActive && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        ● Currently in Progress
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evening Schedule Card */}
          <div className="bg-white rounded-3xl border border-turmeric/20 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center border border-purple-300">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#2C221E]">Evening Schedule</h3>
                  <p className="text-[11px] text-[#7A6B63]">Evening Pooja &amp; Ratri Mahamangalarathi</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#C99A3D] bg-[#C99A3D]/10 px-2.5 py-1 rounded-lg">
                5:30 PM – 8:30 PM
              </span>
            </div>

            <div className="space-y-3">
              {eveningSlots.map((slot) => {
                const isActive = currentTotalMinutes >= slot.startMinutes && currentTotalMinutes < slot.endMinutes;
                return (
                  <div
                    key={slot.title}
                    className={`p-3.5 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-emerald-50/80 border-emerald-200 shadow-2xs'
                        : 'bg-[#FAF6EE]/70 border-turmeric/10 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? 'text-emerald-950' : 'text-[#2C221E]'}`}>
                        {slot.title}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#8C2F22]">{slot.time}</span>
                    </div>
                    {isActive && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        ● Currently in Progress
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="p-3.5 rounded-2xl bg-[#FAF6EE]/40 border border-turmeric/10 flex items-center gap-2 text-xs text-[#7A6B63]">
                <CheckCircle2 className="w-4 h-4 text-[#C99A3D] shrink-0" />
                <span>Special Archana &amp; Sankalpa are performed during both morning and evening sessions.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
