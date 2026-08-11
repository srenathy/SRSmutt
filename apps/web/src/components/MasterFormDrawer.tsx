import React from 'react';
import { X } from 'lucide-react';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
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
