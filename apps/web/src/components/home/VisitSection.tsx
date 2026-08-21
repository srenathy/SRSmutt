import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Sparkles, CheckCircle2, Navigation } from 'lucide-react';
import { TempleArchMotif, LotusIcon } from './SpiritualDecorations';

export const VisitSection: React.FC = () => {
  const mapUrl = "https://maps.google.com/?q=Mulabagala+Sri+Sripadaraja+Matha+Rajajinagar+Bengaluru";

  return (
    <section id="contact" className="py-12 sm:py-16 bg-white border-b border-turmeric/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8C2F22]">
            <MapPin className="w-4 h-4 text-[#8C2F22]" />
            <span>PILGRIMAGE &amp; CONTACT</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E]">
            Visit Our Sannidhana
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44]">
            Plan your visit to Sri Raghavendra Swamy Brindavana Sannidhana at Rajajinagar, Bengaluru.
          </p>
          <TempleArchMotif className="opacity-80" />
        </div>

        {/* Location & Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Address & Timings Card */}
          <div className="lg:col-span-7 bg-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-turmeric/30 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#8C2F22] border border-turmeric/30 flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#2C221E]">
                    Branch Location &amp; Address
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A3B32] leading-relaxed">
                    <strong>Mulabagala Sri Sripadaraja Matha</strong><br />
                    Shri Raghavendra Swamy Brindavana Sannidhana<br />
                    No.542, 63rd Cross, 5th Block, Near Bhashyam Circle,<br />
                    Rajajinagar, Bengaluru, Karnataka — 560010
                  </p>
                </div>
              </div>

              {/* Phone & Contact */}
              <div className="border-t border-turmeric/20 pt-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#8C2F22] border border-turmeric/30 flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#2C221E]">
                    Temple Office &amp; Seva Enquiry
                  </h3>
                  <p className="text-xs text-[#5C4D44]">
                    For Seva booking inquiries, special sankalpa, or Teertha Prasada coordination:
                  </p>
                  <a
                    href="tel:+918904674124"
                    className="inline-block text-sm sm:text-base font-bold font-mono text-[#8C2F22] hover:text-[#6E2217] transition-colors mt-0.5"
                  >
                    +91 89046 74124
                  </a>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="border-t border-turmeric/20 pt-4 flex flex-wrap items-center gap-3">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#8C2F22] hover:bg-[#6E2217] transition-all shadow-xs flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions (Google Maps)</span>
              </a>

              <a
                href="tel:+918904674124"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#8C2F22] bg-white border border-[#8C2F22]/30 hover:bg-[#8C2F22]/5 transition-all shadow-xs flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Counter</span>
              </a>
            </div>
          </div>

          {/* Sannidhana Facilities Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-turmeric/30 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-turmeric/20 pb-3">
                <Sparkles className="w-5 h-5 text-[#8C2F22]" />
                <h3 className="font-display font-bold text-lg text-[#2C221E]">
                  Branch Facilities
                </h3>
              </div>

              <ul className="space-y-3.5 text-xs text-[#4A3B32]">
                <li className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6EE]/60 border border-turmeric/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2C221E] block font-bold">Daily Pooja &amp; Sevas</strong>
                    <span>Daily Archana, Panchamrutha Abhisheka, Hastodaka, and Special Alankara.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6EE]/60 border border-turmeric/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2C221E] block font-bold">Nitya Teertha Prasada</strong>
                    <span>Daily sanctified meal distribution (Annadana) served after afternoon Mahamangalarathi (12:30 PM).</span>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6EE]/60 border border-turmeric/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2C221E] block font-bold">Shrardh &amp; Samskara Facility</strong>
                    <span>Traditional ancestral ritual facility conducted with authentic Madhwa Vedic vidhi.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-turmeric/20 text-[11px] text-[#7A6B63]">
              <span className="font-bold text-[#8C2F22] block mb-0.5">Note for Devotees:</span>
              Traditional dress code is encouraged inside the Brindavana sanctum.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
