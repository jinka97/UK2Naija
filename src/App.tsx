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
} from 'lucide-react';
import { CustomerRequest, RecommendedStore } from './types';
import { getStoredRequests, BENCHMARK_FX_RATE } from './services/storage';
import { CustomerRequestForm } from './components/CustomerRequestForm';
import { CustomerTrackingView } from './components/CustomerTrackingView';
import { AdminDashboard } from './components/AdminDashboard';
import { RecommendedSitesDirectory } from './components/RecommendedSitesDirectory';
import { ADMIN_ACCESS_PASSCODE } from './config/sheetsConfig';

export default function App() {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'submit' | 'stores' | 'track' | 'admin'>('submit');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('UK2N-4821');
  const [initialStore, setInitialStore] = useState<RecommendedStore | null>(null);
  const [initialItemName, setInitialItemName] = useState<string | undefined>(undefined);

  // Operator / Admin Security State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const loadRequests = () => {
    const data = getStoredRequests();
    setRequests(data);
    if (!selectedRequestId && data.length > 0) {
      setSelectedRequestId(data[0].id);
    }
  };

  useEffect(() => {
    loadRequests();

    // Check if operator mode is requested via URL parameter (?admin=true or #admin) or existing session
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const sessionAuth = sessionStorage.getItem('uk2n_admin_session') === 'true';

    if (searchParams.get('admin') === 'true' || hash === '#admin' || sessionAuth) {
      setIsAdminMode(true);
      if (searchParams.get('tab') === 'admin' || hash === '#admin') {
        setActiveTab('admin');
      }
    }
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

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_ACCESS_PASSCODE) {
      setIsAdminMode(true);
      sessionStorage.setItem('uk2n_admin_session', 'true');
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
    sessionStorage.removeItem('uk2n_admin_session');
    setActiveTab('submit');
    // Clear URL parameters if any
    if (window.location.search.includes('admin') || window.location.hash.includes('admin')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const pendingQuoteCount = requests.filter((r) => r.status === 'quoted').length;
  const inSourcingCount = requests.filter((r) => r.status === 'submitted' || r.status === 'sourcing').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Operator Mode Active Alert Banner (Only visible when staff is logged in) */}
      {isAdminMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold border-b border-amber-600 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
              <span>UK2Naija Operator Console Active · UK Sourcing Desk Mode</span>
            </div>
            <button
              type="button"
              onClick={handleExitAdmin}
              className="px-2.5 py-0.5 rounded bg-slate-950 text-white text-[11px] font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Exit Operator Mode
            </button>
          </div>
        </div>
      )}

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
              href="https://wa.me/447700900123?text=Hello%20UK2Naija!%20I%20am%20looking%20for%20a%20product%20from%20the%20UK."
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
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs tracking-wider shadow-sm">
                UK2N
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-slate-900">UK2Naija</span>
                  <span className="text-xs font-bold text-slate-400">·</span>
                  <span className="text-[11px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    UK ➔ Nigeria
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Digital UK Shopping & Sourcing Assistant</p>
              </div>
            </div>

            {/* Navigation Tabs (Customer Facing by default) */}
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

              {/* Sourcing Admin Tab (EXCLUSIVELY rendered when Operator Mode is active) */}
              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 relative cursor-pointer border ${
                    activeTab === 'admin'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                      : 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                  title="UK Sourcing Team Console"
                >
                  <Sliders className="w-4 h-4 text-amber-950" />
                  <span className="font-bold">Sourcing Admin</span>
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

        {activeTab === 'admin' && isAdminMode && (
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
                <span className="text-emerald-400 font-black">UK2Naija</span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-300">London ➔ Lagos & Abuja</span>
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
                href="https://wa.me/447700900123?text=Hello%20UK2Naija!%20I%20have%20an%20inquiry%20about%20UK%20sourcing."
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
              © 2026 UK2Naija. Sourced directly from verified UK merchants to your doorstep in Nigeria.
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span>Zero Account Creation Needed</span>
              <span>·</span>
              <span>Local Naira Payments</span>
              <span>·</span>
              <span>Delivered Duty Paid (DDP)</span>
              <span>·</span>
              {/* Discreet operator access link */}
              <button
                type="button"
                onClick={() => setShowAdminPinModal(true)}
                className="text-slate-600 hover:text-slate-400 transition flex items-center gap-1 cursor-pointer ml-1"
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>UK2Naija Operator Access</span>
              </div>
              <button
                onClick={() => {
                  setShowAdminPinModal(false);
                  setPinInput('');
                  setPinError('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Enter your staff passcode to unlock the live Sourcing Admin console, Google Sheets hub, and quotation controls.
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Staff Passcode
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Enter PIN (Default: 2026)"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{pinError}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Default passcode is <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">2026</code> (configured in <code className="font-mono text-slate-700">sheetsConfig.ts</code>).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
