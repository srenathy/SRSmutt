import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, History, ChevronDown, Check } from 'lucide-react';

const PREDEFINED_DRAVYA_SUGGESTIONS = [
  'Rice (Akki) Bag - 25kg',
  'Rice (Akki) Sona Masoori - 50kg',
  'Toor Dal (Togari Bele) - 10kg',
  'Toor Dal (Togari Bele) - 25kg',
  'Pure Cow Ghee (Tuppa) - 5L',
  'Pure Cow Ghee (Tuppa) - 15kg Tin',
  'Sugar (Sakkare) - 10kg',
  'Sugar (Sakkare) - 50kg Bag',
  'Sunflower Cooking Oil - 15L Tin',
  'Groundnut Cooking Oil - 15L Tin',
  'Jaggery (Bella) - 5kg',
  'Jaggery (Bella) - 10kg Block',
  'Coconut (Tenginakai) - 50 Nos',
  'Coconut (Tenginakai) - 100 Nos',
  'Camphor (Karpura) & Agarbatti Box',
  'Pooja Dravya / Panchamrutha Samagri Set',
  'Silk Vastram / Dhoti Offering (Shalu)',
  'Silver Pooja Vessel / Plate (Belli Samagri)',
  'Fresh Flowers & Seva Garland Offering',
  'Cow Milk (Haalu) / Curd Offering - 10L',
  'Dry Fruits (Cashew, Badam, Raisins) Box',
  'Cardamom (Yelakki) & Clove (Lavanga) Pack',
  'Kesar (Saffron) & Turmeric (Arasina) Box',
  'Annadana Grocery / Anna Prasada Dravya',
  'Special Utsava Contribution / Alankara Dravya'
];

const STORAGE_KEY = 'temple_line_item_descriptions_cache';

export function saveLineItemDescriptionToCache(desc: string) {
  if (!desc || desc.trim().length < 2) return;
  try {
    const clean = desc.trim();
    const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 50); // Keep latest 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to cache line item description:', err);
  }
}

function fuzzyMatch(input: string, target: string): boolean {
  if (!input || input.trim() === '') return true;
  const cleanInput = input.toLowerCase().trim();
  const cleanTarget = target.toLowerCase().trim();
  if (cleanTarget.includes(cleanInput)) return true;

  // Substring sequential match
  let inputIdx = 0;
  for (let i = 0; i < cleanTarget.length && inputIdx < cleanInput.length; i++) {
    if (cleanTarget[i] === cleanInput[inputIdx]) {
      inputIdx++;
    }
  }
  return inputIdx === cleanInput.length;
}

interface DescriptionAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const DescriptionAutocomplete: React.FC<DescriptionAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Type item description or select common offering...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cachedHistory, setCachedHistory] = useState<string[]>([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load cached suggestions on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCachedHistory(JSON.parse(stored));
      }
    } catch {
      setCachedHistory([]);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combine and deduplicate history + predefined
  const allSuggestions = Array.from(
    new Set([...cachedHistory, ...PREDEFINED_DRAVYA_SUGGESTIONS])
  );

  const trimmed = value.trim();
  const filteredSuggestions = allSuggestions.filter((item) => fuzzyMatch(trimmed, item));

  const handleSelect = (item: string) => {
    onChange(item);
    saveLineItemDescriptionToCache(item);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightIdx >= 0 && highlightIdx < filteredSuggestions.length) {
        e.preventDefault();
        handleSelect(filteredSuggestions[highlightIdx]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightIdx(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-2.5 py-1.5 border border-turmeric/30 rounded-lg text-xs bg-white text-textInk focus:outline-none focus:ring-2 focus:ring-kumkum/30 pr-6 ${className}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1.5 text-textInk/40 hover:text-kumkum transition p-0.5"
          title="Show Suggestions"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-turmeric/40 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-turmeric/10 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 bg-ivory/80 text-[10px] font-bold text-textInk/70 uppercase tracking-wider flex items-center justify-between border-b border-turmeric/20">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-kumkum" /> Suggestions (Fuzzy Search)
            </span>
            <span className="text-[9px] text-textInk/50 font-normal">Click or press Enter</span>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="p-3 text-xs text-textInk/50 text-center italic">
              No matching suggestions. Continue typing your custom description.
            </div>
          ) : (
            filteredSuggestions.map((item, idx) => {
              const isRecent = cachedHistory.includes(item);
              const isSelected = item.toLowerCase().trim() === value.toLowerCase().trim();
              const isHighlighted = idx === highlightIdx;

              return (
                <button
                  key={item + idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isHighlighted || isSelected
                      ? 'bg-kumkum/10 text-kumkum font-bold'
                      : 'text-textInk font-medium hover:bg-ivory'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    {isRecent ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                        <History className="w-2.5 h-2.5" /> Recent
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                        Standard
                      </span>
                    )}
                    <span className="truncate">{item}</span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-kumkum shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
