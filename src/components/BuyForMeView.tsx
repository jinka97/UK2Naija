import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { CustomerRequest, ProductItem, BudgetOption } from '../types';
import { createNewRequest, BENCHMARK_FX_RATE } from '../services/storage';
import { getBenchmarkFxRate } from '../services/fxService';

interface BuyForMeViewProps {
  onRequestSubmitted: (newRequest: CustomerRequest) => void;
  onOpenTrackView: (requestId: string) => void;
  initialEstimate?: {
    category: string;
    ukPriceGbp: number;
    weightKg: number;
    deliveryCity: string;
    totalNgn: number;
  } | null;
}

interface ParsedProduct {
  storeName: string;
  storeDomain: string;
  title: string;
  priceGbp: number;
  category: string;
  imageUrl?: string;
  availableSizes?: string[];
  availableColors?: string[];
}

const SAMPLE_STORE_LINKS = [
  {
    label: 'ASOS UK (Nike Air Max)',
    url: 'https://www.asos.com/nike/nike-air-max-90-trainers-in-white/prd/204812301',
    data: {
      storeName: 'ASOS UK',
      storeDomain: 'asos.com',
      title: 'Nike Air Max 90 Triple White Leather Trainers',
      priceGbp: 135.0,
      category: 'Fashion, Shoes & Trainers',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
      availableSizes: ['UK 6 (EU 40)', 'UK 7 (EU 41)', 'UK 8 (EU 42.5)', 'UK 9 (EU 44)', 'UK 10 (EU 45)'],
      availableColors: ['Triple White', 'Black / Infrared', 'Navy / Wolf Grey'],
    },
  },
  {
    label: 'Amazon UK (AirPods Pro)',
    url: 'https://www.amazon.co.uk/Apple-AirPods-Generation-MagSafe-Case/dp/B0CHWRXH8B',
    data: {
      storeName: 'Amazon UK',
      storeDomain: 'amazon.co.uk',
      title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)',
      priceGbp: 199.0,
      category: 'Electronics & Gadgets',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
      availableSizes: ['Standard One Size'],
      availableColors: ['White (Official Apple)'],
    },
  },
  {
    label: 'Smiggle UK (Backpack & Case)',
    url: 'https://www.smiggle.co.uk/shop/en/smiggle/backpacks/express-backpack',
    data: {
      storeName: 'Smiggle UK',
      storeDomain: 'smiggle.co.uk',
      title: 'Smiggle Express Character Double Pocket School Backpack & Hardtop Case',
      priceGbp: 48.0,
      category: 'Kids, School & Smiggle Bags',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
      availableSizes: ['Standard School Size (18L)'],
      availableColors: ['Navy Galaxy Lights', 'Lilac Unicorn Shimmer', 'Teal Game Over'],
    },
  },
  {
    label: 'Boots UK (Aptamil Formula)',
    url: 'https://www.boots.com/aptamil-profutura-first-infant-milk-800g',
    data: {
      storeName: 'Boots UK',
      storeDomain: 'boots.com',
      title: 'Aptamil Profutura 1 First Infant Milk (800g - Pack of 4 Tins)',
      priceGbp: 64.0,
      category: 'Baby & Infant Formula',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      availableSizes: ['4x 800g Tins Bundle'],
      availableColors: ['Stage 1 (0-6 Months)'],
    },
  },
  {
    label: 'TK Maxx UK (Designer Bag)',
    url: 'https://www.tkmaxx.com/uk/en/women/handbags/leather-crossbody',
    data: {
      storeName: 'TK Maxx UK',
      storeDomain: 'tkmaxx.com',
      title: 'Designer Italian Saffiano Leather Crossbody Bag (Clearance Gold Seal)',
      priceGbp: 79.99,
      category: 'Designer Clearance & Luxury',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60',
      availableSizes: ['Medium Handbag (28cm)'],
      availableColors: ['Cognac Tan', 'Classic Black', 'Burgundy Wine'],
    },
  },
];

export const BuyForMeView: React.FC<BuyForMeViewProps> = ({
  onRequestSubmitted,
  onOpenTrackView,
  initialEstimate,
}) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedItem, setExtractedItem] = useState<ParsedProduct | null>(null);

  // Form attributes for extracted item
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Cart of items to buy
  const [cartItems, setCartItems] = useState<ProductItem[]>([]);

  // Customer contact details
  const [customerName, setCustomerName] = useState<string>('');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('+234 ');
  const [deliveryCity, setDeliveryCity] = useState<string>(
    initialEstimate?.deliveryCity || 'Lagos (Lekki / Ikoyi / Victoria Island)'
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');

  // Success state
  const [submittedOrder, setSubmittedOrder] = useState<CustomerRequest | null>(null);

  const fxRate = getBenchmarkFxRate();

  const handleExtractUrl = (urlToParse: string) => {
    if (!urlToParse.trim()) return;

    setIsExtracting(true);
    // Simulate intelligent URL parsing
    setTimeout(() => {
      // Find matching sample or construct generic product from domain
      const foundSample = SAMPLE_STORE_LINKS.find((s) =>
        urlToParse.toLowerCase().includes(s.data.storeDomain)
      );

      if (foundSample) {
        setExtractedItem(foundSample.data);
        setSelectedSize(foundSample.data.availableSizes?.[0] || 'Standard');
        setSelectedColor(foundSample.data.availableColors?.[0] || 'Original');
      } else {
        // Construct smart parsed product
        let inferredStore = 'UK Retailer';
        try {
          const urlObj = new URL(urlToParse.startsWith('http') ? urlToParse : `https://${urlToParse}`);
          inferredStore = urlObj.hostname.replace('www.', '').split('.')[0].toUpperCase() + ' UK';
        } catch {
          inferredStore = 'Verified UK Merchant';
        }

        const fallbackItem: ParsedProduct = {
          storeName: inferredStore,
          storeDomain: 'uk-retailer.co.uk',
          title: `Item from ${inferredStore}`,
          priceGbp: initialEstimate?.ukPriceGbp || 75.0,
          category: initialEstimate?.category || 'General UK Sourcing',
          imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&auto=format&fit=crop&q=60',
          availableSizes: ['UK Standard Size', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'Custom / Enter Below'],
          availableColors: ['Default Store Colour', 'Black', 'White', 'Custom / Enter Below'],
        };
        setExtractedItem(fallbackItem);
        setSelectedSize(fallbackItem.availableSizes![0]);
        setSelectedColor(fallbackItem.availableColors![0]);
      }
      setIsExtracting(false);
    }, 600);
  };

  const handleAddExtractedToCart = () => {
    if (!extractedItem) return;

    const specsParts = [
      `Selected Size: ${selectedSize}`,
      `Selected Colour: ${selectedColor}`,
      customInstructions ? `Notes: ${customInstructions}` : '',
    ].filter(Boolean);

    const newItem: ProductItem = {
      id: 'item-' + Date.now(),
      name: extractedItem.title,
      brand: extractedItem.storeName,
      quantity,
      specs: specsParts.join(' | '),
      referenceUrl: urlInput || `https://${extractedItem.storeDomain}`,
      photoUrl: extractedItem.imageUrl,
    };

    setCartItems((prev) => [...prev, newItem]);
    setExtractedItem(null);
    setUrlInput('');
    setCustomInstructions('');
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit Buy For Me Request
  const handleSubmitBuyForMe = (e: React.FormEvent) => {
    e.preventDefault();

    let itemsToSubmit = [...cartItems];
    // If user currently has an extracted item open, automatically include it
    if (extractedItem) {
      const specsParts = [
        `Selected Size: ${selectedSize}`,
        `Selected Colour: ${selectedColor}`,
        customInstructions ? `Notes: ${customInstructions}` : '',
      ].filter(Boolean);

      itemsToSubmit.push({
        id: 'item-' + Date.now(),
        name: extractedItem.title,
        brand: extractedItem.storeName,
        quantity,
        specs: specsParts.join(' | '),
        referenceUrl: urlInput || `https://${extractedItem.storeDomain}`,
        photoUrl: extractedItem.imageUrl,
      });
    }

    if (itemsToSubmit.length === 0) {
      alert('Please paste a product URL or add at least one item.');
      return;
    }

    const newReq = createNewRequest({
      corridor: 'uk-to-ng',
      customerName: customerName.trim() || 'Valued Shopper',
      whatsappPhone: whatsappPhone.trim(),
      deliveryCity,
      deliveryAddress: deliveryAddress.trim(),
      category: itemsToSubmit[0].brand || 'UK Buy For Me',
      items: itemsToSubmit,
      budget: '50-150' as BudgetOption,
    });

    setSubmittedOrder(newReq);
    onRequestSubmitted(newReq);
  };

  if (submittedOrder) {
    const whatsappText = encodeURIComponent(
      `Hello Jamlu! I just submitted a "Buy For Me" request (#${submittedOrder.id}) for: ${submittedOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}. Please issue my quotation in Naira.`
    );
    const whatsappUrl = `https://wa.me/447700900123?text=${whatsappText}`;

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-[#102B2A] text-[#D9B77A] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-[#D9B77A] mb-1 block">
            Buy For Me Sourcing Request Received
          </span>

          <h2 className="text-2xl font-extrabold text-[#102B2A] mb-2">
            Order Reference: {submittedOrder.id}
          </h2>

          <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">
            Our London team is currently verifying stock, in-store availability, and current promotions. Your formal landed Naira quotation will be generated in under 2 hours.
          </p>

          {/* Sourced items preview */}
          <div className="bg-stone-50 rounded-xl p-4 text-left border border-stone-200 mb-6 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500">Requested Items ({submittedOrder.items.length})</div>
            {submittedOrder.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-200/60 last:border-0">
                <span className="font-medium text-stone-800 line-clamp-1">{it.quantity}x {it.name}</span>
                <span className="text-stone-500 shrink-0 ml-2">{it.brand}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-[#102B2A] hover:bg-[#1b3d3c] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Connect on WhatsApp for Quick Quote</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenTrackView(submittedOrder.id)}
              className="w-full sm:w-auto px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>View Tracking Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Editorial Header */}
      <div className="mb-8 text-center sm:text-left border-b border-stone-200/80 pb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#D9B77A] mb-1.5 flex items-center justify-center sm:justify-start gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-[#D9B77A]" />
          <span>Buy For Me · UK Concierge Shopping</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B2A] tracking-tight">
          Paste Any UK Store Link. We Buy & Deliver to Nigeria.
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1 max-w-2xl">
          Found something you love on ASOS, Amazon UK, John Lewis, Next, or Boots? Paste the URL below. We handle foreign payment with zero card limit restrictions, inspect your items in London, and deliver to your doorstep.
        </p>
      </div>

      {/* Step 1: URL Paste & Auto-Extractor Bar */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
          Paste UK Product Link (or Website URL)
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExtractUrl(urlInput);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://www.asos.com/nike/nike-air-max-90..."
              className="w-full pl-10 pr-4 py-3 bg-stone-50/60 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:border-[#102B2A] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isExtracting || !urlInput.trim()}
            className="px-6 py-3 bg-[#102B2A] hover:bg-[#1b3d3c] disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-xs"
          >
            {isExtracting ? (
              <span>Extracting Details...</span>
            ) : (
              <>
                <span>Extract Item</span>
                <Sparkles className="w-4 h-4 text-[#D9B77A]" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-stone-400 text-[11px] font-medium mr-1">Try sample links:</span>
          {SAMPLE_STORE_LINKS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => {
                setUrlInput(sample.url);
                handleExtractUrl(sample.url);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer font-medium"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Extracted Product Specification & Variant Picker */}
      {extractedItem && (
        <div className="bg-[#FAF8F5] rounded-2xl p-6 border-2 border-[#102B2A]/20 shadow-sm mb-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#102B2A] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Product Recognized from {extractedItem.storeName}</span>
            </span>
            <span className="text-xs font-mono font-bold bg-[#102B2A] text-[#D9B77A] px-2.5 py-1 rounded-lg">
              £{extractedItem.priceGbp.toFixed(2)} · ₦{(extractedItem.priceGbp * fxRate).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Preview */}
            <div className="md:col-span-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-white border border-stone-200">
                <img
                  src={extractedItem.imageUrl}
                  alt={extractedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Attributes Selector */}
            <div className="md:col-span-8 space-y-4">
              <h3 className="font-bold text-base text-[#102B2A]">{extractedItem.title}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Size Picker */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Select Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:border-[#102B2A]"
                  >
                    {extractedItem.availableSizes?.map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>

                {/* Colour Picker */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Select Colour / Style
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:border-[#102B2A]"
                  >
                    {extractedItem.availableColors?.map((clr) => (
                      <option key={clr} value={clr}>{clr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 font-bold focus:outline-none focus:border-[#102B2A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Specific Request / Instructions
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Include original shoe box and paper VAT receipt"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:border-[#102B2A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Item subtotal: <strong className="text-stone-800">£{(extractedItem.priceGbp * quantity).toFixed(2)} (₦{Math.round(extractedItem.priceGbp * quantity * fxRate).toLocaleString()})</strong>
                </span>
                <button
                  type="button"
                  onClick={handleAddExtractedToCart}
                  className="px-4 py-2 bg-[#102B2A] text-white text-xs font-bold rounded-xl hover:bg-[#1b3d3c] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Sourcing List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Summary if items added */}
      {cartItems.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Your UK Items Sourcing Queue ({cartItems.length})
            </h3>
            <span className="text-xs text-stone-500">You can paste more links above to add items</span>
          </div>

          <div className="space-y-3">
            {cartItems.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-stone-900">{item.name}</div>
                    <div className="text-[11px] text-stone-500">{item.specs}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{item.brand} · Qty: {item.quantity}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 transition cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Customer Information & Quotation Request */}
      <form onSubmit={handleSubmitBuyForMe} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="text-base font-bold text-[#102B2A]">Where Should We Send Your Naira Quotation?</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            No mandatory account creation. Quotes are sent via WhatsApp and stored securely to your private order reference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Femi Alabi / Amina Bello"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#102B2A] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              WhatsApp Number (For Instant Quote Delivery) *
            </label>
            <input
              type="text"
              required
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="+234 803 000 0000"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono focus:outline-none focus:border-[#102B2A] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Destination City in Nigeria *
            </label>
            <select
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#102B2A] focus:bg-white"
            >
              <option value="Lagos (Lekki / Ikoyi / Victoria Island)">Lagos (Lekki / Ikoyi / Victoria Island)</option>
              <option value="Lagos (Ikeja GRA / Maryland / Mainland)">Lagos (Ikeja GRA / Maryland / Mainland)</option>
              <option value="Abuja (Maitama / Wuse II / Asokoro)">Abuja (Maitama / Wuse II / Asokoro)</option>
              <option value="Kano (Bompai / Nassarawa / Kano State)">Kano (Bompai / Nassarawa / Kano State)</option>
              <option value="Kaduna (Kaduna North / Barnawa)">Kaduna (Kaduna North / Barnawa)</option>
              <option value="Jos (Rayfield / Jos North / Plateau)">Jos (Rayfield / Jos North / Plateau)</option>
              <option value="Port Harcourt (Trans-Amadi / GRA)">Port Harcourt (Trans-Amadi / GRA)</option>
              <option value="Ibadan (Bodija / Jericho / Oyo State)">Ibadan (Bodija / Jericho / Oyo State)</option>
              <option value="Other Nigerian City (Direct Courier Waybill)">Other Nigerian City (Direct Courier Waybill)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Street Delivery Address (Optional)
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. Admiralty Way, Lekki Phase 1"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#102B2A] focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-[#102B2A] hover:bg-[#1b3d3c] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <span>Request Official Landed Quotation (Free & Instant)</span>
            <ArrowRight className="w-4 h-4 text-[#D9B77A]" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-500 mt-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero card limits · Pay locally in Naira</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D9B77A]" />
              <span>Quote delivered in under 2 hours</span>
            </span>
            <span>·</span>
            <span>100% Guaranteed DDP Doorstep Delivery</span>
          </div>
        </div>
      </form>
    </div>
  );
};
