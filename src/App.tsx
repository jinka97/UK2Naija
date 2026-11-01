import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Sliders,
  MessageCircle,
  ShieldCheck,
  Plane,
  Sparkles,
  ExternalLink,
  Store,
} from 'lucide-react';
import { CustomerRequest, RecommendedStore } from './types';
import { getStoredRequests, BENCHMARK_FX_RATE } from './services/storage';
import { CustomerRequestForm } from './components/CustomerRequestForm';
import { CustomerTrackingView } from './components/CustomerTrackingView';
import { AdminDashboard } from './components/AdminDashboard';
import { RecommendedSitesDirectory } from './components/RecommendedSitesDirectory';

export default function App() {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'submit' | 'stores' | 'track' | 'admin'>('submit');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('UKS-4821');
  const [initialStore, setInitialStore] = useState<RecommendedStore | null>(null);
  const [initialItemName, setInitialItemName] = useState<string | undefined>(undefined);

  const loadRequests = () => {
    const data = getStoredRequests();
    setRequests(data);
    if (!selectedRequestId && data.length > 0) {
      setSelectedRequestId(data[0].id);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRequestSubmitted = (newReq: CustomerRequest) => {
    loadRequests();
    setSelectedRequestId(newReq.id);
  };

  const handleOpenTrackView = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStoreForRequest = (store: RecommendedStore, specificItem?: string) => {
    setInitialStore(store);
    setInitialItemName(specificItem);
    setActiveTab('submit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearInitialStore = () => {
    setInitialStore(null);
    setInitialItemName(undefined);
  };

  const pendingQuoteCount = requests.filter((r) => r.status === 'quoted').length;
  const inSourcingCount = requests.filter((r) => r.status === 'submitted' || r.status === 'sourcing').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Banner: Currency Benchmark & Direct WhatsApp Concierge */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live FX Benchmark: £1.00 = ₦{BENCHMARK_FX_RATE.toLocaleString()}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Guaranteed DDP (Delivered Duty Paid) to Lagos & Abuja · Zero Customs Ambush
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/447700900123?text=Hello%20UK%20Source!%20I%20am%20looking%20for%20a%20product%20from%20the%20UK."
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Platform Title */}
            <div
              onClick={() => setActiveTab('submit')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                UK
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-slate-900">UK SOURCE</span>
                  <span className="text-xs font-bold text-slate-400">➔</span>
                  <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Nigeria
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Digital UK Shopping Assistant</p>
              </div>
            </div>

            {/* Navigation Tabs (Professional, Customer-Focused) */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'submit'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Submit Request</span>
                <span className="sm:hidden">Request</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stores')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'stores'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Some Retailers</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 relative cursor-pointer ${
                  activeTab === 'track'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Track Request</span>
                <span className="sm:hidden">Track</span>
                {pendingQuoteCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-1.5"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 relative cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="UK Sourcing Team Console"
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Sourcing Admin</span>
                <span className="sm:hidden">Admin</span>
                {inSourcingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {inSourcingCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="grow">
        {activeTab === 'submit' && (
          <CustomerRequestForm
            onRequestSubmitted={handleRequestSubmitted}
            onOpenTrackView={handleOpenTrackView}
            onOpenRecommendedSitesTab={() => setActiveTab('stores')}
            initialStore={initialStore}
            initialItemName={initialItemName}
            onClearInitialStore={handleClearInitialStore}
          />
        )}

        {activeTab === 'stores' && (
          <RecommendedSitesDirectory
            onSelectStoreForRequest={handleSelectStoreForRequest}
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

        {activeTab === 'admin' && (
          <AdminDashboard
            requests={requests}
            onRefresh={loadRequests}
            onSelectCustomerRequest={handleOpenTrackView}
          />
        )}
      </main>

      {/* Professionally Appealing, Customer-Focused Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Column 1: Brand & Identity */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-2.5">
                <span>UK SOURCE ➔ NIGERIA</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Your personal digital UK shopping assistant. Tell us what you need from verified British retailers, and we
                source, inspect, and deliver directly to your doorstep in Nigeria.
              </p>
              <div className="text-[10px] text-emerald-400 font-mono">
                UK Limited Entity · Reg. SIC 47910 & 52290
              </div>
            </div>

            {/* Column 2: Core Customer Guarantees */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Customer Commitments</h4>
              <ul className="space-y-2 text-[11px] text-slate-300">
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

            {/* Column 3: How It Works */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">How It Works</h4>
              <ol className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-400 font-mono">1.</span>
                  <span>Tell us what product you need (link or photo)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-400 font-mono">2.</span>
                  <span>Receive an itemized landed quote in Naira</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-400 font-mono">3.</span>
                  <span>Pay securely in Naira (no UK card needed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-400 font-mono">4.</span>
                  <span>Inspect London QC photos & receive delivery</span>
                </li>
              </ol>
            </div>

            {/* Column 4: Concierge & Direct Contact */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Direct Concierge</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Have questions about sourcing specific products or delivery timelines? Chat directly with our London desk.
              </p>
              <a
                href="https://wa.me/447700900123?text=Hello%20UK%20Source!%20I%20have%20an%20inquiry%20about%20UK%20sourcing."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-xl text-xs font-semibold transition border border-emerald-700"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Desk (+44 7700 900123)</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 UK Source Nigeria. Sourced directly from verified UK merchants to your doorstep in Nigeria.
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span>Zero Account Creation Needed</span>
              <span>·</span>
              <span>Local Naira Payments</span>
              <span>·</span>
              <span>Delivered Duty Paid (DDP)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

