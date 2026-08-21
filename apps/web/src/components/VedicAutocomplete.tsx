import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface VedicAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  minChars?: number;
  required?: boolean;
}

/**
 * Fuzzy / Substring match score for searching Gotra, Nakshatra, Rashi
 */
function fuzzyMatch(input: string, target: string): boolean {
  if (!input || input.trim() === '') return true;
  const cleanInput = input.toLowerCase().trim();
  const cleanTarget = target.toLowerCase().trim();
  if (cleanTarget.includes(cleanInput)) return true;

  // Substring / sequential character matching
  let inputIdx = 0;
  for (let i = 0; i < cleanTarget.length && inputIdx < cleanInput.length; i++) {
    if (cleanTarget[i] === cleanInput[inputIdx]) {
      inputIdx++;
    }
  }
  return inputIdx === cleanInput.length;
}

export const VedicAutocomplete: React.FC<VedicAutocompleteProps> = ({
  label,
  placeholder = 'Search or select...',
  value,
  onChange,
  options = [],
  minChars = 0,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleSelectOption = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
  };

  // Filter options based on any search input (no 3-letter restriction)
  const trimmed = inputValue.trim();
  const filteredOptions = trimmed.length >= minChars
    ? options.filter((opt) => fuzzyMatch(trimmed, opt))
    : options;

  const showDropdown = isOpen;

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-semibold text-textInk mb-1">
        {label} {required && <span className="text-red-600 font-bold">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 bg-white pr-8 text-textInk font-medium"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textInk/40 hover:text-textInk transition"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-turmeric/30 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-turmeric/10">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-xs text-textInk/50 text-center italic">
              No matching {label.toLowerCase()} found. You can keep typing custom text.
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`w-full text-left px-3.5 py-2 text-xs hover:bg-ivory flex items-center justify-between transition-colors ${
                  inputValue.toLowerCase().trim() === opt.toLowerCase().trim()
                    ? 'bg-kumkum/10 font-bold text-kumkum'
                    : 'text-textInk font-medium'
                }`}
              >
                <span>{opt}</span>
                {inputValue.toLowerCase().trim() === opt.toLowerCase().trim() && (
                  <Check className="w-3.5 h-3.5 text-kumkum" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
