import React from 'react';
import { Sparkles, Award, BookOpen, Utensils } from 'lucide-react';
import { TempleArchMotif, LotusIcon } from './SpiritualDecorations';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-12 sm:py-16 bg-white border-b border-turmeric/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8C2F22]">
            <LotusIcon size={16} color="#8C2F22" />
            <span>SPIRITUAL HERITAGE &amp; LINEAGE</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E]">
            About the Sannidhana
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44]">
            A sacred haven of devotion, Haridasa tradition, and Dwaitha Vedanta worship in the heart of Rajajinagar, Bengaluru.
          </p>
          <TempleArchMotif className="opacity-80" />
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Descriptive Content & Key Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-xs sm:text-sm text-[#4A3B32] leading-relaxed">
              <p>
                The Rajajinagar branch of <strong>Mulabagala Sri Sripadaraja Matha</strong> houses the sanctified <strong>Mrittika Brindavana of Sri Raghavendra Swamy</strong>, established under the divine guidance and pontifical authority of the Matha. Devotees from all over Bengaluru visit this holy Sannidhana for daily worship, Sevas, and spiritual solace.
              </p>
              <p>
                Under the holy tradition of <strong>Jagadguru Sri Madhvacharya</strong> and <strong>Sri Sripadaraja Swamiji</strong> (the father of Haridasa Sahitya and revered Dwaitha saint), daily rituals including Panchamrutha Abhisheka, Hastodaka, Mahamangalarathi, and Teertha Prasada are conducted with utmost Vedic precision and devotion.
              </p>
            </div>

            {/* 3 Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#FAF6EE] p-5 rounded-2xl border border-turmeric/20 space-y-2 shadow-2xs">
                <div className="text-2xl">🛕</div>
                <h3 className="font-display font-bold text-[#6B1616] text-sm">Sacred Mrittika Brindavana</h3>
                <p className="text-xs text-[#5C4D44] leading-relaxed">
                  Consecrated Mrittika brought from Mantralayam Kshetra, bestowing divine blessings.
                </p>
              </div>

              <div className="bg-[#FAF6EE] p-5 rounded-2xl border border-turmeric/20 space-y-2 shadow-2xs">
                <div className="text-2xl">📜</div>
                <h3 className="font-display font-bold text-[#6B1616] text-sm">Sri Sripadaraja Lineage</h3>
                <p className="text-xs text-[#5C4D44] leading-relaxed">
                  Preserving Dwaitha Vedanta, Haridasa Sahitya, and authentic Madhwa pooja vidhi.
                </p>
              </div>

              <div className="bg-[#FAF6EE] p-5 rounded-2xl border border-turmeric/20 space-y-2 shadow-2xs">
                <div className="text-2xl">🍚</div>
                <h3 className="font-display font-bold text-[#6B1616] text-sm">Nitya Teertha Prasada</h3>
                <p className="text-xs text-[#5C4D44] leading-relaxed">
                  Daily sanctified meal distribution (Annadana) served to visiting pilgrims after afternoon Mahamangalarathi.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Brindavana Photograph & Alankara Display */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#FAF6EE] p-3 rounded-3xl border border-turmeric/30 shadow-md">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-black/90 group">
                <img
                  src="/gallery/brindavana-2.jpg"
                  alt="Sri Raghavendra Swamy — Pushpa Alankara Darshana"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-[10px] font-bold text-[#FCD34D] uppercase tracking-wider">
                    Pushpa Alankara Darshana
                  </span>
                  <p className="font-display font-bold text-white text-base leading-snug">
                    Sri Raghavendra Swamy Brindavana
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
