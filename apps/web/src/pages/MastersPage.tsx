import React, { useState, useEffect } from 'react';
import { MasterTable, ColumnConfig } from '../components/MasterTable.js';
import { MasterFormDrawer, FieldConfig } from '../components/MasterFormDrawer.js';
import { apiClient } from '../api/client.js';

type Tab = 'temple' | 'sevas' | 'shashwata' | 'gotras' | 'nakshatras' | 'rashis' | 'announcements';

export const MastersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('temple');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchTabContent = async (tab: Tab) => {
    setLoading(true);
    try {
      if (tab === 'temple') {
        const res = await apiClient.get('/temple');
        setData(res.data.data ? [res.data.data] : []);
      } else if (tab === 'sevas') {
        const res = await apiClient.get('/sevas');
        setData(res.data.data || []);
      } else if (tab === 'shashwata') {
        const res = await apiClient.get('/shashwata-sevas');
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
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData(activeTab === 'shashwata' ? { durationYears: 25, active: true } : { active: true });
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
      if (activeTab === 'temple') {
        await apiClient.put('/temple', formData);
      } else if (activeTab === 'sevas') {
        if (editingItem) {
          await apiClient.put(`/sevas/${editingItem.id}`, formData);
        } else {
          await apiClient.post('/sevas', formData);
        }
      } else if (activeTab === 'shashwata') {
        if (editingItem) {
          await apiClient.put(`/shashwata-sevas/${editingItem.id}`, formData);
        } else {
          await apiClient.post('/shashwata-sevas', formData);
        }
      } else if (activeTab === 'gotras') {
        if (editingItem) {
          await apiClient.put(`/vedic/gotras/${editingItem.id}`, formData);
        } else {
          await apiClient.post('/vedic/gotras', formData);
        }
      } else if (activeTab === 'nakshatras') {
        if (editingItem) {
          await apiClient.put(`/vedic/nakshatras/${editingItem.id}`, formData);
        } else {
          await apiClient.post('/vedic/nakshatras', formData);
        }
      } else if (activeTab === 'rashis') {
        if (editingItem) {
          await apiClient.put(`/vedic/rashis/${editingItem.id}`, formData);
        } else {
          await apiClient.post('/vedic/rashis', formData);
        }
      } else if (activeTab === 'announcements') {
        if (editingItem) {
          await apiClient.put(`/announcements/${editingItem.id}`, formData);
        } else {
          await apiClient.post('/announcements', formData);
        }
      }
      setDrawerOpen(false);
      setEditingItem(null);
      fetchTabContent(activeTab);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save master record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Are you sure you want to delete ${item.name || item.title || 'this item'}?`)) return;
    try {
      if (activeTab === 'sevas') {
        await apiClient.delete(`/sevas/${item.id}`);
      } else if (activeTab === 'shashwata') {
        await apiClient.delete(`/shashwata-sevas/${item.id}`);
      } else if (activeTab === 'gotras') {
        await apiClient.delete(`/vedic/gotras/${item.id}`);
      } else if (activeTab === 'nakshatras') {
        await apiClient.delete(`/vedic/nakshatras/${item.id}`);
      } else if (activeTab === 'rashis') {
        await apiClient.delete(`/vedic/rashis/${item.id}`);
      } else if (activeTab === 'announcements') {
        await apiClient.delete(`/announcements/${item.id}`);
      }
      fetchTabContent(activeTab);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const getColumns = (): ColumnConfig<any>[] => {
    if (activeTab === 'temple') {
      return [
        { key: 'name', header: 'Temple Name' },
        { key: 'deity', header: 'Deity' },
        { key: 'city', header: 'City' },
        { key: 'phone', header: 'Phone' },
        { key: 'registrationNumber', header: 'Reg No' }
      ];
    } else if (activeTab === 'sevas') {
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
    } else if (activeTab === 'gotras') {
      return [
        { key: 'name', header: 'Gotra Name' },
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
    } else {
      return [
        { key: 'title', header: 'Title' },
        { key: 'category', header: 'Category' },
        { key: 'content', header: 'Content' },
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
    }
  };

  const getFormFields = (): FieldConfig[] => {
    if (activeTab === 'temple') {
      return [
        { name: 'name', label: 'Temple Name', type: 'text', required: true },
        { name: 'deity', label: 'Main Deity', type: 'text', required: true },
        { name: 'address', label: 'Address', type: 'text', required: true },
        { name: 'city', label: 'City', type: 'text', required: true },
        { name: 'state', label: 'State', type: 'text', required: true },
        { name: 'pincode', label: 'Pincode', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'registrationNumber', label: 'Registration Number', type: 'text' }
      ];
    } else if (activeTab === 'sevas') {
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
    } else {
      return [
        { name: 'title', label: 'Announcement Title', type: 'text', required: true },
        { name: 'category', label: 'Category (ANNOUNCEMENT / EVENT / DARSHAN_TIMINGS / GURU_PARAMPARA)', type: 'text', required: true },
        { name: 'content', label: 'Content Details', type: 'textarea', required: true },
        { name: 'active', label: 'Active on Homepage', type: 'checkbox' }
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-turmeric/20 pb-3">
        <button
          onClick={() => setActiveTab('temple')}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'temple'
              ? 'bg-kumkum text-ivory shadow-sm font-bold'
              : 'text-textInk/70 hover:text-kumkum hover:bg-ivory'
          }`}
        >
          🏛️ Temple Info
        </button>

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
      </div>

      {/* Master Data Table */}
      <MasterTable
        title={`${
          activeTab === 'temple'
            ? 'Temple Master'
            : activeTab === 'sevas'
            ? 'Regular Sevas'
            : activeTab === 'shashwata'
            ? 'Shashwata Sevas'
            : activeTab === 'gotras'
            ? 'Gotras Master (Vedic Lineages)'
            : activeTab === 'nakshatras'
            ? 'Nakshatras Master (27 Birth Stars)'
            : activeTab === 'rashis'
            ? 'Rashis Master (12 Zodiac Signs)'
            : 'News & Announcements'
        }`}
        description="View, add, and configure master data records."
        columns={getColumns()}
        data={data}
        isLoading={loading}
        onAdd={activeTab !== 'temple' ? () => handleOpenDrawer() : undefined}
        onEdit={(item) => handleOpenDrawer(item)}
        onDelete={activeTab !== 'temple' ? handleDelete : undefined}
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
