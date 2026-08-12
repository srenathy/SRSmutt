import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { PaymentMode, ReceiptKind } from '@temple/shared';
import { GopuramProgressRail } from '../components/GopuramMotif';
import { ThermalReceiptModal } from '../components/ThermalReceiptModal';
import { SankalpaModal } from '../components/SankalpaModal';
import { VedicAutocomplete } from '../components/VedicAutocomplete';
import { useVedicMasters } from '../hooks/useVedicMasters';
import { Plus, Trash2, UserPlus, CheckCircle, Banknote, Smartphone, CreditCard, Building2, Search } from 'lucide-react';

export const BillingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [kind, setKind] = useState<ReceiptKind>(ReceiptKind.NEW_SEVA);
  const [selectedDevotee, setSelectedDevotee] = useState<any>(null);
  const [devoteeSearch, setDevoteeSearch] = useState('');
  const [showQuickAddDevotee, setShowQuickAddDevotee] = useState(false);
  const [newDevotee, setNewDevotee] = useState({
    name: '',
    phone: '',
    gotra: '',
    nakshatra: '',
    rashi: '',
    city: ''
  });

  const [items, setItems] = useState<
    { sevaId?: string; shashwataSevaId?: string; description: string; amount: number; quantity: number; devoteeCount: number }[]
  >([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.CASH);
  const [transactionRef, setTransactionRef] = useState('');
  const [sankalpaNote, setSankalpaNote] = useState('');

  // Created receipt result for printing
  const [createdReceipt, setCreatedReceipt] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [showSankalpaModal, setShowSankalpaModal] = useState(false);

  const handleStartNewBill = () => {
    setShowSuccessModal(false);
    setShowThermalModal(false);
    setShowSankalpaModal(false);
    setCreatedReceipt(null);
    setSelectedDevotee(null);
    setDevoteeSearch('');
    setItems([]);
    setSankalpaNote('');
    setTransactionRef('');
    setPaymentMode(PaymentMode.CASH);
    setCurrentStep(0);
  };

  // Master Vedic lists (Gotra, Nakshatra, Rashi)
  const { gotras, nakshatras, rashis } = useVedicMasters();
  const sevasQuery = useQuery({
    queryKey: ['active-sevas'],
    queryFn: async () => {
      const res = await apiClient.get('/sevas');
      return res.data.data?.filter((s: any) => s.active) || [];
    }
  });

  const shashwataQuery = useQuery({
    queryKey: ['active-shashwata'],
    queryFn: async () => {
      const res = await apiClient.get('/shashwata-sevas');
      return res.data.data?.filter((s: any) => s.active) || [];
    }
  });

  const devoteesQuery = useQuery({
    queryKey: ['devotee-search', devoteeSearch],
    queryFn: async () => {
      const res = await apiClient.get(`/devotees?search=${encodeURIComponent(devoteeSearch)}`);
      const rawList: any[] = res.data.data || [];

      // Defensive client-side deduplication by phone or name+gotra+city
      const seen = new Set<string>();
      return rawList.filter((d: any) => {
        const cleanPhone = (d.phone || '').replace(/\D/g, '').slice(-10);
        const cleanName = (d.name || '').trim().toLowerCase();
        const cleanGotra = (d.gotra || '').trim().toLowerCase();
        const key = cleanPhone.length >= 7 ? `phone:${cleanPhone}` : `name:${cleanName}|${cleanGotra}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
  });

  const createDevoteeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/devotees', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setSelectedDevotee(data);
      setShowQuickAddDevotee(false);
      setNewDevotee({ name: '', phone: '', gotra: '', nakshatra: '', rashi: '', city: '' });
    }
  });

  const createReceiptMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/receipts', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setCreatedReceipt(data);
      setCurrentStep(4);
    }
  });

  // Items calculation
  const totalAmount = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  const handleAddSevaItem = (seva: any) => {
    if (kind === ReceiptKind.NEW_SEVA) {
      setItems((prev) => [
        ...prev,
        {
          sevaId: seva.id,
          description: seva.name,
          amount: Number(seva.amount),
          quantity: 1,
          devoteeCount: 1
        }
      ]);
    } else if (kind === ReceiptKind.SHASHWATA_SEVA) {
      setItems((prev) => [
        ...prev,
        {
          shashwataSevaId: seva.id,
          description: `${seva.name} (${seva.durationYears} Years)`,
          amount: Number(seva.amount),
          quantity: 1,
          devoteeCount: 1
        }
      ]);
    }
  };

  const handleAddCustomDravyaItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: 'Dravya / In-Kind Donation',
        amount: 100,
        quantity: 1,
        devoteeCount: 1
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, isNaN(qty) ? 1 : qty) } : item))
    );
  };

  const handleAmountChange = (index: number, amount: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, amount: Math.max(0, isNaN(amount) ? 0 : amount) } : item))
    );
  };

  const handleDevoteeCountChange = (index: number, count: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, devoteeCount: Math.max(1, isNaN(count) ? 1 : count) } : item))
    );
  };

  const handleSubmitBilling = () => {
    if (!selectedDevotee) {
      alert('Please select or create a devotee before issuing a receipt.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one Seva item.');
      return;
    }
    if (paymentMode !== PaymentMode.CASH && !transactionRef.trim()) {
      alert('Please enter the transaction reference / instrument number.');
      return;
    }

    const payload = {
      kind,
      devoteeId: selectedDevotee.id,
      paymentMode,
      transactionRef: paymentMode !== PaymentMode.CASH ? transactionRef.trim() : undefined,
      sankalpaNote,
      items
    };

    createReceiptMutation.mutate(payload);
  };

  const steps = ['1. Receipt Type', '2. Devotee Details', '3. Seva Items', '4. Payment & Issue', '5. Receipt & Print'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display text-2xl font-bold text-kumkum">New Seva Billing Counter</h2>
        <p className="text-xs text-textInk/60 mt-1">Fast POS cashier billing and instant receipt issuance.</p>
      </div>

      {/* Signature Gopuram Progress Rail */}
      <GopuramProgressRail steps={steps} currentStep={currentStep} />

      {/* STEP 1: Receipt Kind */}
      {currentStep === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-turmeric/30 shadow-sm space-y-6">
          <h3 className="font-display text-lg font-bold text-kumkum">Select Offering Kind</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setKind(ReceiptKind.NEW_SEVA)}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                kind === ReceiptKind.NEW_SEVA
                  ? 'border-kumkum bg-kumkum/5 shadow-md'
                  : 'border-turmeric/30 hover:border-turmeric bg-white'
              }`}
            >
              <h4 className="font-display font-bold text-base text-kumkum">Regular Seva</h4>
              <p className="text-xs text-textInk/60 mt-1">Archana, Abhisheka, Mahamangalarathi, and daily poojas.</p>
            </button>

            <button
              onClick={() => setKind(ReceiptKind.SHASHWATA_SEVA)}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                kind === ReceiptKind.SHASHWATA_SEVA
                  ? 'border-kumkum bg-kumkum/5 shadow-md'
                  : 'border-turmeric/30 hover:border-turmeric bg-white'
              }`}
            >
              <h4 className="font-display font-bold text-base text-kumkum">Shashwata Seva</h4>
              <p className="text-xs text-textInk/60 mt-1">Annual perpetual endowment sevas (25+ years duration).</p>
            </button>

            <button
              onClick={() => setKind(ReceiptKind.KIND_DONATION)}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                kind === ReceiptKind.KIND_DONATION
                  ? 'border-kumkum bg-kumkum/5 shadow-md'
                  : 'border-turmeric/30 hover:border-turmeric bg-white'
              }`}
            >
              <h4 className="font-display font-bold text-base text-kumkum">In-Kind (Dravya)</h4>
              <p className="text-xs text-textInk/60 mt-1">Material or monetary Dravya offerings & donations.</p>
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="bg-kumkum text-ivory font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-kumkum-light transition-colors"
            >
              Next: Devotee Details →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Devotee Picker */}
      {currentStep === 1 && (
        <div className="bg-white p-8 rounded-2xl border border-turmeric/30 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-kumkum">Devotee Selection</h3>
            <button
              onClick={() => setShowQuickAddDevotee(!showQuickAddDevotee)}
              className="flex items-center gap-1.5 text-xs font-semibold text-kumkum hover:underline"
            >
              <UserPlus className="w-4 h-4" />
              {showQuickAddDevotee ? 'Search Devotee' : 'Quick Register New Devotee'}
            </button>
          </div>

          {selectedDevotee && (
            <div className="bg-ivory/60 p-4 rounded-xl border border-turmeric/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-turmeric-dark font-bold uppercase">Selected Devotee:</span>
                <h4 className="font-bold text-textInk text-base">{selectedDevotee.name} ({selectedDevotee.phone})</h4>
                <p className="text-xs text-textInk/70">
                  Gotra: {selectedDevotee.gotra || '-'} | Nakshatra: {selectedDevotee.nakshatra || '-'} | Rashi: {selectedDevotee.rashi || '-'}
                </p>
              </div>
              <button
                onClick={() => setSelectedDevotee(null)}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Change
              </button>
            </div>
          )}

          {!showQuickAddDevotee ? (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Name, Phone, Gotra, Nakshatra, or City (Type 3+ chars for fuzzy search)..."
                  value={devoteeSearch}
                  onChange={(e) => setDevoteeSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-turmeric/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 text-textInk font-medium bg-white"
                />
                <Search className="w-4 h-4 text-textInk/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {devoteeSearch.trim().length > 0 && devoteeSearch.trim().length < 3 && (
                <p className="text-[11px] text-turmeric-dark italic px-1">
                  💡 Type at least 3 letters to activate fuzzy search suggestion dropdown.
                </p>
              )}

              <div className="max-h-56 overflow-y-auto divide-y divide-turmeric/10 border border-turmeric/20 rounded-xl bg-white shadow-xs">
                {devoteesQuery.isLoading ? (
                  <div className="p-4 text-xs text-textInk/50 text-center italic">Searching devotees database...</div>
                ) : devoteesQuery.data?.length === 0 ? (
                  <div className="p-4 text-xs text-textInk/50 text-center italic">
                    No matching devotees found. Click "Quick Add Devotee" above to register new entry.
                  </div>
                ) : (
                  devoteesQuery.data?.map((d: any) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDevotee(d)}
                      className={`p-3 text-xs flex items-center justify-between cursor-pointer hover:bg-ivory/60 transition-colors ${
                        selectedDevotee?.id === d.id ? 'bg-kumkum/10 font-bold border-l-4 border-kumkum' : ''
                      }`}
                    >
                      <div>
                        <p className="font-bold text-textInk">{d.name} <span className="text-textInk/60 font-medium">({d.phone})</span></p>
                        <p className="text-[10px] text-textInk/60 mt-0.5">
                          Gotra: <span className="font-semibold text-textInk/80">{d.gotra || '-'}</span> | 
                          Nakshatra: <span className="font-semibold text-textInk/80">{d.nakshatra || '-'}</span> | 
                          Rashi: <span className="font-semibold text-textInk/80">{d.rashi || '-'}</span> | 
                          City: <span className="font-semibold text-textInk/80">{d.city || '-'}</span>
                        </p>
                      </div>
                      {selectedDevotee?.id === d.id && <CheckCircle className="w-4 h-4 text-kumkum" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createDevoteeMutation.mutate(newDevotee);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-ivory-light/40 p-4 rounded-xl border border-turmeric/20"
            >
              <div>
                <label className="text-xs font-semibold text-textInk mb-1 block">Devotee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Srinivas Rao"
                  value={newDevotee.name}
                  onChange={(e) => setNewDevotee({ ...newDevotee, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-turmeric/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 text-textInk font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-textInk mb-1 block">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile number"
                  value={newDevotee.phone}
                  onChange={(e) => setNewDevotee({ ...newDevotee, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-turmeric/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 text-textInk font-medium"
                />
              </div>

              <div>
                <VedicAutocomplete
                  label="Gotra"
                  placeholder="Type 3+ letters to search Gotra..."
                  value={newDevotee.gotra}
                  onChange={(val) => setNewDevotee({ ...newDevotee, gotra: val })}
                  options={gotras}
                  minChars={3}
                />
              </div>

              <div>
                <VedicAutocomplete
                  label="Nakshatra"
                  placeholder="Type 3+ letters to search Nakshatra..."
                  value={newDevotee.nakshatra}
                  onChange={(val) => setNewDevotee({ ...newDevotee, nakshatra: val })}
                  options={nakshatras}
                  minChars={3}
                />
              </div>

              <div>
                <VedicAutocomplete
                  label="Rashi"
                  placeholder="Type 3+ letters to search Rashi..."
                  value={newDevotee.rashi}
                  onChange={(val) => setNewDevotee({ ...newDevotee, rashi: val })}
                  options={rashis}
                  minChars={3}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-textInk mb-1 block">City / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={newDevotee.city}
                  onChange={(e) => setNewDevotee({ ...newDevotee, city: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-turmeric/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 text-textInk font-medium"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={createDevoteeMutation.isPending}
                  className="bg-kumkum hover:bg-kumkum-light text-ivory text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors"
                >
                  {createDevoteeMutation.isPending ? 'Saving Devotee...' : 'Save & Select Devotee'}
                </button>
              </div>
            </form>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(0)}
              className="text-xs text-textInk/60 hover:underline"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (!selectedDevotee) {
                  alert('Please select or register a devotee first.');
                  return;
                }
                setCurrentStep(2);
              }}
              className="bg-kumkum text-ivory font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-kumkum-light transition-colors"
            >
              Next: Add Seva Items →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Seva Items */}
      {currentStep === 2 && (
        <div className="bg-white p-8 rounded-2xl border border-turmeric/30 shadow-sm space-y-6">
          <h3 className="font-display text-lg font-bold text-kumkum">Add Seva Offerings</h3>

          {/* Catalog Picker */}
          {kind === ReceiptKind.NEW_SEVA && (
            <div>
              <p className="text-xs font-semibold text-textInk/70 mb-2">Available Seva Catalog:</p>
              <div className="flex flex-wrap gap-2">
                {sevasQuery.data?.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => handleAddSevaItem(s)}
                    className="bg-ivory hover:bg-turmeric/20 border border-turmeric/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-textInk flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-kumkum" />
                    {s.name} (₹{Number(s.amount).toFixed(0)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {kind === ReceiptKind.SHASHWATA_SEVA && (
            <div>
              <p className="text-xs font-semibold text-textInk/70 mb-2">Shashwata Seva Catalog:</p>
              <div className="flex flex-wrap gap-2">
                {shashwataQuery.data?.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => handleAddSevaItem(s)}
                    className="bg-ivory hover:bg-turmeric/20 border border-turmeric/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-textInk flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-kumkum" />
                    {s.name} (₹{Number(s.amount).toFixed(0)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {kind === ReceiptKind.KIND_DONATION && (
            <div>
              <button
                onClick={handleAddCustomDravyaItem}
                className="bg-kumkum text-ivory text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Dravya Offering Line Item
              </button>
            </div>
          )}

          {kind === ReceiptKind.HUNDI_COLLECTION && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-textInk/70">Quick Hundi Box Presets & Direct Income Categories:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Main Temple Kanike Hundi Opening', amt: 5000 },
                  { label: 'Rayaru Sannidhi Hundi', amt: 2500 },
                  { label: 'Mula Rama Devara Pooja Hundi', amt: 2000 },
                  { label: 'Annadana Trust Hundi', amt: 1500 },
                  { label: 'Direct Temple Bank Interest / Deposit Income', amt: 1000 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setItems((prev) => [
                        ...prev,
                        { description: preset.label, amount: preset.amt, quantity: 1, devoteeCount: 1 }
                      ]);
                    }}
                    className="bg-ivory hover:bg-turmeric/20 border border-turmeric/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-textInk flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-kumkum" />
                    {preset.label} (₹{preset.amt})
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setItems((prev) => [
                    ...prev,
                    { description: 'Custom Hundi / Direct Income Entry', amount: 1000, quantity: 1, devoteeCount: 1 }
                  ]);
                }}
                className="bg-kumkum text-ivory text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Custom Hundi / Income Line Item
              </button>
            </div>
          )}

          {/* Selected Items List Table */}
          <div className="border border-ivory-dark rounded-xl overflow-hidden mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark">
                <tr>
                  <th className="p-3">Seva Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-center">No. of Devotees</th>
                  <th className="p-3 text-right">Unit Price (₹)</th>
                  <th className="p-3 text-right">Line Total</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-dark/60">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-textInk/50">
                      No items added yet. Click an offering above to add.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, description: e.target.value } : it))
                            )
                          }
                          className="w-full px-2 py-1 border border-turmeric/20 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                          className="w-16 px-2 py-1 border border-turmeric/20 rounded-lg text-xs text-center font-bold focus:bg-white"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1 border border-turmeric/40 rounded-xl bg-white p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleDevoteeCountChange(idx, (item.devoteeCount || 1) - 1)}
                            className="w-6 h-6 rounded-lg bg-ivory hover:bg-turmeric/20 text-kumkum font-bold flex items-center justify-center text-xs transition-colors"
                            title="Decrease devotees"
                          >
                            -
                          </button>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.devoteeCount ?? 1}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                setItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, devoteeCount: '' as any } : it))
                                );
                                return;
                              }
                              const parsed = parseInt(raw, 10);
                              if (!isNaN(parsed)) {
                                handleDevoteeCountChange(idx, Math.max(1, parsed));
                              }
                            }}
                            onBlur={() => {
                              if (!item.devoteeCount || isNaN(Number(item.devoteeCount))) {
                                handleDevoteeCountChange(idx, 1);
                              }
                            }}
                            className="w-14 text-center text-xs font-bold text-kumkum focus:outline-none focus:ring-1 focus:ring-kumkum/40 rounded py-0.5 border border-turmeric/20"
                          />

                          <button
                            type="button"
                            onClick={() => handleDevoteeCountChange(idx, (item.devoteeCount || 1) + 1)}
                            className="w-6 h-6 rounded-lg bg-ivory hover:bg-turmeric/20 text-kumkum font-bold flex items-center justify-center text-xs transition-colors"
                            title="Increase devotees"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono">
                        <input
                          type="number"
                          min={0}
                          value={item.amount}
                          onChange={(e) => handleAmountChange(idx, parseFloat(e.target.value))}
                          className="w-24 px-2 py-1 border border-turmeric/20 rounded-lg text-xs text-right font-mono"
                        />
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-kumkum">
                        ₹{(item.amount * item.quantity).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Running Total Box */}
          <div className="bg-ivory/60 p-4 rounded-xl flex items-center justify-between font-mono">
            <span className="font-bold text-textInk text-sm">TOTAL OFFERING AMOUNT:</span>
            <span className="font-bold text-kumkum text-xl">₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setCurrentStep(1)} className="text-xs text-textInk/60 hover:underline">
              ← Back
            </button>
            <button
              onClick={() => {
                if (items.length === 0) {
                  alert('Please add at least one Seva item.');
                  return;
                }
                setCurrentStep(3);
              }}
              className="bg-kumkum text-ivory font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-kumkum-light transition-colors"
            >
              Next: Payment & Issue →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Payment & Issue */}
      {currentStep === 3 && (
        <div className="bg-white p-8 rounded-2xl border border-turmeric/30 shadow-sm space-y-6">
          <h3 className="font-display text-lg font-bold text-kumkum">Payment Mode & Final Confirmation</h3>

          {/* Single-Select Radio Payment Mode */}
          <div>
            <label className="text-xs font-bold text-textInk/80 block mb-3">Single-Select Payment Mode *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { mode: PaymentMode.CASH, label: 'Cash', icon: Banknote },
                { mode: PaymentMode.UPI, label: 'UPI / QR', icon: Smartphone },
                { mode: PaymentMode.CARD, label: 'Card / POS', icon: CreditCard },
                { mode: PaymentMode.BANK, label: 'Bank Transfer', icon: Building2 }
              ].map(({ mode, label, icon: Icon }) => (
                <label
                  key={mode}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    paymentMode === mode
                      ? 'border-kumkum bg-kumkum/5 shadow-sm text-kumkum'
                      : 'border-turmeric/20 hover:border-turmeric text-textInk/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value={mode}
                    checked={paymentMode === mode}
                    onChange={() => setPaymentMode(mode)}
                    className="sr-only"
                  />
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transaction / Reference Number (Rendered conditionally for non-cash modes) */}
          {paymentMode !== PaymentMode.CASH && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs font-bold text-textInk/80 flex items-center gap-1">
                <span>Transaction Reference / Instrument Number *</span>
              </label>
              <input
                type="text"
                required
                placeholder={
                  paymentMode === PaymentMode.UPI
                    ? "e.g. UPI Ref / UTR / Txn ID"
                    : paymentMode === PaymentMode.BANK
                    ? "e.g. Cheque Number / NEFT Txn Ref"
                    : "e.g. Card Slip Txn Ref / Approval Code"
                }
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-turmeric/30 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-medium text-textInk"
              />
              <p className="text-[10px] text-textInk/50">
                Please enter the payment reference to associate it with this ledger entry.
              </p>
            </div>
          )}

          {/* Optional Sankalpa Note */}
          <div>
            <label className="text-xs font-semibold text-textInk/80">Sankalpa Special Prayer Note (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Specific family prayer request or health blessing..."
              value={sankalpaNote}
              onChange={(e) => setSankalpaNote(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-xs mt-1"
            />
          </div>

          {/* Summary Box */}
          <div className="bg-ivory p-6 rounded-xl border border-turmeric/30 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-textInk/60">Devotee:</span>
              <span className="font-bold">{selectedDevotee?.name} ({selectedDevotee?.phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textInk/60">Seva Items:</span>
              <span className="font-bold">{items.length} items</span>
            </div>
            <div className="flex justify-between text-base font-mono border-t border-turmeric/20 pt-2 font-bold text-kumkum">
              <span>FINAL GRAND TOTAL:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setCurrentStep(2)} className="text-xs text-textInk/60 hover:underline">
              ← Back
            </button>
            <button
              onClick={handleSubmitBilling}
              disabled={createReceiptMutation.isPending}
              className="bg-gradient-to-r from-kumkum to-kumkum-light hover:from-kumkum-light hover:to-kumkum text-ivory font-bold px-8 py-3 rounded-xl text-base shadow-xl transition-all flex items-center gap-2"
            >
              {createReceiptMutation.isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
              ) : (
                'Issue Official Receipt & Print'
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Receipt Created & Print Actions (Inline in Wizard Box) */}
      {currentStep === 4 && createdReceipt && (
        <div className="bg-white p-8 rounded-2xl border border-turmeric/30 shadow-lg text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl font-bold shadow-xs">
            ✓
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
              SUCCESSFULLY GENERATED & RECORDED
            </span>
            <h3 className="font-display font-bold text-2xl text-kumkum mt-2">
              Official Receipt Issued
            </h3>
            <p className="text-sm font-mono font-bold text-kumkum mt-1">
              Receipt No: #{createdReceipt.receiptNumber}
            </p>
          </div>

          {/* Receipt Details Summary Card */}
          <div className="bg-ivory/60 p-6 rounded-2xl border border-turmeric/30 text-left text-xs space-y-3 max-w-lg mx-auto shadow-inner">
            <div className="flex justify-between border-b border-turmeric/10 pb-2">
              <span className="text-textInk/60 font-medium">Devotee Name:</span>
              <span className="font-bold text-textInk">{createdReceipt.devotee?.name} ({createdReceipt.devotee?.phone})</span>
            </div>
            <div className="flex justify-between border-b border-turmeric/10 pb-2">
              <span className="text-textInk/60 font-medium">Gotra / Nakshatra:</span>
              <span className="font-semibold text-textInk">{createdReceipt.devotee?.gotra || '-'} / {createdReceipt.devotee?.nakshatra || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-turmeric/10 pb-2">
              <span className="text-textInk/60 font-medium">Payment Mode:</span>
              <span className="font-bold text-kumkum">{createdReceipt.paymentMode} {createdReceipt.transactionRef ? `(Ref: ${createdReceipt.transactionRef})` : ''}</span>
            </div>
            {createdReceipt.items && createdReceipt.items.length > 0 && (
              <div className="space-y-1.5 border-b border-turmeric/10 pb-2">
                <span className="text-textInk/60 font-medium block mb-1">Seva Items:</span>
                {createdReceipt.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between font-semibold text-[11px] text-textInk pl-2 border-l-2 border-turmeric/40">
                    <span>{it.description} (x{it.quantity})</span>
                    <span>₹{Number(it.amount * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between pt-1 font-bold text-base text-kumkum font-mono">
              <span>FINAL AMOUNT PAID:</span>
              <span>₹{Number(createdReceipt.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Print & Next Bill Buttons */}
          <div className="max-w-md mx-auto space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowThermalModal(true)}
                className="bg-kumkum hover:bg-kumkum-light text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Printer className="w-4 h-4" /> Thermal Print
              </button>
              <button
                onClick={() => setShowSankalpaModal(true)}
                className="bg-turmeric-dark hover:bg-kumkum text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                📜 Sankalpa Sheet
              </button>
            </div>

            <button
              onClick={handleStartNewBill}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>✨ Start Next Seva Bill (Step 1)</span>
            </button>
          </div>
        </div>
      )}

      {/* Thermal POS Print Modal */}
      <ThermalReceiptModal
        receipt={createdReceipt}
        isOpen={showThermalModal}
        onClose={() => {
          setShowThermalModal(false);
          setShowSankalpaModal(true); // Offer Sankalpa sheet after thermal print
        }}
      />

      {/* Priest Sankalpa Sheet Print Modal */}
      <SankalpaModal
        receipt={createdReceipt}
        isOpen={showSankalpaModal}
        onClose={() => setShowSankalpaModal(false)}
      />
    </div>
  );
};
