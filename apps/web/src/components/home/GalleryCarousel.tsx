import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react';
import { TempleArchMotif, DiyaIcon } from './SpiritualDecorations';

const GALLERY_PHOTOS = [
  {
    src: '/gallery/brindavana-1.jpg',
    title: 'Sri Raghavendra Swamy — Alankara Darshana',
    subtitle: 'Daily morning consecrated Alankara at Rajajinagar Sannidhana'
  },
  {
    src: '/gallery/brindavana-2.jpg',
    title: 'Sri Raghavendra Swamy — Pushpa Alankara',
    subtitle: 'Sacred floral decoration during special festival celebrations'
  },
  {
    src: '/gallery/brindavana-3.jpg',
    title: 'Sri Raghavendra Swamy — Vastra Alankara',
    subtitle: 'Traditional silk vastra offering and golden sanctum view'
  },
  {
    src: '/gallery/brindavana-4.jpg',
    title: 'Sri Raghavendra Matha — Rajajinagar Sannidhana',
    subtitle: 'Consecrated Mrittika Brindavana sanctum sanctorum'
  }
];

export const GalleryCarousel: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-play with pause on hover
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % GALLERY_PHOTOS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % GALLERY_PHOTOS.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <section id="gallery" className="py-12 sm:py-16 bg-[#FAF6EE] border-b border-turmeric/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8C2F22]">
            <Sparkles className="w-4 h-4 text-[#8C2F22]" />
            <span>SACRED GLIMPSES &amp; ALANKARA</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E]">
            Photo Gallery — Sri Raghavendra Brindavana
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44]">
            Daily holy darshanam, sacred alankaras, and sanctum glimpses from our Rajajinagar branch.
          </p>
          <TempleArchMotif className="opacity-80" />
        </div>

        {/* Main Carousel Container */}
        <div
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-[#C99A3D]/40 bg-black group focus:outline-none focus:ring-2 focus:ring-[#8C2F22]"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Visual Image Viewport */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
            {GALLERY_PHOTOS.map((photo, idx) => (
              <div
                key={photo.src}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-contain sm:object-cover object-center bg-black"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Gradient and Title Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-[#FCD34D] mb-1.5">
                    <DiyaIcon size={16} color="#FCD34D" />
                    <span className="text-[11px] font-bold uppercase tracking-wider font-sans">
                      Rajajinagar Sannidhana
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-white text-lg sm:text-2xl drop-shadow-md leading-tight">
                    {photo.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#EFE3CE]/80 mt-1 max-w-xl">
                    {photo.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#8C2F22] flex items-center justify-center shadow-lg transition-all border border-turmeric/30 opacity-80 group-hover:opacity-100 hover:scale-105"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#8C2F22] flex items-center justify-center shadow-lg transition-all border border-turmeric/30 opacity-80 group-hover:opacity-100 hover:scale-105"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Thumbnail Selector Bar & Indicators */}
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="grid grid-cols-4 gap-3 w-full max-w-xl">
            {GALLERY_PHOTOS.map((photo, idx) => (
              <button
                key={photo.src}
                onClick={() => setActiveIdx(idx)}
                className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all ${
                  idx === activeIdx
                    ? 'border-[#8C2F22] shadow-md scale-105 ring-2 ring-[#C99A3D]/40'
                    : 'border-turmeric/30 opacity-60 hover:opacity-100'
                }`}
                aria-label={`View ${photo.title}`}
              >
                <img
                  src={photo.src}
                  alt=""
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {GALLERY_PHOTOS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === activeIdx
                    ? 'w-8 h-2.5 bg-[#8C2F22] shadow-xs'
                    : 'w-2.5 h-2.5 bg-[#C99A3D]/40 hover:bg-[#C99A3D]/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
