import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Plane,
  AlertCircle,
  FileText,
  MessageCircle,
  Calculator,
  Camera,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Send,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { CustomerRequest, RequestStatus, Quotation } from '../types';
import { GoogleSheetsHub } from './GoogleSheetsHub';
import { StrategicArchitectureDossier } from './StrategicArchitectureModal';
import {
  BookOpen,
  Database,
  Sliders,
} from 'lucide-react';
import {
  updateRequestStatus,
  SOURCING_FEE_PCT,
  SOURCING_FEE_MIN,
  AIR_FREIGHT_PER_KG,
  CUSTOMS_CLEARING_FLAT,
  resetToSeedData,
} from '../services/storage';
import {
  getBenchmarkFxRate,
  subscribeFxState,
  refreshLiveFxRate,
  setCustomFxRate,
  setFxBufferPercent,
  FxRateState,
} from '../services/fxService';

interface AdminDashboardProps {
  requests: CustomerRequest[];
  onRefresh: () => void;
  onSelectCustomerRequest: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  requests,
  onRefresh,
  onSelectCustomerRequest,
}) => {
  const [adminSection, setAdminSection] = useState<'triage' | 'sheets' | 'strategy'>('triage');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(requests[0]?.id || null);

  // Quote Builder State
  const [retailerFound, setRetailerFound] = useState<string>('Boots UK (London)');
  const [retailerUrl, setRetailerUrl] = useState<string>('https://www.boots.com');
  const [ukPriceInput, setUkPriceInput] = useState<number>(55.0);
  const [weightKgInput, setWeightKgInput] = useState<number>(2.0);
  const [sourcingNotes, setSourcingNotes] = useState<string>('Verified genuine stock with UK warranty.');
  const [deliveryDays, setDeliveryDays] = useState<string>('5-7 business days');

  // Purchase proof builder
  const [storeNameInput, setStoreNameInput] = useState<string>('Boots Victoria London');
  const [receiptNumberInput, setReceiptNumberInput] = useState<string>('REC-UK-' + Math.floor(10000 + Math.random() * 90000));

  // Dispatch builder
  const [carrierInput, setCarrierInput] = useState<string>('British Airways World Cargo (LHR ➔ LOS)');
  const [awbInput, setAwbInput] = useState<string>('BAW-LOS-' + Math.floor(100000 + Math.random() * 900000));

  // Dynamic FX Benchmark State
  const [fxState, setFxState] = useState<FxRateState>(() => ({
    rate: getBenchmarkFxRate(),
    marketRate: getBenchmarkFxRate(),
    bufferPercent: 2.5,
    lastUpdated: '',
    source: 'cached',
    status: 'idle',
  }));
  const [customRateInput, setCustomRateInput] = useState<string>('');
  const [isRefreshingFx, setIsRefreshingFx] = useState<boolean>(false);

  React.useEffect(() => {
    return subscribeFxState((state) => {
      setFxState(state);
    });
  }, []);

  const activeRequest = requests.find((r) => r.id === selectedRequestId) || requests[0] || null;

  const filteredRequests =
    statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter);

  // Active FX rate: custom operator input if provided, otherwise live benchmark rate
  const parsedCustomRate = parseFloat(customRateInput);
  const activeFxRate = !isNaN(parsedCustomRate) && parsedCustomRate > 0 ? Math.round(parsedCustomRate) : fxState.rate;

  // Calculate quote line items dynamically
  const calculatedFee = Math.max(ukPriceInput * SOURCING_FEE_PCT, SOURCING_FEE_MIN);
  const calculatedFreight = weightKgInput * AIR_FREIGHT_PER_KG;
  const calculatedTotalGbp = ukPriceInput + calculatedFee + calculatedFreight + CUSTOMS_CLEARING_FLAT;
  const calculatedTotalNgn = Math.round(calculatedTotalGbp * activeFxRate);

  const handleIssueQuote = () => {
    if (!activeRequest) return;

    const newQuotation: Quotation = {
      ukRetailPriceGbp: ukPriceInput,
      sourcingFeeGbp: calculatedFee,
      airFreightGbp: calculatedFreight,
      customsHandlingGbp: CUSTOMS_CLEARING_FLAT,
      totalGbp: calculatedTotalGbp,
      fxRate: activeFxRate,
      totalNgn: calculatedTotalNgn,
      retailerFound,
      retailerUrl,
      sourcingNotes,
      estimatedDeliveryDays: deliveryDays,
      quotedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    };

    updateRequestStatus(activeRequest.id, 'quoted', {
      quotation: newQuotation,
      adminNotes: `Quotation issued by UK desk: £${calculatedTotalGbp.toFixed(2)} (₦${calculatedTotalNgn.toLocaleString()})`,
    });

    onRefresh();
    alert(`Quotation successfully issued for ${activeRequest.id}! Customer can now review & approve.`);
  };

  const handleMarkAsPurchased = () => {
    if (!activeRequest) return;

    updateRequestStatus(activeRequest.id, 'purchased', {
      purchaseProof: {
        purchasedAt: new Date().toISOString(),
        storeName: storeNameInput,
        receiptNumber: receiptNumberInput,
        receiptNote: 'Official UK paper VAT receipt attached; verified batch numbers.',
        receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e49fe744040?w=500&auto=format&fit=crop&q=60',
        qcPhotos: [
          {
            title: 'Tamper Seal Intact',
            description: 'Factory sealed, zero tears or dents.',
            imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
          },
          {
            title: 'UK Batch & Expiry Stamp',
            description: 'Expiry date verified: minimum 14 months shelf life.',
            imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60',
          },
        ],
      },
      adminNotes: `Goods purchased from ${storeNameInput}. QC passed in London hub.`,
    });

    onRefresh();
  };

  const handleMarkAsDispatched = () => {
    if (!activeRequest) return;

    updateRequestStatus(activeRequest.id, 'dispatched', {
      dispatchInfo: {
        dispatchedAt: new Date().toISOString(),
        carrier: carrierInput,
        trackingNumber: awbInput,
        flightOrCourierRef: 'BA075 Heathrow Scheduled Cargo',
        deliveryEstimatedDate: 'Within 3-4 days to Lagos doorstep',
      },
      adminNotes: `Cargo consolidated on Master AWB ${awbInput}. Cleared DDP.`,
    });

    onRefresh();
  };

  const handleGenerateWhatsAppLink = (req: CustomerRequest) => {
    const phone = req.whatsappPhone.replace(/[^0-9]/g, '');
    let msg = `Hello ${req.customerName}, this is your UK2Naija personal shopping concierge regarding request ${req.id}.`;

    if (req.status === 'submitted') {
      msg += ` We have received your request for "${req.items[0]?.name}" and are checking stock with verified UK retailers.`;
    } else if (req.status === 'quoted' && req.quotation) {
      msg += ` Good news! We've secured pricing for your item from ${req.quotation.retailerFound}. Total landed cost to your doorstep in ${req.deliveryCity} is ₦${req.quotation.totalNgn.toLocaleString()} (£${req.quotation.totalGbp.toFixed(2)}). Zero customs surcharge. Reply here or visit your portal to approve!`;
    } else if (req.status === 'purchased') {
      msg += ` Your item has been purchased in London and passed our 5-point physical QC inspection! Tamper seals verified. Preparing for Friday flight to Lagos.`;
    } else if (req.status === 'dispatched' && req.dispatchInfo) {
      msg += ` Great news! Your package is in transit via ${req.dispatchInfo.carrier} (AWB: ${req.dispatchInfo.trackingNumber}). Delivery to ${req.deliveryCity} is scheduled for ${req.dispatchInfo.deliveryEstimatedDate}.`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Metrics
  const totalCount = requests.length;
  const pendingSourcing = requests.filter((r) => r.status === 'submitted' || r.status === 'sourcing').length;
  const quotesIssued = requests.filter((r) => r.status === 'quoted').length;
  const inFulfillment = requests.filter((r) => r.status === 'approved' || r.status === 'purchased').length;
  const dispatchedCount = requests.filter((r) => r.status === 'dispatched').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Admin Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              UK Sourcing Contact Console (London Hub)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Sourcing & Operations Management</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Manage incoming Nigerian customer requests, quotations, Google Sheets live integration, and commercial rules.
          </p>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setAdminSection('triage')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              adminSection === 'triage'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Order Triage ({requests.length})</span>
          </button>
          <button
            onClick={() => setAdminSection('sheets')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              adminSection === 'sheets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Google Sheets Sync</span>
          </button>
          <button
            onClick={() => setAdminSection('strategy')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              adminSection === 'strategy'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Strategic Dossier</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW BASED ON ACTIVE ADMIN SECTION */}
      {adminSection === 'sheets' && (
        <GoogleSheetsHub requests={requests} onRefresh={onRefresh} />
      )}

      {adminSection === 'strategy' && (
        <StrategicArchitectureDossier />
      )}

      {adminSection === 'triage' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                if (confirm('Reset database to clean seed requests?')) {
                  resetToSeedData();
                  onRefresh();
                }
              }}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs rounded-lg flex items-center gap-1.5 transition"
              title="Reset to default seed requests"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo Data</span>
            </button>
          </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase font-medium block">Total Inquiries</span>
          <span className="text-xl font-bold text-slate-900 font-mono">{totalCount}</span>
        </div>
        <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] text-amber-800 uppercase font-medium block">Needs Sourcing</span>
          <span className="text-xl font-bold text-amber-900 font-mono">{pendingSourcing}</span>
        </div>
        <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-[11px] text-blue-800 uppercase font-medium block">Awaiting Approval</span>
          <span className="text-xl font-bold text-blue-900 font-mono">{quotesIssued}</span>
        </div>
        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] text-emerald-800 uppercase font-medium block">Pre-Funded / In QC</span>
          <span className="text-xl font-bold text-emerald-900 font-mono">{inFulfillment}</span>
        </div>
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-300 uppercase font-medium block">In Transit / Lagos</span>
          <span className="text-xl font-bold text-emerald-300 font-mono">{dispatchedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: 'All Requests' },
          { key: 'submitted', label: '1. Submitted' },
          { key: 'sourcing', label: '2. In Sourcing' },
          { key: 'quoted', label: '3. Quoted' },
          { key: 'approved', label: '4. Approved / Paid' },
          { key: 'purchased', label: '5. Purchased / QC' },
          { key: 'dispatched', label: '6. Dispatched' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg border font-medium shrink-0 transition ${
              statusFilter === tab.key
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2-Column Layout: Requests List on Left, Active Request Sourcing Desk on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Requests Table */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Incoming Demand Pipeline ({filteredRequests.length})
          </div>

          {filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequestId(req.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                activeRequest?.id === req.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`font-mono text-xs font-bold ${
                    activeRequest?.id === req.id ? 'text-emerald-400' : 'text-slate-900'
                  }`}
                >
                  {req.id}
                </span>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    activeRequest?.id === req.id
                      ? 'bg-slate-800 text-slate-200'
                      : req.status === 'quoted'
                      ? 'bg-blue-100 text-blue-800'
                      : req.status === 'purchased' || req.status === 'dispatched'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {req.status.toUpperCase()}
                </span>
              </div>

              <div
                className={`text-xs font-bold truncate mb-1 ${
                  activeRequest?.id === req.id ? 'text-white' : 'text-slate-900'
                }`}
              >
                {req.items[0]?.name || 'UK Sourced Product'}
              </div>

              <div
                className={`text-[11px] flex items-center justify-between ${
                  activeRequest?.id === req.id ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                <span>
                  {req.customerName} · {req.deliveryCity.split(' (')[0]}
                </span>
                <span>Qty: {req.items.reduce((acc, i) => acc + i.quantity, 0)}</span>
              </div>

              {/* Special tag if customer used "I don't know what it's called" */}
              {req.items.some((i) => i.dontKnowName) && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <HelpCircle className="w-3 h-3" />
                  <span>Photo / Description Matching Needed</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: Sourcing Workspace & Quotation Desk */}
        {activeRequest ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Currently Inspecting</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-bold font-mono text-slate-900">{activeRequest.id}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {activeRequest.category}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={handleGenerateWhatsAppLink(activeRequest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
                  title="Send pre-filled WhatsApp update directly to customer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Customer</span>
                </a>

                <button
                  type="button"
                  onClick={() => onSelectCustomerRequest(activeRequest.id)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition"
                >
                  View as Customer
                </button>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-5 text-xs text-slate-700 space-y-1">
              <p>
                <strong>Customer:</strong> {activeRequest.customerName} ({activeRequest.whatsappPhone})
              </p>
              <p>
                <strong>Destination:</strong> {activeRequest.deliveryCity} — {activeRequest.deliveryAddress || 'Standard hub pickup'}
              </p>
              <p>
                <strong>Budget Preference:</strong> {activeRequest.budget}
              </p>
              {activeRequest.adminNotes && (
                <p className="text-slate-500 italic pt-1 border-t border-slate-200">
                  Notes: {activeRequest.adminNotes}
                </p>
              )}
            </div>

            {/* Items submitted */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Customer Wishlist Items</h4>
              <div className="space-y-2">
                {activeRequest.items.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>
                        {idx + 1}. {item.name || 'UK Product'}
                      </span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    {item.brand && <div className="text-slate-600 mt-0.5">Preferred Brand: {item.brand}</div>}
                    {item.specs && <div className="text-slate-500 mt-0.5">Specifications: {item.specs}</div>}
                    {item.whatItDoesOrLooksLike && (
                      <div className="text-amber-800 bg-amber-50 p-2 rounded mt-1.5 border border-amber-200">
                        <strong>Customer Description:</strong> "{item.whatItDoesOrLooksLike}"
                      </div>
                    )}
                    {item.photoUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={item.photoUrl} alt="Photo" className="w-12 h-12 object-cover rounded border" />
                        <span className="text-slate-500">Customer uploaded reference image.</span>
                      </div>
                    )}
                    {item.referenceUrl && (
                      <div className="mt-1.5">
                        <a
                          href={item.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{item.referenceUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION 1: QUOTATION BUILDER */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Landed Cost Quotation Generator
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">UK Retailer Identified *</label>
                  <input
                    type="text"
                    value={retailerFound}
                    onChange={(e) => setRetailerFound(e.target.value)}
                    placeholder="e.g. Boots UK, Apple Store, Currys"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">UK Retail Store Price (£ GBP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ukPriceInput}
                    onChange={(e) => setUkPriceInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Estimated Billable Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKgInput}
                    onChange={(e) => setWeightKgInput(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Delivery SLA Timeframe</label>
                  <input
                    type="text"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    placeholder="e.g. 5-7 business days"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* FX Benchmark Control & Live Sync */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Prevailing FX Rate:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    ₦{activeFxRate.toLocaleString()} / £1
                  </span>
                  {fxState.source === 'live_api' ? (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                      Live Feed (+{fxState.bufferPercent}% buffer)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                      Standard Benchmark
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500">Override:</span>
                    <input
                      type="number"
                      placeholder={fxState.rate.toString()}
                      value={customRateInput}
                      onChange={(e) => setCustomRateInput(e.target.value)}
                      className="w-20 px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono"
                      title="Enter custom Naira rate to override for this quote"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsRefreshingFx(true);
                      try {
                        await refreshLiveFxRate();
                        setCustomRateInput('');
                      } finally {
                        setTimeout(() => setIsRefreshingFx(false), 500);
                      }
                    }}
                    className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-200 rounded transition cursor-pointer"
                    title="Refresh live rate from exchange API"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingFx ? 'animate-spin text-emerald-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Real-time Math Summary */}
              <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs mb-3 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>UK Store Retail Cost:</span>
                  <span className="font-mono">£{ukPriceInput.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sourcing Fee (12% / min £15):</span>
                  <span className="font-mono">£{calculatedFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Air Freight ({weightKgInput}kg @ £9.50/kg):</span>
                  <span className="font-mono">£{calculatedFreight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Lagos Customs DDP Handling:</span>
                  <span className="font-mono">£{CUSTOMS_CLEARING_FLAT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-100 text-sm">
                  <span>Total Landed (GBP):</span>
                  <span className="font-mono text-emerald-800">£{calculatedTotalGbp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 font-bold text-sm bg-slate-900 text-white p-2.5 rounded mt-2">
                  <div>
                    <span>Payable in Nigerian Naira (₦):</span>
                    <span className="block text-[10px] font-normal text-slate-400">
                      Calculated at ₦{activeFxRate.toLocaleString()}/£1.00
                    </span>
                  </div>
                  <span className="font-mono text-emerald-300 text-base">₦{calculatedTotalNgn.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleIssueQuote}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Issue & Lock Quotation for Customer</span>
              </button>
            </div>

            {/* ACTION 2: PHYSICAL FULFILLMENT STEPS */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Fulfillment State Machine</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateRequestStatus(activeRequest.id, 'sourcing', {
                      adminNotes: 'UK sourcing agent actively verifying retailer inventory.',
                    });
                    onRefresh();
                  }}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg border border-amber-200 transition"
                >
                  Mark In Sourcing
                </button>

                <button
                  type="button"
                  onClick={handleMarkAsPurchased}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold rounded-lg border border-blue-200 transition"
                >
                  Mark Purchased (Log QC)
                </button>

                <button
                  type="button"
                  onClick={handleMarkAsDispatched}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-lg border border-emerald-200 transition"
                >
                  Mark Dispatched (Add AWB)
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      </>
      )}
    </div>
  );
};

