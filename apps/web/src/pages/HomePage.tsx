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
import { ChevronLeft, ChevronRight, Layers, LayoutGrid } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<string>('schedule');
  const [viewMode, setViewMode] = useState<'tiles' | 'all'>('tiles');

  const tabs = [
    { id: 'about', label: 'About Sannidhana', icon: '🏛️' },
    { id: 'schedule', label: 'Darshan & Pooja', icon: '⏰' },
    { id: 'sevas', label: 'Sevas & Offerings', icon: '🌸' },
    { id: 'events', label: 'Events & News', icon: '🚩' },
    { id: 'gallery', label: 'Photo Gallery', icon: '📸' },
    { id: 'contact', label: 'Location & Contact', icon: '📍' },
  ];

  const currentTabIdx = tabs.findIndex((t) => t.id === activeTab);

  const handleNextTab = () => {
    const nextIdx = (currentTabIdx + 1) % tabs.length;
    setActiveTab(tabs[nextIdx].id);
  };

  const handlePrevTab = () => {
    const prevIdx = (currentTabIdx - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[prevIdx].id);
  };

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
      {/* 1. Header with Full Width Alignment & Right-Corner Logo */}
      <Header activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} />

      {/* 2. Hero Section */}
      <HeroSection
        announcements={announcements}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />

      {/* 3. Quick Action Cards */}
      <ScrollReveal delay={100}>
        <QuickActions onSelectTab={(tabId) => setActiveTab(tabId)} />
      </ScrollReveal>

      {/* 4. Interactive Section Controller / Module Switcher */}
      <div id="main-content-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
        <div className="bg-white rounded-3xl p-3 sm:p-4 border border-[#C99A3D]/30 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Module Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#8C2F22] text-white shadow-xs scale-102'
                      : 'bg-[#FAF6EE] text-[#5C4D44] hover:bg-[#F3EAD8] hover:text-[#8C2F22] border border-turmeric/20'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle & Next/Prev Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === 'tiles' && (
              <div className="flex items-center gap-1 bg-[#FAF6EE] px-2 py-1 rounded-xl border border-turmeric/20">
                <button
                  onClick={handlePrevTab}
                  className="p-1 rounded-lg hover:bg-white text-[#8C2F22] transition shadow-2xs"
                  title="Previous Section"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-bold text-[#63534B] px-1.5">
                  {currentTabIdx + 1} / {tabs.length}
                </span>
                <button
                  onClick={handleNextTab}
                  className="p-1 rounded-lg hover:bg-white text-[#8C2F22] transition shadow-2xs"
                  title="Next Section"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => setViewMode(viewMode === 'tiles' ? 'all' : 'tiles')}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#8C2F22] bg-[#FAF6EE] hover:bg-[#F3EAD8] border border-turmeric/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              {viewMode === 'tiles' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Show All Sections</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Interactive Tile Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <GopuramDivider variant="gold" className="my-1 opacity-70" />

      {/* 5. Animated Interactive Tile Mode OR Continuous Page Scroll View */}
      {viewMode === 'tiles' ? (
        <main className="w-full transition-all duration-300">
          <div key={activeTab} className="animate-fadeIn">
            {activeTab === 'about' && <AboutSection />}
            {activeTab === 'schedule' && <ScheduleSection />}
            {activeTab === 'sevas' && <SevaSection sevas={sevas} loading={loading} />}
            {activeTab === 'events' && <EventsSection announcements={announcements} loading={loading} />}
            {activeTab === 'gallery' && <GalleryCarousel />}
            {activeTab === 'contact' && <VisitSection />}
          </div>

          {/* Bottom Page Navigation Bar for Tile Mode */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between text-xs text-[#63534B]">
            <button
              onClick={handlePrevTab}
              className="px-4 py-2 rounded-xl bg-white border border-turmeric/30 font-bold text-[#8C2F22] hover:bg-[#FAF6EE] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Section</span>
            </button>

            <span className="font-display font-semibold text-[#8C2F22]">
              Section: {tabs[currentTabIdx]?.label} ({currentTabIdx + 1} of {tabs.length})
            </span>

            <button
              onClick={handleNextTab}
              className="px-4 py-2 rounded-xl bg-[#8C2F22] font-bold text-white hover:bg-[#6E2217] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Next Section</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      ) : (
        <main className="space-y-4">
          <AboutSection />
          <GopuramDivider variant="gold" className="my-2" />
          <ScheduleSection />
          <GopuramDivider variant="gold" className="my-2" />
          <SevaSection sevas={sevas} loading={loading} />
          <GopuramDivider variant="gold" className="my-2" />
          <EventsSection announcements={announcements} loading={loading} />
          <GopuramDivider variant="gold" className="my-2" />
          <GalleryCarousel />
          <GopuramDivider variant="gold" className="my-2" />
          <VisitSection />
        </main>
      )}

      {/* 6. Footer */}
      <Footer />
    </div>
  );
};
