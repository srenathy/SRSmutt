import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Sparkles, CheckCircle2, Utensils } from 'lucide-react';
import { TempleArchMotif, DiyaIcon, LotusIcon } from './SpiritualDecorations';

export const ScheduleSection: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const currentTotalMinutes = hours * 60 + minutes;

  const morningSlots = [
    { title: 'Morning Darshan & Nirmalya Pooja', time: '7:00 AM – 9:00 AM', start: 420, end: 540, desc: 'Nirmalya Visarjana & daily morning pooja rituals' },
    { title: 'Panchamrutha Abhisheka & Archana', time: '9:00 AM – 11:30 AM', start: 540, end: 690, desc: 'Sacred milk, honey, curd, ghee & fruit abhisheka' },
    { title: 'Daily Mahamangalarathi & Hastodaka', time: '12:00 PM – 12:30 PM', start: 720, end: 750, desc: 'Grand afternoon aarthi and Hastodaka samarpanam' },
    { title: 'Nitya Teertha Prasada (Annadana)', time: '12:30 PM onwards', start: 750, end: 840, desc: 'Daily sanctified meal distribution for visiting devotees' },
  ];

  const eveningSlots = [
    { title: 'Evening Sannidhana Opening & Darshan', time: '5:30 PM – 7:30 PM', start: 1050, end: 1170, desc: 'Temple opens for evening devotees and special Archana' },
    { title: 'Stotra Parayana & Deeparadhane', time: '7:30 PM – 8:00 PM', start: 1170, end: 1200, desc: 'Sri Raghavendra Stotra chanting & golden deepa seva' },
    { title: 'Ratri Mahamangalarathi', time: '8:00 PM – 8:30 PM', start: 1200, end: 1230, desc: 'Night concluding aarthi followed by Teertha distribution' },
  ];

  return (
    <section id="schedule" className="py-12 sm:py-16 bg-[#FAF6EE] scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8C2F22]">
            <Clock className="w-4 h-4 text-[#8C2F22]" />
            <span>DAILY SANNIDHANA SCHEDULE</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#2C221E]">
            Today&apos;s Darshan &amp; Pooja Timings
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44]">
            Verified daily ritual timings, Mahamangalarathi, and sanctified Teertha Prasada at Rajajinagar Sannidhana.
          </p>
          <TempleArchMotif className="opacity-80" />
        </div>

        {/* Schedule Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Morning Schedule Card */}
          <div className="bg-white rounded-3xl border border-[#C99A3D]/30 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#C99A3D]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300 shadow-2xs">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#2C221E]">Morning Schedule</h3>
                  <p className="text-xs text-[#7A6B63]">7:00 AM – 12:30 PM</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#8C2F22] bg-[#FAF6EE] border border-[#C99A3D]/30 px-3 py-1 rounded-xl">
                Morning Phase
              </span>
            </div>

            <div className="space-y-3">
              {morningSlots.map((slot) => {
                const isActive = currentTotalMinutes >= slot.start && currentTotalMinutes < slot.end;
                return (
                  <div
                    key={slot.title}
                    className={`p-4 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-200 shadow-xs'
                        : 'bg-[#FAF6EE]/60 border-[#C99A3D]/15 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold ${isActive ? 'text-emerald-950' : 'text-[#2C221E]'}`}>
                          {slot.title}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            ● Live Now
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#8C2F22] shrink-0">
                        {slot.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A6B63] mt-1 leading-relaxed">
                      {slot.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evening Schedule Card */}
          <div className="bg-white rounded-3xl border border-[#C99A3D]/30 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#C99A3D]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center border border-purple-300 shadow-2xs">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#2C221E]">Evening Schedule</h3>
                  <p className="text-xs text-[#7A6B63]">5:30 PM – 8:30 PM</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#8C2F22] bg-[#FAF6EE] border border-[#C99A3D]/30 px-3 py-1 rounded-xl">
                Evening Phase
              </span>
            </div>

            <div className="space-y-3">
              {eveningSlots.map((slot) => {
                const isActive = currentTotalMinutes >= slot.start && currentTotalMinutes < slot.end;
                return (
                  <div
                    key={slot.title}
                    className={`p-4 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-200 shadow-xs'
                        : 'bg-[#FAF6EE]/60 border-[#C99A3D]/15 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold ${isActive ? 'text-emerald-950' : 'text-[#2C221E]'}`}>
                          {slot.title}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            ● Live Now
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#8C2F22] shrink-0">
                        {slot.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A6B63] mt-1 leading-relaxed">
                      {slot.desc}
                    </p>
                  </div>
                );
              })}

              {/* Note Ribbon */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#C99A3D]/20 flex items-center gap-2 text-xs text-[#7A6B63]">
                <CheckCircle2 className="w-4 h-4 text-[#C99A3D] shrink-0" />
                <span>Teertha Prasada is distributed to all visiting devotees immediately following Mahamangalarathi.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
