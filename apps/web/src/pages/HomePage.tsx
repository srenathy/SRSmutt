import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { Header } from '../components/home/Header.js';
import { HeroSection } from '../components/home/HeroSection.js';
import { QuickActions } from '../components/home/QuickActions.js';
import { ScheduleSection } from '../components/home/ScheduleSection.js';
import { AboutSection } from '../components/home/AboutSection.js';
import { EventsSection } from '../components/home/EventsSection.js';
import { SevaSection } from '../components/home/SevaSection.js';
import { GalleryCarousel } from '../components/home/GalleryCarousel.js';
import { VisitSection } from '../components/home/VisitSection.js';
import { Footer } from '../components/home/Footer.js';
import { ScrollReveal } from '../components/home/ScrollReveal.js';
import { GopuramDivider } from '../components/GopuramMotif.js';
import { SidePageNavigator } from '../components/home/SidePageNavigator.js';

interface Announcement {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface Seva {
  id: string;
  name: string;
  code: string;
  amount: number;
  description?: string;
  active?: boolean;
}

export const HomePage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sevas, setSevas] = useState<Seva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [annRes, sevaRes] = await Promise.all([
          apiClient.get('/announcements/public'),
          apiClient.get('/sevas')
        ]);
        if (isMounted) {
          setAnnouncements(annRes.data.data || []);
          const rawSevas = sevaRes.data.data || sevaRes.data || [];
          setSevas(Array.isArray(rawSevas) ? rawSevas.filter((s: Seva) => s.active !== false) : []);
        }
      } catch (err) {
        console.error('Failed to fetch public homepage data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E] flex flex-col font-sans selection:bg-[#C99A3D] selection:text-white relative">
      {/* 1. Header with Full Width Alignment & Right-Corner Logo */}
      <Header />

      {/* Floating Side Page Navigator with Up/Down and Section Dots */}
      <SidePageNavigator />

      {/* 2. Hero Section with Live Countdown & Consecrated Brindavana Visual */}
      <HeroSection announcements={announcements} />

      {/* 3. Quick Action Cards */}
      <ScrollReveal delay={50}>
        <QuickActions />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2 opacity-80" />

      {/* 4. Today's Darshan & Pooja Schedule + Dynamic Status + Countdown */}
      <ScrollReveal delay={50}>
        <ScheduleSection />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2 opacity-80" />

      {/* 5. About the Sannidhana & Sacred Lineage */}
      <ScrollReveal delay={50}>
        <AboutSection />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2 opacity-80" />

      {/* 6. Sevas & Devotional Offerings */}
      <ScrollReveal delay={50}>
        <SevaSection sevas={sevas} loading={loading} />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2 opacity-80" />

      {/* 7. Upcoming Events & Aradhana Celebrations */}
      <ScrollReveal delay={50}>
        <EventsSection announcements={announcements} loading={loading} />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2 opacity-80" />

      {/* 8. Sacred Photo Gallery Carousel */}
      <ScrollReveal delay={50}>
        <GalleryCarousel />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2 opacity-80" />

      {/* 9. Visit the Matha / Location & Contact */}
      <ScrollReveal delay={50}>
        <VisitSection />
      </ScrollReveal>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
};
