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
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C221E] flex flex-col font-sans selection:bg-[#C99A3D] selection:text-white">
      {/* 1. Sticky Accessible Header */}
      <Header />

      {/* 2. Devotional Hero Section */}
      <HeroSection announcements={announcements} />

      {/* 3. Quick Action Cards */}
      <ScrollReveal delay={100}>
        <QuickActions />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2" />

      {/* 4. Today's Darshan & Pooja Schedule + Dynamic Status + Countdown */}
      <ScrollReveal delay={100}>
        <ScheduleSection />
      </ScrollReveal>

      {/* 5. About the Sannidhana & Sacred Lineage */}
      <ScrollReveal delay={100}>
        <AboutSection />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2" />

      {/* 6. Sevas & Devotional Offerings */}
      <ScrollReveal delay={100}>
        <SevaSection sevas={sevas} loading={loading} />
      </ScrollReveal>

      {/* 7. Upcoming Events & Aradhana Celebrations */}
      <ScrollReveal delay={100}>
        <EventsSection announcements={announcements} loading={loading} />
      </ScrollReveal>

      <GopuramDivider variant="gold" className="my-2" />

      {/* 8. Sacred Photo Gallery Carousel */}
      <ScrollReveal delay={100}>
        <GalleryCarousel />
      </ScrollReveal>

      {/* 9. Visit the Matha / Location & Contact */}
      <ScrollReveal delay={100}>
        <VisitSection />
      </ScrollReveal>

      {/* 10. Dignified Footer */}
      <Footer />
    </div>
  );
};
