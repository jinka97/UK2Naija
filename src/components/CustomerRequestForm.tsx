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
import { getBenchmarkFxRate, subscribeFxState, FxRateState } from '../services/fxService';
import { UK2NaijaLogo } from './UK2NaijaLogo';

interface CustomerRequestFormProps {
  onRequestSubmitted: (newRequest: CustomerRequest) => void;
  onOpenTrackView: (requestId: string) => void;
  onOpenRecommendedSitesTab: () => void;
  initialStore?: RecommendedStore | null;
  initialItemName?: string;
  onClearInitialStore?: () => void;
}

const CATEGORIES_UK_TO_NG = [
  { name: 'Fashion & Accessories', icon: '👞', examples: 'Next UK, Marks & Spencer, Clarks UK, Ralph Lauren' },
  { name: 'Kids & School Stationery', icon: '🎒', examples: 'Smiggle backpacks, lunchboxes, school uniforms' },
  { name: 'Designer Clearance & Luxury', icon: '💎', examples: 'TK Maxx fragrances, designer bags, Le Creuset' },
  { name: 'Beauty & Skincare', icon: '✨', examples: 'Boots Soltan, CeraVe UK, The Ordinary, Elemis' },
  { name: 'Electronics & Audio', icon: '🎧', examples: 'AirPods Pro, MacBook Air, Sony WH-1000XM5, Dyson' },
  { name: 'Baby & Infant Care', icon: '🍼', examples: 'Aptamil Profutura, Kendamil, Cow & Gate, NUK' },
];

const CATEGORIES_NG_TO_UK = [
  { name: 'Foodstuffs & Spices', icon: '🍲', examples: 'Poundo yam, crayfish, dry catfish, ogbono, egusi, palm oil' },
  { name: 'African Attire & Aso Oke', icon: '👑', examples: 'Hand-woven Aso Oke, bespoke Agbada, Ankara lace, Gele' },
  { name: 'Natural Beauty & Herbal', icon: '🌿', examples: 'Organic raw shea butter, Dudu-Osun black soap, Zobo/hibiscus' },
  { name: 'Arts, Crafts & Cultural', icon: '🏺', examples: 'Traditional wooden carvings, coral wedding beads, bespoke gifts' },
  { name: 'Books & Educational', icon: '📚', examples: 'African literature, vernacular textbooks, university transcripts' },
];

const POPULAR_PRESETS_UK_TO_NG = [
  {
    category: 'Kids & School Stationery',
    title: 'Smiggle Hardtop Scented Pencil Case & Double Decker Lunchbox',
    brand: 'Smiggle UK',
    qty: 1,
    budget: '50-150' as BudgetOption,
    specs: 'Original UK store release. Embossed character hardtop case & insulated lunchbox with strap.',
    url: 'https://www.smiggle.co.uk',
  },
  {
    category: 'Fashion & Accessories',
    title: 'Next UK Pure Cotton School Uniforms & Multipack Rompers',
    brand: 'Next UK',
    qty: 2,
    budget: '50-150' as BudgetOption,
    specs: 'Age 4-12 years. Teflon stain-resistant finish, pure breathable British cotton stitching.',
    url: 'https://www.next.co.uk',
  },
  {
    category: 'Designer Clearance & Luxury',
    title: 'TK Maxx UK Designer Fragrance & Luxury Handbag Sourcing',
    brand: 'TK Maxx UK',
    qty: 1,
    budget: '50-150' as BudgetOption,
    specs: 'Authentic designer fragrance (Chanel/Dior/Tom Ford) or genuine leather handbag at clearance rate.',
    url: 'https://www.tkmaxx.com',
  },
  {
    category: 'Electronics & Audio',
    title: 'Apple AirPods Pro (2nd Generation with MagSafe USB-C)',
    brand: 'Apple',
    qty: 1,
    budget: '150-500' as BudgetOption,
    specs: 'UK retail specification. Official Apple paper VAT receipt with serial number included.',
    url: 'https://www.apple.com/uk/airpods-pro/',
  },
  {
    category: 'Baby & Infant Care',
    title: 'Aptamil Profutura 1 First Infant Milk (800g x 4 tins)',
    brand: 'Boots / Aptamil UK',
    qty: 4,
    budget: '50-150' as BudgetOption,
    specs: 'Stage 1 (0-6 months). Fresh UK batch with intact tamper foil and 14+ months expiry.',
    url: 'https://www.boots.com/aptamil-profutura-first-infant-milk-800g',
  },
  {
    category: 'Fashion & Accessories',
    title: 'Clarks Originals Suede Desert Boots (Beeswax or Cola)',
    brand: 'Clarks UK',
    qty: 1,
    budget: '50-150' as BudgetOption,
    specs: 'UK Size 9.5 (EU 44). Classic natural crepe sole with authentic Clarks branded tags.',
    url: 'https://www.clarks.co.uk',
  },
];

const POPULAR_PRESETS_NG_TO_UK = [
  {
    category: 'Foodstuffs & Spices',
    title: 'Authentic Nigerian Foodstuff Bundle (Poundo, Crayfish, Dried Fish)',
    brand: 'Nigerian Market Sourcing',
    qty: 1,
    budget: '50-150' as BudgetOption,
    specs: '5kg Ayoola Poundo Yam, 1kg peeled crayfish, 1kg dried smoked catfish, 1kg melon seeds (egusi). Vacuum-sealed & phytosanitary pre-cleared for UK entry.',
    url: '',
  },
  {
    category: 'African Attire & Aso Oke',
    title: 'Custom Hand-Woven Aso Oke Wedding Outfit & Gele Head-tie',
    brand: 'Iseyin / Oyo Heritage Weavers',
    qty: 1,
    budget: '150-500' as BudgetOption,
    specs: 'Complete couple wedding ensemble: bespoke embroidered Agbada and matching Gele & Ipele set.',
    url: '',
  },
  {
    category: 'Natural Beauty & Herbal',
    title: 'Pure Organic Raw Shea Butter (2kg) & Natural Black Soap',
    brand: 'Kwara / Niger State Natural Co-op',
    qty: 2,
    budget: 'under50' as BudgetOption,
    specs: 'Grade-A unrefined yellow shea butter, 100% natural Dudu-Osun cold-pressed soap.',
    url: '',
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
  const [tradeCorridor, setTradeCorridor] = useState<'uk-to-ng' | 'ng-to-uk'>('uk-to-ng');
  const [category, setCategory] = useState<string>('Fashion & Accessories');
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

  // Dynamic FX Benchmark listener
  const [fxState, setFxState] = useState<FxRateState>(() => ({
    rate: getBenchmarkFxRate(),
    marketRate: getBenchmarkFxRate(),
    bufferPercent: 2.5,
    lastUpdated: '',
    source: 'cached',
    status: 'idle',
  }));

  useEffect(() => {
    return subscribeFxState((state) => {
      setFxState(state);
    });
  }, []);

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

  const activeCategories = tradeCorridor === 'uk-to-ng' ? CATEGORIES_UK_TO_NG : CATEGORIES_NG_TO_UK;
  const activePresets = tradeCorridor === 'uk-to-ng' ? POPULAR_PRESETS_UK_TO_NG : POPULAR_PRESETS_NG_TO_UK;

  const handleApplyPreset = (preset: (typeof POPULAR_PRESETS_UK_TO_NG)[0] | (typeof POPULAR_PRESETS_NG_TO_UK)[0]) => {
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
      corridor: tradeCorridor,
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
                <strong className="text-slate-900">Live FX Benchmark:</strong> £1.00 = ₦
                {fxState.rate.toLocaleString()} (No UK card required · 100% transparent Naira settlement)
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
        <div className="mb-5 flex justify-center">
          <UK2NaijaLogo size="md" />
        </div>

        {/* Bidirectional Corridor Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner mb-6">
          <button
            type="button"
            onClick={() => {
              setTradeCorridor('uk-to-ng');
              setCategory(CATEGORIES_UK_TO_NG[0].name);
              setDeliveryCity('Lagos (Lekki / Ikoyi / Victoria Island)');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              tradeCorridor === 'uk-to-ng'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🇬🇧 ➔ 🇳🇬</span>
            <span>UK to Nigeria (Sourcing)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTradeCorridor('ng-to-uk');
              setCategory(CATEGORIES_NG_TO_UK[0].name);
              setDeliveryCity('London (Greater London Hub & Doorstep)');
            }}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              tradeCorridor === 'ng-to-uk'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🇳🇬 ➔ 🇬🇧</span>
            <span>Nigeria to UK (Diaspora Export)</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {tradeCorridor === 'uk-to-ng'
            ? 'What would you like us to find in the UK?'
            : 'What Nigerian goods do you want delivered to the UK?'}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8">
          {tradeCorridor === 'uk-to-ng'
            ? 'Quality products, sourced directly from verified UK merchants, with a personal touch. You request it, we source, verify, and deliver to your door in Nigeria.'
            : 'Authentic Nigerian foodstuffs, native spices, Aso Oke, bespoke attire, and cultural essentials procured in Nigeria and delivered to your UK doorstep.'}
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
            {activeCategories.map((cat) => (
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
            href="https://wa.me/447700900123?text=Hello%20UK2Naija!%20I%20need%20help%20finding%20a%20product%20from%20the%20UK%20to%20Nigeria."
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
                Smiggle · Next · TK Maxx · M&S · Boots · Apple
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
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`min-w-[70px] max-w-[85px] h-10 px-2 rounded-xl ${
                initialStore.accentColor
                  ? `bg-gradient-to-br ${initialStore.accentColor}`
                  : 'bg-gradient-to-br from-slate-950 to-slate-800'
              } text-white font-black flex items-center justify-center ${
                (initialStore.logoText || initialStore.name).length > 8
                  ? 'text-[8.5px]'
                  : (initialStore.logoText || initialStore.name).length > 5
                  ? 'text-[10px]'
                  : 'text-xs'
              } tracking-tight shrink-0 shadow-xs border border-white/10 uppercase select-none`}
            >
              <span className="truncate">{initialStore.logoText || 'UK'}</span>
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
              {tradeCorridor === 'uk-to-ng' ? 'Popular Sourced Products from the UK' : 'Popular Diaspora Exports from Nigeria'}
            </h3>
          </div>
          <span className="text-xs text-slate-500">Click to autofill request form</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activePresets.map((preset, idx) => (
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
              {activeCategories.map((cat) => (
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
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {tradeCorridor === 'uk-to-ng' ? 'Destination in Nigeria *' : 'Delivery Destination in the UK *'}
                </label>
                {tradeCorridor === 'uk-to-ng' ? (
                  <>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                    >
                      <optgroup label="Northern Nigeria Hubs">
                        <option value="Kano (Bompai / Nassarawa / Kano State)">Kano (Bompai / Nassarawa / Kano State)</option>
                        <option value="Kaduna (Kaduna North / Barnawa / Kaduna State)">Kaduna (Kaduna North / Barnawa / Kaduna State)</option>
                        <option value="Jos (Rayfield / Jos North / Plateau State)">Jos (Rayfield / Jos North / Plateau State)</option>
                        <option value="Zaria (Samaru / Zaria City / Kaduna State)">Zaria (Samaru / Zaria City / Kaduna State)</option>
                        <option value="Minna (Tunga / Chanchaga / Niger State)">Minna (Tunga / Chanchaga / Niger State)</option>
                        <option value="Sokoto (Sokoto Central / GRA / Sokoto State)">Sokoto (Sokoto Central / GRA / Sokoto State)</option>
                        <option value="Ilorin (GRA / Tanke / Kwara State)">Ilorin (GRA / Tanke / Kwara State)</option>
                        <option value="Maiduguri (GRA / Borno State Hub)">Maiduguri (GRA / Borno State Hub)</option>
                        <option value="Katsina (Katsina Central / GRA)">Katsina (Katsina Central / GRA)</option>
                        <option value="Bauchi (Bauchi Central / GRA)">Bauchi (Bauchi Central / GRA)</option>
                        <option value="Yola / Jimeta (Adamawa State)">Yola / Jimeta (Adamawa State)</option>
                      </optgroup>
                      <optgroup label="Federal Capital Territory (FCT)">
                        <option value="Abuja (Maitama / Wuse II / Asokoro)">Abuja (Maitama / Wuse II / Asokoro)</option>
                        <option value="Abuja (Garki / CBD / Central Area)">Abuja (Garki / CBD / Central Area)</option>
                        <option value="Abuja (Gwarinpa / Life Camp / Jabi)">Abuja (Gwarinpa / Life Camp / Jabi)</option>
                        <option value="Abuja (Kubwa / Lugbe Airport Rd)">Abuja (Kubwa / Lugbe Airport Rd)</option>
                      </optgroup>
                      <optgroup label="South West Hubs">
                        <option value="Lagos (Lekki / Ikoyi / Victoria Island)">Lagos (Lekki / Ikoyi / Victoria Island)</option>
                        <option value="Lagos (Ikeja GRA / Maryland / Mainland)">Lagos (Ikeja GRA / Maryland / Mainland)</option>
                        <option value="Lagos (Surulere / Yaba Tech Hub)">Lagos (Surulere / Yaba Tech Hub)</option>
                        <option value="Ibadan (Bodija / Jericho / Oyo State)">Ibadan (Bodija / Jericho / Oyo State)</option>
                        <option value="Abeokuta (GRA / Ibara / Ogun State)">Abeokuta (GRA / Ibara / Ogun State)</option>
                        <option value="Akure (Alagbaka / Ondo State)">Akure (Alagbaka / Ondo State)</option>
                      </optgroup>
                      <optgroup label="South South & South East Hubs">
                        <option value="Port Harcourt (GRA / Trans-Amadi / Rivers)">Port Harcourt (GRA / Trans-Amadi / Rivers)</option>
                        <option value="Enugu (Independence Layout / Enugu State)">Enugu (Independence Layout / Enugu State)</option>
                        <option value="Benin City (GRA / Airport Rd / Edo State)">Benin City (GRA / Airport Rd / Edo State)</option>
                        <option value="Warri / Asaba (Delta State)">Warri / Asaba (Delta State)</option>
                        <option value="Calabar (Marian / Cross River)">Calabar (Marian / Cross River)</option>
                        <option value="Uyo (Ewet Housing / Akwa Ibom)">Uyo (Ewet Housing / Akwa Ibom)</option>
                        <option value="Owerri (Ikenegbu / Imo State)">Owerri (Ikenegbu / Imo State)</option>
                      </optgroup>
                      <optgroup label="Nationwide Courier Coverage">
                        <option value="Other Nigerian City (Direct Courier Waybill)">Other Nigerian City (Direct Courier Waybill)</option>
                      </optgroup>
                    </select>

                    {/* Quick-Pick Destination Pills */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium mr-0.5">Quick pick:</span>
                      {[
                        { label: 'Kano', val: 'Kano (Bompai / Nassarawa / Kano State)' },
                        { label: 'Kaduna', val: 'Kaduna (Kaduna North / Barnawa / Kaduna State)' },
                        { label: 'Jos', val: 'Jos (Rayfield / Jos North / Plateau State)' },
                        { label: 'Abuja', val: 'Abuja (Maitama / Wuse II / Asokoro)' },
                        { label: 'Lagos', val: 'Lagos (Lekki / Ikoyi / Victoria Island)' },
                        { label: 'Minna', val: 'Minna (Tunga / Chanchaga / Niger State)' },
                        { label: 'Ilorin', val: 'Ilorin (GRA / Tanke / Kwara State)' },
                        { label: 'Sokoto', val: 'Sokoto (Sokoto Central / GRA / Sokoto State)' },
                        { label: 'PH', val: 'Port Harcourt (GRA / Trans-Amadi / Rivers)' },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => setDeliveryCity(chip.val)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                            deliveryCity.startsWith(chip.label)
                              ? 'bg-slate-900 text-white border-slate-900 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                    >
                      <optgroup label="Greater London & Surrounds">
                        <option value="London (Greater London Hub & Doorstep)">London (Greater London Hub & Doorstep)</option>
                        <option value="London (South London / Croydon / Lewisham / Greenwich)">London (South London / Croydon / Lewisham / Greenwich)</option>
                        <option value="London (North & East London / Hackney / Stratford / Ilford)">London (North & East London / Hackney / Stratford / Ilford)</option>
                        <option value="London (West London / Heathrow / Hounslow / Wembley)">London (West London / Heathrow / Hounslow / Wembley)</option>
                      </optgroup>
                      <optgroup label="Midlands & North">
                        <option value="Birmingham (West Midlands / Coventry / Solihull)">Birmingham (West Midlands / Coventry / Solihull)</option>
                        <option value="Manchester (Greater Manchester / Salford / Trafford)">Manchester (Greater Manchester / Salford / Trafford)</option>
                        <option value="Leeds (West Yorkshire / Bradford)">Leeds (West Yorkshire / Bradford)</option>
                        <option value="Milton Keynes (Buckinghamshire / Bedford / Luton)">Milton Keynes (Buckinghamshire / Bedford / Luton)</option>
                        <option value="Liverpool (Merseyside / North West)">Liverpool (Merseyside / North West)</option>
                        <option value="Sheffield (South Yorkshire)">Sheffield (South Yorkshire)</option>
                      </optgroup>
                      <optgroup label="Scotland & Wales">
                        <option value="Glasgow / Edinburgh (Scotland Metro Hub)">Glasgow / Edinburgh (Scotland Metro Hub)</option>
                        <option value="Cardiff / Swansea (Wales)">Cardiff / Swansea (Wales)</option>
                      </optgroup>
                      <optgroup label="UK-Wide Direct Dispatch">
                        <option value="Other UK Postcode (Royal Mail / DPD Tracked 24/48)">Other UK Postcode (Royal Mail / DPD Tracked 24/48)</option>
                      </optgroup>
                    </select>

                    {/* Quick-Pick Destination Pills */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium mr-0.5">Quick pick:</span>
                      {[
                        { label: 'London', val: 'London (Greater London Hub & Doorstep)' },
                        { label: 'Birmingham', val: 'Birmingham (West Midlands / Coventry / Solihull)' },
                        { label: 'Manchester', val: 'Manchester (Greater Manchester / Salford / Trafford)' },
                        { label: 'Leeds', val: 'Leeds (West Yorkshire / Bradford)' },
                        { label: 'Milton Keynes', val: 'Milton Keynes (Buckinghamshire / Bedford / Luton)' },
                        { label: 'Glasgow', val: 'Glasgow / Edinburgh (Scotland Metro Hub)' },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => setDeliveryCity(chip.val)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                            deliveryCity.startsWith(chip.label)
                              ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
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
