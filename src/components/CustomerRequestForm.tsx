import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Package,
  Layers,
  Search,
  X,
  Store,
} from 'lucide-react';
import { CustomerRequest, ProductItem, BudgetOption, RecommendedStore } from '../types';
import { createNewRequest, generateSampleCopyText, BENCHMARK_FX_RATE } from '../services/storage';

interface CustomerRequestFormProps {
  onRequestSubmitted: (newRequest: CustomerRequest) => void;
  onOpenTrackView: (requestId: string) => void;
  onOpenRecommendedSitesTab: () => void;
  initialStore?: RecommendedStore | null;
  initialItemName?: string;
  onClearInitialStore?: () => void;
}

const CATEGORIES = [
  { name: 'Beauty & Skincare', icon: '✨', examples: 'Boots Soltan, CeraVe UK, The Ordinary, Elemis' },
  { name: 'Electronics & Audio', icon: '🎧', examples: 'AirPods Pro, MacBook Air, Sony WH-1000XM5, Dyson' },
  { name: 'Fashion & Accessories', icon: '👞', examples: 'Clarks Originals, Marks & Spencer, Next, Ralph Lauren' },
  { name: 'Baby & Infant Care', icon: '🍼', examples: 'Aptamil Profutura, Kendamil, Cow & Gate, NUK' },
  { name: 'Health & Pharmacy', icon: '💊', examples: 'Vitabiotics, Holland & Barrett, Littmann, Boots' },
  { name: 'Home & Appliances', icon: '☕', examples: 'Ninja Air Fryers, DeLonghi, Russell Hobbs, Joseph Joseph' },
];

const POPULAR_PRESETS = [
  {
    category: 'Electronics & Audio',
    title: 'Apple AirPods Pro (2nd Generation with MagSafe USB-C)',
    brand: 'Apple',
    qty: 1,
    budget: '150-500' as BudgetOption,
    specs: 'UK retail specification. Must include UK warranty and original Apple receipt.',
    url: 'https://www.apple.com/uk/airpods-pro/',
  },
  {
    category: 'Baby & Infant Care',
    title: 'Aptamil Profutura 1 First Infant Milk (800g x 4 tins)',
    brand: 'Aptamil / Nutricia UK',
    qty: 4,
    budget: '50-150' as BudgetOption,
    specs: 'Stage 1 (from birth). Fresh UK batch with at least 12 months expiry date.',
    url: 'https://www.boots.com/aptamil-profutura-first-infant-milk-800g',
  },
  {
    category: 'Fashion & Accessories',
    title: 'Clarks Originals Suede Desert Boots (Beeswax or Cola)',
    brand: 'Clarks UK',
    qty: 1,
    budget: '50-150' as BudgetOption,
    specs: 'UK Size 9.5 (EU 44). Classic crepe sole.',
    url: 'https://www.clarks.co.uk',
  },
  {
    category: 'Beauty & Skincare',
    title: 'CeraVe Hydrating Cleanser & Moisturising Cream UK Bundle',
    brand: 'CeraVe UK',
    qty: 2,
    budget: 'under50' as BudgetOption,
    specs: 'UK manufactured batch with European formulation for sensitive skin.',
    url: 'https://www.boots.com/cerave',
  },
];

export const CustomerRequestForm: React.FC<CustomerRequestFormProps> = ({
  onRequestSubmitted,
  onOpenTrackView,
  onOpenRecommendedSitesTab,
  initialStore,
  initialItemName,
  onClearInitialStore,
}) => {
  // Primary Form State
  const [category, setCategory] = useState<string>('Electronics & Audio');
  const [items, setItems] = useState<ProductItem[]>([
    {
      id: 'item-' + Date.now(),
      name: '',
      brand: '',
      quantity: 1,
      specs: '',
      dontKnowName: false,
      whatItDoesOrLooksLike: '',
      referenceUrl: '',
      photoUrl: '',
    },
  ]);
  const [budget, setBudget] = useState<BudgetOption>('flexible');
  const [customerName, setCustomerName] = useState<string>('');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('+234 ');
  const [deliveryCity, setDeliveryCity] = useState<string>('Lagos (Lekki / Victoria Island)');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');

  // UI helpers
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<CustomerRequest | null>(null);
  const [quickSearchInput, setQuickSearchInput] = useState<string>('');

  useEffect(() => {
    if (initialStore) {
      if (initialStore.category) {
        setCategory(initialStore.category);
      }
      setItems([
        {
          id: 'item-' + Date.now(),
          name: initialItemName || '',
          brand: initialStore.name,
          quantity: 1,
          specs: initialItemName ? `Selected from ${initialStore.name} catalog.` : '',
          dontKnowName: false,
          whatItDoesOrLooksLike: '',
          referenceUrl: initialStore.url,
          photoUrl: '',
        },
      ]);
      const el = document.getElementById('request-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [initialStore, initialItemName]);

  const handleApplyPreset = (preset: (typeof POPULAR_PRESETS)[0]) => {
    setCategory(preset.category);
    setBudget(preset.budget);
    setItems([
      {
        id: 'item-' + Date.now(),
        name: preset.title,
        brand: preset.brand,
        quantity: preset.qty,
        specs: preset.specs,
        dontKnowName: false,
        whatItDoesOrLooksLike: '',
        referenceUrl: preset.url,
        photoUrl: '',
      },
    ]);
    // Scroll smoothly to form
    const el = document.getElementById('request-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchInput.trim()) return;

    // Detect if they pasted a link
    const isUrl = quickSearchInput.startsWith('http://') || quickSearchInput.startsWith('https://');

    setItems([
      {
        id: 'item-' + Date.now(),
        name: isUrl ? 'Product from UK link' : quickSearchInput,
        brand: '',
        quantity: 1,
        specs: '',
        dontKnowName: false,
        whatItDoesOrLooksLike: '',
        referenceUrl: isUrl ? quickSearchInput : '',
        photoUrl: '',
      },
    ]);

    const el = document.getElementById('request-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: 'item-' + Date.now(),
        name: '',
        brand: '',
        quantity: 1,
        specs: '',
        dontKnowName: false,
        whatItDoesOrLooksLike: '',
        referenceUrl: '',
        photoUrl: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof ProductItem, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleCopySampleRequest = () => {
    const sampleReq: Partial<CustomerRequest> = {
      customerName: customerName || 'Nigerian Customer',
      whatsappPhone: whatsappPhone || '+234 ...',
      deliveryCity,
      category,
      items,
      budget,
    };
    const text = generateSampleCopyText(sampleReq);
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic check: at least one item has a name or description
    const hasValidItem = items.some(
      (item) => item.name.trim().length > 0 || item.whatItDoesOrLooksLike?.trim().length || item.referenceUrl?.trim().length
    );

    if (!hasValidItem) {
      alert('Please specify the product you are looking for, or describe what it does.');
      return;
    }

    if (!whatsappPhone.trim() || whatsappPhone.trim() === '+234') {
      alert('Please enter your WhatsApp phone number so we can send your quotation.');
      return;
    }

    const newReq = createNewRequest({
      customerName: customerName.trim() || 'Valued Customer',
      whatsappPhone: whatsappPhone.trim(),
      deliveryCity,
      deliveryAddress: deliveryAddress.trim(),
      category,
      items,
      budget,
    });

    setSubmittedRequest(newReq);
    onRequestSubmitted(newReq);
  };

  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
            Request Logged & Assigned
          </span>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            We've Received Your UK2Naija Sourcing Request!
          </h2>
          <p className="text-slate-600 mb-6 text-sm max-w-md mx-auto">
            Your personal UK sourcing specialist has been notified. We are currently checking verified UK retailers and
            preparing your transparent landed quotation.
          </p>

          {/* Reference Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left mb-6 max-w-lg mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Request Reference</span>
                <p className="text-lg font-mono font-bold text-slate-900">{submittedRequest.id}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                Sourcing in Progress
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p>
                <strong className="text-slate-900">Customer:</strong> {submittedRequest.customerName} (
                {submittedRequest.whatsappPhone})
              </p>
              <p>
                <strong className="text-slate-900">Destination:</strong> {submittedRequest.deliveryCity}
                {submittedRequest.deliveryAddress ? ` — ${submittedRequest.deliveryAddress}` : ''}
              </p>
              <p>
                <strong className="text-slate-900">Requested Items:</strong>{' '}
                {submittedRequest.items.map((i) => `${i.name || 'UK Product'} (Qty: ${i.quantity})`).join(', ')}
              </p>
              <p>
                <strong className="text-slate-900">Benchmark Rate:</strong> £1.00 = ₦
                {BENCHMARK_FX_RATE.toLocaleString()} (No UK card required · 100% Naira settlement)
              </p>

              {/* Explicit Data Destination Confirmation */}
              <div className="pt-2 mt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-800">
                <div className="flex items-center gap-1.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Logged in UK2Naija Database</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Google Sheets Webhook Dispatched</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Primary Failsafe Action: Direct WhatsApp Dispatch */}
            <a
              href={`https://wa.me/447700900123?text=${encodeURIComponent(
                `*UK2NAIJA SOURCING ORDER - NEW SUBMISSION*\n` +
                `----------------------------------------\n` +
                `*Ref ID:* ${submittedRequest.id}\n` +
                `*Customer:* ${submittedRequest.customerName}\n` +
                `*Phone/WhatsApp:* ${submittedRequest.whatsappPhone}\n` +
                `*Delivery City:* ${submittedRequest.deliveryCity}\n` +
                `*Address:* ${submittedRequest.deliveryAddress || 'Standard Collection'}\n` +
                `*Items Requested:*\n${submittedRequest.items.map((it, idx) => `  ${idx + 1}. ${it.name || 'UK Item'} x${it.quantity}${it.brand ? ` (${it.brand})` : ''}${it.specs ? ` - Note: ${it.specs}` : ''}`).join('\n')}\n` +
                `*Target Budget:* ${submittedRequest.budget}\n` +
                `----------------------------------------\n` +
                `Please confirm receipt and send landed quote in Naira!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>Forward Order to UK Sourcing Team via WhatsApp (Instant Receipt)</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => onOpenTrackView(submittedRequest.id)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Track Request & View Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSubmittedRequest(null)}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs sm:text-sm transition cursor-pointer"
              >
                Submit Another Product
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Your request reference is permanently saved. You can track progress anytime under the Track tab.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero: Customer Facing Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-medium mb-4 shadow-sm">
          <span>🇬🇧 UK2Naija</span>
          <span className="text-slate-400">➔</span>
          <span>🇳🇬 Nigeria</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-emerald-300">Live Concierge</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          What would you like us to find?
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8">
          Quality products, sourced directly from the UK, with a personal touch. You request it, we source, verify, and
          deliver to your door in Nigeria.
        </p>

        {/* Tell us what you're looking for - Quick Search Box */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleQuickSearchSubmit} className="relative shadow-md rounded-2xl">
            <div className="flex items-center bg-white border-2 border-slate-900 rounded-2xl overflow-hidden p-1.5">
              <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={quickSearchInput}
                onChange={(e) => setQuickSearchInput(e.target.value)}
                placeholder="Product name, brand, model or paste a UK store link..."
                className="w-full py-2.5 px-2 text-slate-800 placeholder-slate-400 text-sm sm:text-base focus:outline-none"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 shrink-0 transition"
              >
                <span>Find Product</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
            <span className="text-slate-400">Example:</span>
            <button
              onClick={() => {
                setQuickSearchInput('Original Apple AirPods Pro 2');
              }}
              className="text-slate-700 hover:underline hover:text-slate-900 font-medium"
            >
              Original Apple AirPods Pro 2
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setQuickSearchInput('Aptamil Profutura 1 First Infant Milk');
              }}
              className="text-slate-700 hover:underline hover:text-slate-900 font-medium"
            >
              Boots Aptamil Milk
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setQuickSearchInput('Clarks Originals Desert Boots');
              }}
              className="text-slate-700 hover:underline hover:text-slate-900 font-medium"
            >
              Clarks Desert Boots
            </button>
          </div>
        </div>

        {/* Popular Category Inspiration Pills */}
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Browse Popular Categories
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 max-w-3xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setCategory(cat.name);
                  const el = document.getElementById('request-form-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col items-start ${
                  category === cat.name
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl mb-1">{cat.icon}</span>
                <span className="text-xs font-medium leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Need help finding something? WhatsApp bar */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-900">
          <span className="font-medium">Need help finding something?</span>
          <span className="text-slate-500">Send us a product link, photo or description on WhatsApp.</span>
          <a
            href="https://wa.me/447700900123?text=Hello%20UK%20Source!%20I%20need%20help%20finding%20a%20product%20from%20the%20UK%20to%20Nigeria."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 underline ml-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat with UK Assistant</span>
          </a>
        </div>
      </div>

      {/* Recommended UK Sites Directory Callout Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 mb-8 border border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Explore Some UK Retailers</span>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                M&S · Next · Boots · John Lewis
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5 max-w-xl">
              Need inspiration? Browse trusted British stores to discover items of interest, or tell us what you'd like
              us to source and buy.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenRecommendedSitesTab}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
        >
          <span>Browse Some Retailers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected Sourcing Store Banner (if user came from recommended sites directory) */}
      {initialStore && (
        <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs tracking-wider shrink-0 shadow-xs">
              {initialStore.logoText || 'UK'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Sourcing from {initialStore.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Store Pre-selected
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Browse {initialStore.name} to find your exact color, size, or style, then paste the link or details below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a
              href={initialStore.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 transition shadow-2xs"
            >
              <span>Open {initialStore.name.split(' (')[0]}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            {onClearInitialStore && (
              <button
                type="button"
                onClick={onClearInitialStore}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-emerald-100/60 transition"
                title="Clear selected store"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fast Preset Samples Showcase */}
      <div className="bg-slate-100 rounded-2xl p-5 mb-8 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Popular Sourced Products from the UK
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click to autofill request form</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {POPULAR_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-900 text-left transition group shadow-xs hover:shadow-sm"
            >
              <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 line-clamp-1 mb-1">
                {preset.title}
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-2 mb-2">{preset.specs}</div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{preset.brand}</span>
                <span className="text-emerald-700 group-hover:underline">Use preset →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* The Guided Product Request Form Section */}
      <div id="request-form-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">

        <div className="border-b border-slate-200 pb-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Demand-Led Sourcing
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">Submit Your Product Request</h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Tell us what you need. No account creation required to request a quote.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySampleRequest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition"
              title="Copy request text to clipboard for WhatsApp or personal notes"
            >
              {copyFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Sample Request</span>
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. What category best describes this item?
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                    category === cat.name
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: The Requested Items List (Allows multiple items!) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. What products are you looking for?
              </label>
              {items.length > 1 && (
                <span className="text-xs text-slate-500">
                  {items.length} items bundled (one consolidated shipment)
                </span>
              )}
            </div>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 relative transition focus-within:border-slate-400"
              >
                {/* Header of Item block */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Item {index + 1} {item.name ? `— ${item.name}` : ''}
                    </span>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Remove this item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* "I don't know exactly what it's called" toggle */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => handleUpdateItem(index, 'dontKnowName', !item.dontKnowName)}
                    className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                      item.dontKnowName
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {item.dontKnowName
                        ? '✓ "I don\'t know exactly what it\'s called" Mode Active'
                        : "I don't know exactly what it's called (upload picture or describe)"}
                    </span>
                  </button>
                </div>

                {/* If user knows the product name */}
                {!item.dontKnowName ? (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                    <div className="sm:col-span-8">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Product Name / Description *
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        placeholder="e.g. Apple AirPods Pro 2, Boots Aptamil Milk, Clarks Desert Boots"
                        className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Preferred Brand (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.brand || ''}
                        onChange={(e) => handleUpdateItem(index, 'brand', e.target.value)}
                        placeholder="e.g. Apple, Boots, Nike"
                        className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  /* "I don't know what it's called" specific guided fields */
                  <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 mb-3 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Explain what you need it to do or what it looks like:
                      </label>
                      <textarea
                        rows={2}
                        value={item.whatItDoesOrLooksLike || ''}
                        onChange={(e) => {
                          handleUpdateItem(index, 'whatItDoesOrLooksLike', e.target.value);
                          if (!item.name) handleUpdateItem(index, 'name', e.target.value.slice(0, 40));
                        }}
                        placeholder="e.g. 'I saw a pump lotion for baby eczema in a UK video', or 'A UK 3-pin fast charger for Dell laptop', or 'The red leather driving shoes sold in John Lewis'..."
                        className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Photo link or upload image URL (from WhatsApp or Screenshot):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.photoUrl || ''}
                          onChange={(e) => handleUpdateItem(index, 'photoUrl', e.target.value)}
                          placeholder="Paste image URL (or upload below)"
                          className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Preset sample photo for testing
                            handleUpdateItem(
                              index,
                              'photoUrl',
                              'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60'
                            );
                          }}
                          className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 text-[11px] font-medium rounded-lg shrink-0 transition"
                        >
                          Use Sample Photo
                        </button>
                      </div>
                      {item.photoUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={item.photoUrl}
                            alt="Reference"
                            className="w-12 h-12 object-cover rounded-md border border-amber-300"
                          />
                          <span className="text-[11px] text-amber-800">
                            Photo attached. Our UK team will identify the authentic UK brand for you.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Specs and Link */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Quantity</label>
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-full text-center text-xs font-semibold text-slate-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(index, 'quantity', item.quantity + 1)}
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Specifications (Size, Colour, Model, UK Plug)
                    </label>
                    <input
                      type="text"
                      value={item.specs || ''}
                      onChange={(e) => handleUpdateItem(index, 'specs', e.target.value)}
                      placeholder="e.g. Size UK 9, 230V UK 3-pin plug, Midnight Black"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      UK Retailer Link (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={item.referenceUrl || ''}
                        onChange={(e) => handleUpdateItem(index, 'referenceUrl', e.target.value)}
                        placeholder="e.g. boots.com/..., apple.com/uk/..."
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 pr-7"
                      />
                      {item.referenceUrl && (
                        <a
                          href={item.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Button to add another item in this request */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-slate-900 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add another product to this request (Bundle shipping & save fees)</span>
            </button>
          </div>

          {/* Step 3: Approximate Budget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Your approximate budget (Optional)
              </label>
              <span className="text-xs text-slate-400">Helps us select the right UK retailer</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'flexible', label: 'Flexible – recommend best' },
                { id: 'under50', label: 'Under £50' },
                { id: '50-150', label: '£50 – £150' },
                { id: '150-500', label: '£150 – £500' },
                { id: 'over500', label: 'Over £500' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setBudget(opt.id as BudgetOption)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition ${
                    budget === opt.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Customer Details for Quotation & Delivery */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              4. Where should we send your quotation & delivery?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Amina Bello / Femi Alabi"
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  WhatsApp Phone Number (For Quote) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Destination in Nigeria *</label>
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                >
                  <option value="Lagos (Lekki / Victoria Island)">Lagos (Lekki / Victoria Island)</option>
                  <option value="Lagos (Ikeja / Mainland Hub)">Lagos (Ikeja / Mainland Hub)</option>
                  <option value="Abuja (Maitama / Wuse / Central)">Abuja (Maitama / Wuse / Central)</option>
                  <option value="Port Harcourt (GRA / Rivers)">Port Harcourt (GRA / Rivers)</option>
                  <option value="Ibadan (Bodija / Jericho)">Ibadan (Bodija / Jericho)</option>
                  <option value="Other Nigerian City (Courier Dispatch)">Other Nigerian City</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Street Address or Nearest Landmark (Optional)
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. Admiralty Way, Lekki Phase 1 / Aguiyi Ironsi St, Maitama"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Submit Button & Reassurance */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Product Request to UK Sourcing Team</span>
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </button>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs text-slate-500">
              <div className="flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero purchase commitment before quote</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pay in Naira (no UK card needed)</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Photo inspection before flight</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
