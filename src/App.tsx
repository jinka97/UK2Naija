import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Sliders,
  MessageCircle,
  ShieldCheck,
  Plane,
  Store,
  Lock,
  X,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Calculator,
  Briefcase,
  Home,
  Link as LinkIcon,
} from 'lucide-react';
import { CustomerRequest, RecommendedStore } from './types';
import { getStoredRequests, BENCHMARK_FX_RATE } from './services/storage';
import { getFxState, subscribeFxState, refreshLiveFxRate, FxRateState } from './services/fxService';
import { HomeHeroAndPortal } from './components/HomeHeroAndPortal';
import { BuyForMeView } from './components/BuyForMeView';
import { SmartShippingCalculator } from './components/SmartShippingCalculator';
import { BusinessSourcingView } from './components/BusinessSourcingView';
import { CustomerTrackingView } from './components/CustomerTrackingView';
import { AdminDashboard } from './components/AdminDashboard';
import { RecommendedSitesDirectory } from './components/RecommendedSitesDirectory';
import { ADMIN_ACCESS_PASSCODE } from './config/sheetsConfig';
import { JamluLogo } from './components/JamluLogo';

export type ActiveTab = 'home' | 'buy-for-me' | 'calculator' | 'shop' | 'track' | 'business' | 'admin';

export default function App() {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('JAMLU-4821');
  const [initialStore, setInitialStore] = useState<RecommendedStore | null>(null);
  const [initialItemName, setInitialItemName] = useState<string | undefined>(undefined);

  // Cross-component state transfers
  const [pendingEstimate, setPendingEstimate] = useState<{
    category: string;
    ukPriceGbp: number;
    weightKg: number;
    deliveryCity: string;
    totalNgn: number;
  } | null>(null);

  // Operator / Admin Security State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Dynamic FX Benchmark State
  const [fxState, setFxState] = useState<FxRateState>(() => getFxState());
  const [isRefreshingFx, setIsRefreshingFx] = useState<boolean>(false);

  const loadRequests = () => {
    const data = getStoredRequests();
    setRequests(data);
    if (!selectedRequestId && data.length > 0) {
      setSelectedRequestId(data[0].id);
    }
  };

  useEffect(() => {
    loadRequests();

    // Subscribe to dynamic FX benchmark updates
    const unsubFx = subscribeFxState((state) => {
      setFxState(state);
    });

    const handleStorageUpdate = () => {
      loadRequests();
    };

    window.addEventListener('jamlu_storage_updated', handleStorageUpdate);
    window.addEventListener('uk2n_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    // Check if operator mode is requested via URL parameter (?admin=true or #admin) or existing session
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const sessionAuth =
      sessionStorage.getItem('jamlu_admin_session') === 'true' ||
      sessionStorage.getItem('uk2n_admin_session') === 'true';

    if (searchParams.get('admin') === 'true' || hash === '#admin' || sessionAuth) {
      setIsAdminMode(true);
      if (searchParams.get('tab') === 'admin' || hash === '#admin') {
        setActiveTab('admin');
      }
    }

    return () => {
      unsubFx();
      window.removeEventListener('jamlu_storage_updated', handleStorageUpdate);
      window.removeEventListener('uk2n_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleRequestSubmitted = (newReq: CustomerRequest) => {
    setRequests((prev) => [newReq, ...prev.filter((r) => r.id !== newReq.id)]);
    setSelectedRequestId(newReq.id);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrackView = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStoreForRequest = (store: RecommendedStore, specificItem?: string) => {
    setInitialStore(store);
    setInitialItemName(specificItem);
    setActiveTab('buy-for-me');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedFromCalculator = (estimateData: {
    category: string;
    ukPriceGbp: number;
    weightKg: number;
    deliveryCity: string;
    totalNgn: number;
  }) => {
    setPendingEstimate(estimateData);
    setActiveTab('buy-for-me');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickUrlSubmit = (url: string) => {
    setActiveTab('buy-for-me');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_ACCESS_PASSCODE) {
      setIsAdminMode(true);
      sessionStorage.setItem('jamlu_admin_session', 'true');
      setShowAdminPinModal(false);
      setPinInput('');
      setPinError('');
      setActiveTab('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPinError('Incorrect passcode. Please enter the valid staff PIN.');
    }
  };

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    sessionStorage.removeItem('jamlu_admin_session');
    sessionStorage.removeItem('uk2n_admin_session');
    setActiveTab('home');
    if (window.location.search.includes('admin') || window.location.hash.includes('admin')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const pendingQuoteCount = requests.filter((r) => r.status === 'quoted').length;
  const inSourcingCount = requests.filter((r) => r.status === 'submitted' || r.status === 'sourcing').length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans antialiased">
      {/* Operator Mode Active Alert Banner (Only visible when staff is logged in) */}
      {isAdminMode && (
        <div className="bg-amber-500 text-stone-950 px-4 py-1.5 text-xs font-semibold border-b border-amber-600 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping"></span>
              <span>Jamlu Operator Console Active · London Sourcing Desk</span>
            </div>
            <button
              type="button"
              onClick={handleExitAdmin}
              className="px-2.5 py-0.5 rounded bg-stone-950 text-white text-[11px] font-bold hover:bg-stone-800 transition cursor-pointer"
            >
              Exit Operator Mode
            </button>
          </div>
        </div>
      )}

      {/* Top Banner: Currency Benchmark & Direct WhatsApp Concierge */}
      <div className="bg-[#102B2A] text-stone-300 text-[11px] py-1.5 px-4 border-b border-[#263A35]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-[#D9B77A] font-semibold">
              <span className={`w-1.5 h-1.5 rounded-full ${isRefreshingFx ? 'bg-amber-400 animate-spin' : 'bg-emerald-400 animate-pulse'}`}></span>
              <span>Live FX Benchmark: £1.00 = ₦{fxState.rate.toLocaleString()}</span>
            </span>

            <button
              type="button"
              onClick={async () => {
                setIsRefreshingFx(true);
                try {
                  await refreshLiveFxRate();
                } finally {
                  setTimeout(() => setIsRefreshingFx(false), 500);
                }
              }}
              title="Click to check prevailing market FX rate"
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#263A35] border border-white/10 hover:border-[#D9B77A] text-stone-300 hover:text-[#D9B77A] flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isRefreshingFx ? 'animate-spin text-[#D9B77A]' : 'text-stone-400'}`} />
              <span>{isRefreshingFx ? 'Updating...' : 'Live Feed'}</span>
            </button>

            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-stone-300 hidden sm:inline">
              Guaranteed DDP to Lagos, Abuja, Kano, Kaduna, Jos & Nationwide
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/447700900123?text=Hello%20Jamlu!%20I%20am%20looking%20for%20a%20product%20from%20the%20UK."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D9B77A] hover:text-white font-semibold flex items-center gap-1 transition"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Stylistic Jamlu Logo */}
            <div
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer select-none py-1"
            >
              <JamluLogo variant="default" size="md" />
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'home'
                    ? 'bg-[#102B2A] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('buy-for-me');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'buy-for-me'
                    ? 'bg-[#102B2A] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy for Me</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('calculator');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'calculator'
                    ? 'bg-[#102B2A] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ship Calculator</span>
                <span className="sm:hidden">Calculator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'shop'
                    ? 'bg-[#102B2A] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Shop Stores</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('business');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'business'
                    ? 'bg-[#102B2A] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Business Sourcing</span>
                <span className="sm:hidden">Business</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('track');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 relative cursor-pointer shrink-0 ${
                  activeTab === 'track'
                    ? 'bg-[#102B2A] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track</span>
                {pendingQuoteCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1"></span>
                )}
              </button>

              {/* Sourcing Admin Tab (EXCLUSIVELY rendered when Operator Mode is active) */}
              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 relative cursor-pointer border shrink-0 ${
                    activeTab === 'admin'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                      : 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                  title="London Sourcing Team Console"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-950" />
                  <span className="font-bold">Admin</span>
                  {inSourcingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-900 text-white text-[10px] font-bold">
                      {inSourcingCount}
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="grow">
        {activeTab === 'home' && (
          <HomeHeroAndPortal
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onQuickUrlSubmit={handleQuickUrlSubmit}
          />
        )}

        {activeTab === 'buy-for-me' && (
          <BuyForMeView
            initialEstimate={pendingEstimate}
            onRequestSubmitted={handleRequestSubmitted}
            onOpenTrackView={handleOpenTrackView}
          />
        )}

        {activeTab === 'calculator' && (
          <SmartShippingCalculator
            onProceedToBuyForMe={handleProceedFromCalculator}
          />
        )}

        {activeTab === 'shop' && (
          <RecommendedSitesDirectory
            onSelectStoreForRequest={handleSelectStoreForRequest}
          />
        )}

        {activeTab === 'business' && (
          <BusinessSourcingView
            onRequestSubmitted={handleRequestSubmitted}
            onOpenTrackView={handleOpenTrackView}
          />
        )}

        {activeTab === 'track' && (
          <CustomerTrackingView
            requests={requests}
            selectedRequestId={selectedRequestId}
            onSelectRequest={(id) => setSelectedRequestId(id)}
            onRefresh={loadRequests}
          />
        )}

        {activeTab === 'admin' && isAdminMode && (
          <AdminDashboard
            requests={requests}
            onRefresh={loadRequests}
            onSelectCustomerRequest={handleOpenTrackView}
          />
        )}
      </main>

      {/* Professionally Appealing, Customer-Focused Footer */}
      <footer className="bg-[#102B2A] text-stone-400 text-xs py-14 border-t border-[#263A35] mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Column 1: Brand & Identity */}
            <div className="md:col-span-1">
              <div className="mb-3">
                <JamluLogo variant="light" size="md" />
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed mb-3">
                Shop freely. Source confidently. Deliver seamlessly. A smarter bridge between UK shopping and Nigerian customers, individuals, and businesses.
              </p>
              <div className="text-[10px] text-[#D9B77A] font-mono">
                UK Limited Entity · Reg. SIC 47910 & 52290
              </div>
            </div>

            {/* Column 2: Customer Commitments */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Customer Commitments</h4>
              <ul className="space-y-2 text-[11px] text-stone-300">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>100% Genuine British Provenance</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>5-Point Physical QC in London</span>
                </li>
                <li className="flex items-center gap-2">
                  <Plane className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Scheduled Weekly Air Cargo (Heathrow)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Guaranteed DDP (No Customs Ambush)</span>
                </li>
              </ul>
            </div>

            {/* Column 3: The 3 Customer Groups */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Who We Serve</h4>
              <ul className="space-y-2 text-[11px] text-stone-300">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('buy-for-me');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    <strong>The Everyday Shopper</strong>: Clothes, trainers, baby care & beauty
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('calculator');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    <strong>Busy Professionals</strong>: Full-service concierge & shipping
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('business');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition text-left cursor-pointer"
                  >
                    <strong>Business Buyers</strong>: Wholesale stock, clinics & equipment
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Concierge & Direct Contact */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Direct Concierge</h4>
              <p className="text-[11px] text-stone-300 leading-relaxed mb-3">
                Need help finding a rare item or have an inquiry about bulk orders? Connect directly with our London desk.
              </p>
              <a
                href="https://wa.me/447700900123?text=Hello%20Jamlu!%20I%20have%20an%20inquiry%20about%20UK%20sourcing."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#263A35] hover:bg-emerald-900 text-[#D9B77A] hover:text-white rounded-xl text-xs font-semibold transition border border-white/10"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Desk (+44 7700 900123)</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
            <div>
              © 2026 Jamlu. Shop freely. Source confidently. Deliver seamlessly.
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span>Zero Foreign Card Limits</span>
              <span>·</span>
              <span>Local Naira Payments</span>
              <span>·</span>
              <span>Delivered Duty Paid (DDP)</span>
              <span>·</span>
              {/* Discreet operator access link */}
              <button
                type="button"
                onClick={() => setShowAdminPinModal(true)}
                className="text-stone-500 hover:text-stone-300 transition flex items-center gap-1 cursor-pointer ml-1"
                title="Staff / Operator Login"
              >
                <Lock className="w-3 h-3" />
                <span>Operator</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Passcode Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-stone-900 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2 font-bold text-sm text-[#102B2A]">
                <KeyRound className="w-4 h-4 text-[#D9B77A]" />
                <span>Jamlu Operator Access</span>
              </div>
              <button
                onClick={() => {
                  setShowAdminPinModal(false);
                  setPinInput('');
                  setPinError('');
                }}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Operator Passcode
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="Enter staff passcode"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#102B2A] focus:bg-white text-center font-mono tracking-widest text-lg"
                />
                {pinError && <p className="text-xs text-red-600 mt-1">{pinError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPinModal(false);
                    setPinInput('');
                    setPinError('');
                  }}
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#102B2A] hover:bg-[#1b3d3c] text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
