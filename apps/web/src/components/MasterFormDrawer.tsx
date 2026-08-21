import React from 'react';
import { X } from 'lucide-react';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'textarea' | 'checkbox' | 'image' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  allowCustomText?: boolean;
}

interface MasterFormDrawerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  fields: FieldConfig[];
  formData: any;
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export const MasterFormDrawer: React.FC<MasterFormDrawerProps> = ({
  title,
  isOpen,
  onClose,
  fields,
  formData,
  onChange,
  onSubmit,
  isSubmitting
}) => {
  if (!isOpen) return null;

  const handleImageFile = (file: File, fieldName: string) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        onChange(fieldName, compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-ink/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-ivory-light h-full shadow-2xl flex flex-col border-l border-turmeric/30 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-ivory-dark flex items-center justify-between bg-ivory">
          <h3 className="font-display text-xl font-bold text-kumkum">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-ivory-dark/60 text-textInk/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textInk/80 flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-kumkum">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={formData[field.name] ?? ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/50"
                />
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  value={formData[field.name] ? String(formData[field.name]).split('T')[0] : ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/50 font-medium text-textInk"
                />
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={!!formData[field.name]}
                    onChange={(e) => onChange(field.name, e.target.checked)}
                    className="w-4 h-4 rounded text-kumkum focus:ring-turmeric/50"
                  />
                  <span className="text-sm font-medium text-textInk">Active</span>
                </label>
              ) : field.type === 'image' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-kumkum/10 text-kumkum hover:bg-kumkum/20 border border-kumkum/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                      📁 Choose Image File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFile(file, field.name);
                        }}
                      />
                    </label>
                    <span className="text-[10px] text-textInk/50">Auto-compressed max 800px</span>
                  </div>

                  <input
                    type="text"
                    value={formData[field.name] ?? ''}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder || "Paste image URL or choose file above..."}
                    className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/50 font-mono text-xs"
                  />

                  {formData[field.name] && (
                    <div className="relative inline-block mt-1">
                      <img
                        src={formData[field.name]}
                        alt="Preview"
                        className="w-24 h-20 object-cover rounded-lg border border-turmeric/40 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => onChange(field.name, '')}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-[10px] font-bold hover:bg-red-700 shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ) : field.type === 'select' ? (
                <div className="space-y-1.5">
                  <select
                    value={
                      field.options?.some((o) => o.value === formData[field.name])
                        ? formData[field.name]
                        : field.allowCustomText && formData[field.name]
                        ? 'CUSTOM'
                        : formData[field.name] || (field.options?.[0]?.value ?? '')
                    }
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        onChange(field.name, formData[field.name] && !field.options?.some(o => o.value === formData[field.name]) ? formData[field.name] : '');
                      } else {
                        onChange(field.name, e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/50 font-semibold text-textInk"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                    {field.allowCustomText && (
                      <option value="CUSTOM">✏️ Custom Category (Type your own)...</option>
                    )}
                  </select>

                  {(field.allowCustomText &&
                    (!field.options?.some((o) => o.value === formData[field.name]) ||
                      formData[field.name] === '')) && (
                    <input
                      type="text"
                      value={formData[field.name] ?? ''}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      placeholder="Type custom category name (e.g. Rathotsava)..."
                      className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/50 mt-1"
                    />
                  )}
                </div>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] ?? ''}
                  onChange={(e) =>
                    onChange(
                      field.name,
                      field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                    )
                  }
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/50"
                />
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="pt-6 border-t border-ivory-dark flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-textInk/70 hover:bg-ivory-dark/40 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-semibold bg-kumkum hover:bg-kumkum-light text-ivory rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {isSubmitting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-ivory border-t-transparent" />}
              Save Master Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
