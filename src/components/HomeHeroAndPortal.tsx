import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ShoppingBag,
  Plane,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Coins,
  Scale,
  Camera,
  Layers,
} from 'lucide-react';
import { JamluLogo } from './JamluLogo';
import { getBenchmarkFxRate } from '../services/fxService';
import { TrustAndFaqSection } from './TrustAndFaqSection';

interface HomeHeroAndPortalProps {
  onNavigateToTab: (tab: 'buy-for-me' | 'calculator' | 'shop' | 'track' | 'business') => void;
  onQuickUrlSubmit: (url: string) => void;
}

export const HomeHeroAndPortal: React.FC<HomeHeroAndPortalProps> = ({
  onNavigateToTab,
  onQuickUrlSubmit,
}) => {
  const [heroUrlInput, setHeroUrlInput] = useState<string>('');
  const [activePersona, setActivePersona] = useState<'shopper' | 'professional' | 'business'>('shopper');

  const fxRate = getBenchmarkFxRate();

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroUrlInput.trim()) {
      onQuickUrlSubmit(heroUrlInput.trim());
    } else {
      onNavigateToTab('buy-for-me');
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-stone-900">
      {/* Hero Container */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 border-b border-stone-200">
        <div className="max-w-4xl mx-auto text-center">
          {/* Subtle Trade Corridor Indicator */}
          <div className="mb-6 flex justify-center">
            <JamluLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102B2A]/5 text-[#102B2A] text-xs font-semibold mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>UK ⇄ Nigeria Direct Sourcing & Air Cargo Corridor</span>
          </div>

          {/* Main Hero Typography */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102B2A] tracking-tight leading-[1.15] mb-4">
            Everything you love in the UK.<br />
            <span className="text-stone-800 font-bold">Delivered to your doorstep in Nigeria.</span>
          </h1>

          <p className="text-base sm:text-xl text-stone-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Find it on any UK store. Send us the link. We handle foreign payment with zero card limits, inspect your goods in London, and clear customs to your door.
          </p>

          {/* Instant URL Sourcing Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <form onSubmit={handleHeroSubmit} className="shadow-lg rounded-2xl bg-white p-2 border-2 border-[#102B2A] flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-stone-400 ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  value={heroUrlInput}
                  onChange={(e) => setHeroUrlInput(e.target.value)}
                  placeholder="Paste any UK store link (ASOS, Amazon, Next, Boots, Smiggle, John Lewis)..."
                  className="w-full py-2 px-1 text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-[#102B2A] hover:bg-[#1b3d3c] text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <span>Get Instant Naira Estimate</span>
                <ArrowRight className="w-4 h-4 text-[#D9B77A]" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500 mt-2.5">
              <span className="text-stone-400">Popular links:</span>
              <button
                type="button"
                onClick={() => onQuickUrlSubmit('https://www.asos.com/nike/nike-air-max-90-trainers/')}
                className="text-stone-700 hover:text-[#102B2A] hover:underline font-medium cursor-pointer"
              >
                Nike Air Max (ASOS)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onQuickUrlSubmit('https://www.smiggle.co.uk/backpacks')}
                className="text-stone-700 hover:text-[#102B2A] hover:underline font-medium cursor-pointer"
              >
                Smiggle Backpacks
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onQuickUrlSubmit('https://www.boots.com/aptamil-profutura-first-infant-milk-800g')}
                className="text-stone-700 hover:text-[#102B2A] hover:underline font-medium cursor-pointer"
              >
                Aptamil Baby Formula
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onQuickUrlSubmit('https://www.apple.com/uk/airpods-pro/')}
                className="text-stone-700 hover:text-[#102B2A] hover:underline font-medium cursor-pointer"
              >
                Apple AirPods Pro
              </button>
            </div>
          </div>

          {/* Persona Switcher: "What would you like to do today?" */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs max-w-3xl mx-auto text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              What would you like to do today?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: The everyday shopper */}
              <button
                type="button"
                onClick={() => {
                  setActivePersona('shopper');
                  onNavigateToTab('buy-for-me');
                }}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activePersona === 'shopper'
                    ? 'border-[#102B2A] bg-[#102B2A] text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-800'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2.5">
                    <ShoppingBag className={`w-4 h-4 ${activePersona === 'shopper' ? 'text-[#D9B77A]' : 'text-[#102B2A]'}`} />
                  </div>
                  <div className="font-bold text-sm mb-1">I want to buy something</div>
                  <div className={`text-xs ${activePersona === 'shopper' ? 'text-stone-300' : 'text-stone-500'}`}>
                    Trainers, clothes, beauty, electronics, baby formula or Smiggle bags from UK stores.
                  </div>
                </div>
                <div className={`text-xs font-semibold mt-3 flex items-center gap-1 ${
                  activePersona === 'shopper' ? 'text-[#D9B77A]' : 'text-[#102B2A]'
                }`}>
                  <span>Start Buy For Me</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option 2: The busy professional / concierge */}
              <button
                type="button"
                onClick={() => {
                  setActivePersona('professional');
                  onNavigateToTab('calculator');
                }}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activePersona === 'professional'
                    ? 'border-[#102B2A] bg-[#102B2A] text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-800'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2.5">
                    <Scale className={`w-4 h-4 ${activePersona === 'professional' ? 'text-[#D9B77A]' : 'text-[#102B2A]'}`} />
                  </div>
                  <div className="font-bold text-sm mb-1">I have a parcel to ship</div>
                  <div className={`text-xs ${activePersona === 'professional' ? 'text-stone-300' : 'text-stone-500'}`}>
                    Estimate landed costs, volumetric weight, and DDP air cargo before purchasing.
                  </div>
                </div>
                <div className={`text-xs font-semibold mt-3 flex items-center gap-1 ${
                  activePersona === 'professional' ? 'text-[#D9B77A]' : 'text-[#102B2A]'
                }`}>
                  <span>Calculate Shipping</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option 3: The business buyer */}
              <button
                type="button"
                onClick={() => {
                  setActivePersona('business');
                  onNavigateToTab('business');
                }}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activePersona === 'business'
                    ? 'border-[#102B2A] bg-[#102B2A] text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-800'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2.5">
                    <Building2 className={`w-4 h-4 ${activePersona === 'business' ? 'text-[#D9B77A]' : 'text-[#102B2A]'}`} />
                  </div>
                  <div className="font-bold text-sm mb-1">I need business sourcing</div>
                  <div className={`text-xs ${activePersona === 'business' ? 'text-stone-300' : 'text-stone-500'}`}>
                    Wholesale inventory, clinic equipment, commercial pro-forma and UK VAT reclaim.
                  </div>
                </div>
                <div className={`text-xs font-semibold mt-3 flex items-center gap-1 ${
                  activePersona === 'business' ? 'text-[#D9B77A]' : 'text-[#102B2A]'
                }`}>
                  <span>B2B Procurement</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Journey ("Find · Purchase · Receive") */}
      <section className="py-14 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#D9B77A] mb-1.5">
            Shopping Across Borders, Made Simple
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B2A] tracking-tight">
            How It Works in 3 Clear Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs relative flex flex-col justify-between overflow-hidden">
            <span className="text-3xl font-black text-[#D9B77A]/20 absolute top-4 right-4 font-mono select-none pointer-events-none">01</span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102B2A] text-[#D9B77A] text-xs font-bold uppercase tracking-wider mb-3.5 border border-[#263A35] shadow-xs w-fit shrink-0 whitespace-nowrap">
                <Search className="w-3.5 h-3.5 text-[#D9B77A] shrink-0" />
                <span>Find</span>
              </div>
              <h3 className="font-bold text-base text-[#102B2A] mb-2 tracking-tight">Choose what you want</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Browse any UK retailer (ASOS, Amazon UK, John Lewis, Next, Boots, Clarks, TK Maxx). Copy the product link or tell us what you need.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs relative flex flex-col justify-between overflow-hidden">
            <span className="text-3xl font-black text-[#D9B77A]/20 absolute top-4 right-4 font-mono select-none pointer-events-none">02</span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102B2A] text-[#D9B77A] text-xs font-bold uppercase tracking-wider mb-3.5 border border-[#263A35] shadow-xs w-fit shrink-0 whitespace-nowrap">
                <ShoppingBag className="w-3.5 h-3.5 text-[#D9B77A] shrink-0" />
                <span>Purchase</span>
              </div>
              <h3 className="font-bold text-base text-[#102B2A] mb-2 tracking-tight">We help you buy</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Bypass international bank card limits. Pay in Nigerian Naira via bank transfer or card. Choose 100% full pay or a 70% procurement deposit.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs relative flex flex-col justify-between overflow-hidden">
            <span className="text-3xl font-black text-[#D9B77A]/20 absolute top-4 right-4 font-mono select-none pointer-events-none">03</span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102B2A] text-[#D9B77A] text-xs font-bold uppercase tracking-wider mb-3.5 border border-[#263A35] shadow-xs w-fit shrink-0 whitespace-nowrap">
                <Plane className="w-3.5 h-3.5 text-[#D9B77A] shrink-0" />
                <span>Receive</span>
              </div>
              <h3 className="font-bold text-base text-[#102B2A] mb-2 tracking-tight">We get it to you</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Our London warehouse checks quality and uploads photo proof. Shipped via weekly air cargo with 100% DDP customs clearing to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Card Limits Friction Comparison: Paying Alone vs. Jamlu */}
      <section className="py-12 px-4 sm:px-6 bg-white border-y border-stone-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#D9B77A] mb-1.5">
              The Currency & Foreign Card Advantage
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B2A] tracking-tight">
              Why Shopping Direct From Nigeria Gets Complicated
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700">
              <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
                Standard Self-Shopping Friction
              </div>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Nigerian debit cards restricted to $20/month foreign spend limit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Most UK retailers reject foreign credit cards with billing address mismatches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Zero physical inspection in the UK until parcel arrives weeks later.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Unexpected customs clearance demurrage and extortion at Lagos airport.</span>
                </li>
              </ul>
            </div>

            {/* The Jamlu Way */}
            <div className="p-6 rounded-2xl bg-[#102B2A] text-white border border-[#263A35] shadow-md">
              <div className="text-xs font-bold uppercase tracking-wider text-[#D9B77A] mb-2">
                With Jamlu Concierge
              </div>
              <ul className="space-y-2.5 text-xs text-stone-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Zero spend limits</strong>: Pay in Naira via NUBAN bank transfer or local card.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>London retail presence</strong>: We purchase directly in-store and online with UK VAT receipts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>5-point physical QC</strong>: High-res photos of seals, plugs, and sizes uploaded before flight.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Guaranteed DDP</strong>: All customs handling pre-cleared—zero surprise fees at delivery.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & FAQ Section (Addressing the 5 Investigation Questions) */}
      <TrustAndFaqSection />
    </div>
  );
};
