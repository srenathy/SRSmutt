import React, { useState, useEffect } from 'react';
import { MasterTable, ColumnConfig } from '../components/MasterTable.js';
import { MasterFormDrawer, FieldConfig } from '../components/MasterFormDrawer.js';
import { apiClient } from '../api/client.js';

type Tab = 'sevas' | 'shashwata' | 'departments' | 'gotras' | 'nakshatras' | 'rashis' | 'announcements' | 'gallery';

export const MastersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('sevas');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchTabContent = async (tab: Tab) => {
    setLoading(true);
    try {
      if (tab === 'sevas') {
        const res = await apiClient.get('/sevas');
        setData(res.data.data || []);
      } else if (tab === 'shashwata') {
        const res = await apiClient.get('/shashwata-sevas');
        setData(res.data.data || []);
      } else if (tab === 'departments') {
        const res = await apiClient.get('/department-budgets');
        setData(res.data.data || []);
      } else if (tab === 'gotras') {
        const res = await apiClient.get('/vedic/gotras');
        setData(res.data.data || []);
      } else if (tab === 'nakshatras') {
        const res = await apiClient.get('/vedic/nakshatras');
        setData(res.data.data || []);
      } else if (tab === 'rashis') {
        const res = await apiClient.get('/vedic/rashis');
        setData(res.data.data || []);
      } else if (tab === 'announcements') {
        const res = await apiClient.get('/announcements');
        setData(res.data.data || []);
      } else if (tab === 'gallery') {
        const res = await apiClient.get('/gallery');
        setData(res.data.data || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${tab} data:`, err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabContent(activeTab);
  }, [activeTab]);

  const handleOpenDrawer = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        startDate: item.startDate ? new Date(item.startDate).toISOString() : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString() : ''
      });
    } else {
      setEditingItem(null);
      setFormData(
        activeTab === 'shashwata'
          ? { durationYears: 25, active: true }
          : activeTab === 'departments'
          ? { effectiveMonth: new Date().toISOString().slice(0, 7), monthlyCapAmount: 25000, isActive: true }
          : activeTab === 'announcements'
          ? { category: 'EVENT', active: true, startDate: new Date().toISOString(), endDate: '' }
          : activeTab === 'gallery'
          ? { category: 'TEMPLE', order: 0, active: true }
          : { active: true }
      );
    }
    setDrawerOpen(true);
  };

  const handleFormChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { ...formData };
      if (payload.amount !== undefined && payload.amount !== null && payload.amount !== '') {
        payload.amount = Number(payload.amount);
      }
      if (payload.monthlyCapAmount !== undefined && payload.monthlyCapAmount !== null && payload.monthlyCapAmount !== '') {
        payload.monthlyCapAmount = Number(payload.monthlyCapAmount);
      }
      if (payload.durationYears !== undefined && payload.durationYears !== null && payload.durationYears !== '') {
        payload.durationYears = Number(payload.durationYears);
      }
      if (payload.order !== undefined && payload.order !== null && payload.order !== '') {
        payload.order = Number(payload.order);
      }
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;

      if (activeTab === 'sevas') {
        if (editingItem) {
          await apiClient.put(`/sevas/${editingItem.id}`, payload);
        } else {
          await apiClient.post('/sevas', payload);
        }
      } else if (activeTab === 'shashwata') {
        if (editingItem) {
          await apiClient.put(`/shashwata-sevas/${editingItem.id}`, payload);
        } else {
          await apiClient.post('/shashwata-sevas', payload);
        }
      } else if (activeTab === 'departments') {
        await apiClient.post('/department-budgets', payload);
      } else if (activeTab === 'gotras') {
        if (editingItem) {
          await apiClient.put(`/vedic/gotras/${editingItem.id}`, payload);
        } else {
          await apiClient.post('/vedic/gotras', payload);
        }
      } else if (activeTab === 'nakshatras') {
        if (editingItem) {
          await apiClient.put(`/vedic/nakshatras/${editingItem.id}`, payload);
        } else {
          await apiClient.post('/vedic/nakshatras', payload);
        }
      } else if (activeTab === 'rashis') {
        if (editingItem) {
          await apiClient.put(`/vedic/rashis/${editingItem.id}`, payload);
        } else {
          await apiClient.post('/vedic/rashis', payload);
        }
      } else if (activeTab === 'announcements') {
        if (editingItem) {
          await apiClient.put(`/announcements/${editingItem.id}`, payload);
        } else {
          await apiClient.post('/announcements', payload);
        }
      } else if (activeTab === 'gallery') {
        if (editingItem) {
          await apiClient.put(`/gallery/${editingItem.id}`, payload);
        } else {
          await apiClient.post('/gallery', payload);
        }
      }
      setDrawerOpen(false);
      setEditingItem(null);
      fetchTabContent(activeTab);
    } catch (err: any) {
      let errMsg = 'Failed to save master record';
      if (typeof err.response?.data?.message === 'string') {
        errMsg = err.response.data.message;
      } else if (Array.isArray(err.response?.data)) {
        errMsg = err.response.data.map((e: any) => e.message || `${e.path?.join('.')}: ${e.message}`).join(', ');
      }
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Are you sure you want to delete ${item.departmentName || item.name || item.title || 'this item'}?`)) return;
    try {
      if (activeTab === 'sevas') {
        await apiClient.delete(`/sevas/${item.id}`);
      } else if (activeTab === 'shashwata') {
        await apiClient.delete(`/shashwata-sevas/${item.id}`);
      } else if (activeTab === 'departments') {
        await apiClient.delete(`/department-budgets/${item.id}`);
      } else if (activeTab === 'gotras') {
        await apiClient.delete(`/vedic/gotras/${item.id}`);
      } else if (activeTab === 'nakshatras') {
        await apiClient.delete(`/vedic/nakshatras/${item.id}`);
      } else if (activeTab === 'rashis') {
        await apiClient.delete(`/vedic/rashis/${item.id}`);
      } else if (activeTab === 'announcements') {
        await apiClient.delete(`/announcements/${item.id}`);
      } else if (activeTab === 'gallery') {
        await apiClient.delete(`/gallery/${item.id}`);
      }
      fetchTabContent(activeTab);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const getColumns = (): ColumnConfig<any>[] => {
    if (activeTab === 'sevas') {
      return [
        { key: 'code', header: 'Code' },
        { key: 'name', header: 'Seva Name' },
        {
          key: 'amount',
          header: 'Amount',
          render: (r: any) => `₹${Number(r.amount).toLocaleString('en-IN')}`
        },
        { key: 'description', header: 'Description' },
        {
          key: 'active',
          header: 'Status',
          render: (r: any) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {r.active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          )
        }
      ];
    } else if (activeTab === 'shashwata') {
      return [
        { key: 'code', header: 'Code' },
        { key: 'name', header: 'Shashwata Seva Name' },
        {
          key: 'amount',
          header: 'Amount',
          render: (r: any) => `₹${Number(r.amount).toLocaleString('en-IN')}`
        },
        { key: 'durationYears', header: 'Duration (Yrs)' },
        {
          key: 'active',
          header: 'Status',
          render: (r: any) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {r.active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          )
        }
      ];
    } else if (activeTab === 'departments') {
      return [
        { key: 'departmentName', header: 'Department Name' },
        {
          key: 'monthlyCapAmount',
          header: 'Monthly Cap',
          render: (r: any) => `₹${Number(r.monthlyCapAmount).toLocaleString('en-IN')}`
        },
        { key: 'effectiveMonth', header: 'Effective Month (YYYY-MM)' },
        {
          key: 'isActive',
          header: 'Status',
          render: (r: any) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {r.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          )
        }
      ];
    } else if (activeTab === 'gotras') {
      return [
        { key: 'name', header: 'Gotra Name' },
        { key: 'description', header: 'Lineage / Notes' },
        {
          key: 'active',
          header: 'Status',
          render: (r: any) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {r.active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          )
        }
      ];
    } else if (activeTab === 'nakshatras') {
      return [
        { key: 'name', header: 'Nakshatra Name' },
        { key: 'rulingDeity', header: 'Ruling Deity' },
        {
          key: 'active',
          header: 'Status',
          render: (r: any) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {r.active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          )
        }
      ];
    } else if (activeTab === 'rashis') {
      return [
        { key: 'name', header: 'Rashi Name (Vedic)' },
        { key: 'englishName', header: 'Zodiac Sign (English)' },
        {
          key: 'active',
          header: 'Status',
          render: (r: any) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {r.active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          )
        }
      ];
    } else if (activeTab === 'gallery') {
      return [
        {
          key: 'imageUrl',
          header: 'Image Preview',
          render: (r: any) => (
            <img src={r.imageUrl} alt={r.title} className="w-14 h-11 object-cover rounded-lg border border-turmeric/30 shadow-xs" />
          )
        },
        { key: 'title', header: 'Photo Title' },
        { key: 'caption', header: 'Subtitle / Description' },
        {
          key: 'category',
          header: 'Category',
          render: (r: any) => (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {r.category || 'TEMPLE'}
            </span>
          )
        },
        { key: 'order', header: 'Sequence Order' },
        {
          key: 'active',
          header: 'Status',
          render: (r: any) => (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {r.active ? 'ACTIVE' : 'HIDDEN'}
            </span>
          )
        }
      ];
    } else {
      return [
        { key: 'title', header: 'Event / Announcement Title' },
        {
          key: 'category',
          header: 'Category',
          render: (r: any) => (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {r.category}
            </span>
          )
        },
        {
          key: 'imageUrl',
          header: 'Event Photo',
          render: (r: any) =>
            r.imageUrl ? (
              <img src={r.imageUrl} alt={r.title} className="w-10 h-10 object-cover rounded-lg border border-turmeric/30" />
            ) : (
              <span className="text-textInk/40 italic text-[10px]">No Photo</span>
            )
        },
        {
          key: 'duration',
          header: 'Event Schedule (Auto-Expire)',
          render: (r: any) => {
            const formatDT = (val?: string) => {
              if (!val) return null;
              const d = new Date(val);
              return d.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            };
            const start = formatDT(r.startDate) || 'Immediate';
            const end = formatDT(r.endDate) || 'Ongoing / No Expiry';
            return (
              <div className="text-[11px] font-mono">
                <span className="font-semibold text-textInk">{start}</span>
                <span className="text-textInk/40 mx-1">→</span>
                <span className="font-bold text-kumkum">{end}</span>
              </div>
            );
          }
        },
        { key: 'content', header: 'Content Details' },
        {
          key: 'status',
          header: 'Live Status',
          render: (r: any) => {
            const now = new Date();
            const isPast = r.endDate && new Date(r.endDate) < now;
            const isFuture = r.startDate && new Date(r.startDate) > now;

            if (!r.active) {
              return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">DISABLED</span>;
            }
            if (isPast) {
              return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-300">
                  ⌛ EXPIRED (Hidden)
                </span>
              );
            }
            if (isFuture) {
              return (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  📅 UPCOMING
                </span>
              );
            }
            return (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                🟢 ACTIVE (LIVE)
              </span>
            );
          }
        }
      ];
    }
  };

  const getFormFields = (): FieldConfig[] => {
    if (activeTab === 'sevas') {
      return [
        { name: 'code', label: 'Seva Code', type: 'text', required: true },
        { name: 'name', label: 'Seva Name', type: 'text', required: true },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'active', label: 'Active', type: 'checkbox' }
      ];
    } else if (activeTab === 'shashwata') {
      return [
        { name: 'code', label: 'Seva Code', type: 'text', required: true },
        { name: 'name', label: 'Shashwata Seva Name', type: 'text', required: true },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
        { name: 'durationYears', label: 'Duration (Years)', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'active', label: 'Active', type: 'checkbox' }
      ];
    } else if (activeTab === 'departments') {
      return [
        { name: 'departmentName', label: 'Department Name', type: 'text', required: true, placeholder: 'e.g. Cooking, Flowers, Maintenance' },
        { name: 'monthlyCapAmount', label: 'Monthly Spending Cap (₹)', type: 'number', required: true, placeholder: 'e.g. 40000' },
        { name: 'effectiveMonth', label: 'Effective Month (YYYY-MM)', type: 'text', required: true, placeholder: 'e.g. 2026-08' }
      ];
    } else if (activeTab === 'gotras') {
      return [
        { name: 'name', label: 'Gotra Name', type: 'text', required: true },
        { name: 'description', label: 'Lineage / Rishi Notes', type: 'textarea' },
        { name: 'active', label: 'Active', type: 'checkbox' }
      ];
    } else if (activeTab === 'nakshatras') {
      return [
        { name: 'name', label: 'Nakshatra Name', type: 'text', required: true },
        { name: 'rulingDeity', label: 'Ruling Deity', type: 'text' },
        { name: 'active', label: 'Active', type: 'checkbox' }
      ];
    } else if (activeTab === 'rashis') {
      return [
        { name: 'name', label: 'Rashi Name (e.g. Mesha)', type: 'text', required: true },
        { name: 'englishName', label: 'English Name (e.g. Aries)', type: 'text' },
        { name: 'active', label: 'Active', type: 'checkbox' }
      ];
    } else if (activeTab === 'gallery') {
      return [
        { name: 'title', label: 'Photo Title', type: 'text', required: true, placeholder: 'e.g. Sri Raghavendra Swamy — Sacred Alankara Darshana' },
        { name: 'caption', label: 'Subtitle / Description (Shown on Homepage Hero & Gallery)', type: 'textarea', placeholder: 'e.g. Consecrated Mantralaya Mrittika Brindavana - Main Shrine, Rajajinagar' },
        { name: 'imageUrl', label: 'Upload Photo File or Paste Image URL', type: 'image', required: true },
        {
          name: 'category',
          label: 'Display Placement / Category',
          type: 'select',
          required: true,
          allowCustomText: true,
          options: [
            { label: '🌟 HERO_BANNER (Main Homepage Hero Shrine Carousel)', value: 'HERO_BANNER' },
            { label: '🛕 TEMPLE (Brindavana & Sanctum)', value: 'TEMPLE' },
            { label: '🌸 ALANKARA (Daily & Special Alankara)', value: 'ALANKARA' },
            { label: '🚩 UTSAVA (Rathotsava & Festivals)', value: 'UTSAVA' },
            { label: '🕉️ POOJA (Rituals & Sevas)', value: 'POOJA' }
          ]
        },
        { name: 'order', label: 'Display Sequence Order (0, 1, 2, 3...)', type: 'number' },
        { name: 'active', label: 'Visible on Homepage (Hero & Gallery Carousel)', type: 'checkbox' }
      ];
    } else {
      return [
        { name: 'title', label: 'Event / Announcement Title', type: 'text', required: true },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          allowCustomText: true,
          options: [
            { label: '🚩 EVENT (Temple Event / Celebration)', value: 'EVENT' },
            { label: '📢 ANNOUNCEMENT (General Notice)', value: 'ANNOUNCEMENT' },
            { label: '🛕 UTSAVA (Temple Festival / Rathotsava)', value: 'UTSAVA' },
            { label: '🌸 SPECIAL_PUJA (Special Pooja Ritual)', value: 'SPECIAL_PUJA' },
            { label: '⏰ DARSHAN_TIMINGS (Pooja & Darshan Timings)', value: 'DARSHAN_TIMINGS' },
            { label: '📜 GURU_PARAMPARA (Lineage & Heritage)', value: 'GURU_PARAMPARA' }
          ]
        },
        { name: 'startDate', label: 'Event Start Date & Time (When event starts)', type: 'datetime' },
        { name: 'endDate', label: 'Event End Date & Time (Auto-expires and disappears after this exact time)', type: 'datetime' },
        { name: 'imageUrl', label: 'Photo / Image Attachment (Upload File or Paste URL)', type: 'image' },
        { name: 'content', label: 'Content & Event Details', type: 'textarea', required: true },
        { name: 'active', label: 'Active Toggle', type: 'checkbox' }
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-turmeric/20 pb-3">
        <button
          onClick={() => setActiveTab('sevas')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'sevas'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          🌸 Regular Sevas
        </button>

        <button
          onClick={() => setActiveTab('shashwata')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'shashwata'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          ⏳ Shashwata Sevas
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'departments'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          🏛️ Department Budgets
        </button>

        <button
          onClick={() => setActiveTab('gotras')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'gotras'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          🔱 Gotras Master
        </button>

        <button
          onClick={() => setActiveTab('nakshatras')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'nakshatras'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          🌟 Nakshatras Master
        </button>

        <button
          onClick={() => setActiveTab('rashis')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'rashis'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          ♈ Rashis Master
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'announcements'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          📢 News & Announcements
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'gallery'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          🖼️ Hero &amp; Photo Gallery
        </button>
      </div>

      {/* Master Data Table */}
      <MasterTable
        title={`${
          activeTab === 'sevas'
            ? 'Regular Sevas'
            : activeTab === 'shashwata'
            ? 'Shashwata Sevas'
            : activeTab === 'departments'
            ? 'Department Monthly Budget Caps'
            : activeTab === 'gotras'
            ? 'Gotras Master (Vedic Lineages)'
            : activeTab === 'nakshatras'
            ? 'Nakshatras Master (27 Birth Stars)'
            : activeTab === 'rashis'
            ? 'Rashis Master (12 Zodiac Signs)'
            : activeTab === 'gallery'
            ? 'Homepage Hero & Photo Gallery Management'
            : 'News & Announcements'
        }`}
        description={
          activeTab === 'gallery'
            ? 'Upload, edit, or remove photos displayed in the Homepage Hero Section carousel and Temple Gallery.'
            : 'View, add, and configure master data records.'
        }
        columns={getColumns()}
        data={data}
        isLoading={loading}
        onAdd={() => handleOpenDrawer()}
        onEdit={(item) => handleOpenDrawer(item)}
        onDelete={handleDelete}
      />

      {/* Side Drawer Editor */}
      <MasterFormDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingItem(null);
        }}
        title={
          editingItem
            ? `Edit ${activeTab}`
            : `Add New ${activeTab}`
        }
        fields={getFormFields()}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        isSubmitting={submitting}
      />
    </div>
  );
};
