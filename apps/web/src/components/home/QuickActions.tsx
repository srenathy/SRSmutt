import React from 'react';
import { Clock, Flower2, Calendar, MapPin, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onSelectTab?: (tabId: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectTab }) => {
  const actions = [
    {
      title: 'Darshan Timings',
      subtitle: '7:00 AM – 12:30 PM & 5:30 PM – 8:30 PM',
      icon: Clock,
      id: 'schedule',
      cta: 'View Schedule',
      badge: 'Daily'
    },
    {
      title: 'Book / Sponsor Seva',
      subtitle: 'Archana, Panchamrutha & Nitya Sevas',
      icon: Flower2,
      id: 'sevas',
      cta: 'Explore Sevas',
      badge: 'Offerings'
    },
    {
      title: 'Upcoming Events',
      subtitle: 'Aradhana Mahotsava & Special Utsavas',
      icon: Calendar,
      id: 'events',
      cta: 'View News',
      badge: 'Calendar'
    },
    {
      title: 'Contact & Directions',
      subtitle: '542, 63rd Cross, 5th Block, Rajajinagar',
      icon: MapPin,
      id: 'contact',
      cta: 'Get Location',
      badge: 'Bengaluru'
    }
  ];

  const handleClick = (e: React.MouseEvent, id: string) => {
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
    <section className="py-6 sm:py-8 bg-[#FAF6EE]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={(e) => handleClick(e, act.id)}
                className="group text-left bg-white p-5 rounded-2xl border border-turmeric/20 shadow-xs hover:shadow-md hover:border-[#8C2F22]/40 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between cursor-pointer w-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] border border-turmeric/30 flex items-center justify-center text-[#8C2F22] group-hover:bg-[#8C2F22] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C99A3D] bg-[#C99A3D]/10 px-2 py-0.5 rounded-md font-mono">
                      {act.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-[#2C221E] text-base group-hover:text-[#8C2F22] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-[#5C4D44] mt-1 line-clamp-2 leading-relaxed">
                    {act.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-turmeric/10 flex items-center justify-between text-xs font-bold text-[#8C2F22] w-full">
                  <span>{act.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
