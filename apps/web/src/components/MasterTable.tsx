import React from 'react';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';

export interface ColumnConfig<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface MasterTableProps<T> {
  title: string;
  description?: string;
  columns: ColumnConfig<T>[];
  data: T[];
  isLoading?: boolean;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  canEdit?: boolean;
}

export function MasterTable<T extends { id: string }>({
  title,
  description,
  columns,
  data,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
  canEdit = true
}: MasterTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 border-b border-ivory-dark/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ivory-light/40">
        <div>
          <h2 className="font-display text-xl font-bold text-kumkum">{title}</h2>
          {description && <p className="text-xs text-textInk/60 mt-1">{description}</p>}
        </div>

        <div className="flex items-center gap-3">
          {onSearchChange !== undefined && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textInk/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/50 w-48 sm:w-64"
              />
            </div>
          )}

          {canEdit && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 bg-kumkum hover:bg-kumkum-light text-ivory font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ivory/50 text-xs font-semibold text-textInk/70 uppercase tracking-wider border-b border-ivory-dark">
              {columns.map((col) => (
                <th key={col.key} className="py-3 px-6">
                  {col.header}
                </th>
              ))}
              {canEdit && (onEdit || onDelete) && (
                <th className="py-3 px-6 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-dark/40 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (canEdit ? 1 : 0)} className="py-12 text-center text-textInk/50">
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-turmeric border-t-transparent"></div>
                    Loading master records...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (canEdit ? 1 : 0)} className="py-12 text-center text-textInk/50">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-ivory/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="py-4 px-6">
                      {col.render ? col.render(item) : (item as any)[col.key] ?? '-'}
                    </td>
                  ))}
                  {canEdit && (onEdit || onDelete) && (
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-textInk/60 hover:text-kumkum hover:bg-kumkum/10 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-1.5 rounded-lg text-textInk/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
