import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plane,
  Truck,
  MessageCircle,
  FileText,
  Camera,
  AlertCircle,
  Check,
  CreditCard,
  Building,
  ExternalLink,
} from 'lucide-react';
import { CustomerRequest } from '../types';
import { updateRequestStatus } from '../services/storage';

interface CustomerTrackingViewProps {
  requests: CustomerRequest[];
  selectedRequestId?: string;
  onSelectRequest: (id: string) => void;
  onRefresh: () => void;
}

const STAGES = [
  { key: 'submitted', label: '1. Request Submitted', desc: 'Received by UK sourcing team' },
  { key: 'sourcing', label: '2. Sourcing in UK', desc: 'Checking verified retailers' },
  { key: 'quoted', label: '3. Quotation Issued', desc: 'Transparent landed cost ready' },
  { key: 'approved', label: '4. Approved & Paid', desc: 'Pre-funded in Naira' },
  { key: 'purchased', label: '5. Purchased & Inspected', desc: 'Receipt & QC photos logged' },
  { key: 'dispatched', label: '6. Dispatched to Nigeria', desc: 'Air cargo & doorstep transit' },
];

export const CustomerTrackingView: React.FC<CustomerTrackingViewProps> = ({
  requests,
  selectedRequestId,
  onSelectRequest,
  onRefresh,
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentOption, setPaymentOption] = useState<'bank' | 'card' | 'whatsapp'>('bank');
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Active request to display
  const activeRequest =
    requests.find((r) => r.id === selectedRequestId) || requests[0] || null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = requests.find(
      (r) =>
        r.id.toLowerCase() === searchInput.trim().toLowerCase() ||
        r.whatsappPhone.includes(searchInput.trim()) ||
        r.customerName.toLowerCase().includes(searchInput.trim().toLowerCase())
    );
    if (found) {
      onSelectRequest(found.id);
    } else {
      alert(`No request found matching "${searchInput}". Please check your Request ID (e.g. UKS-4821).`);
    }
  };

  const getStageIndex = (status: CustomerRequest['status']) => {
    return STAGES.findIndex((s) => s.key === status);
  };

  const currentStageIndex = activeRequest ? getStageIndex(activeRequest.status) : 0;

  const handleApproveAndPay = () => {
    if (!activeRequest) return;
    setPaymentProcessing(true);

    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      updateRequestStatus(activeRequest.id, 'approved', {
        adminNotes: 'Customer approved quotation and completed simulated Naira payment.',
      });
      onRefresh();

      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
      }, 1500);
    }, 1200);
  };

  if (!activeRequest) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No requests submitted yet</h2>
        <p className="text-slate-500 text-sm mt-1">Submit your first UK product request to track its journey.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header and Lookup Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Track Your Product Request</h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Live updates directly from your personal UK sourcing contact.
          </p>
        </div>

        {/* Search by Request ID */}
        <form onSubmit={handleSearch} className="w-full sm:w-auto flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter ID (e.g. UK2N-4821)"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shrink-0 transition"
          >
            Find
          </button>
        </form>
      </div>

      {/* Quick Switcher of Recent Requests */}
      {requests.length > 1 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Recent:</span>
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => onSelectRequest(req.id)}
              className={`px-3 py-1.5 rounded-lg border font-medium shrink-0 transition flex items-center gap-1.5 ${
                activeRequest.id === req.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono">{req.id}</span>
              <span>·</span>
              <span className="truncate max-w-[120px]">{req.items[0]?.name || 'Item'}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Request Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        {/* Top Info Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wide text-emerald-400">
                {activeRequest.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {activeRequest.status.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Customer: <strong className="text-white">{activeRequest.customerName}</strong> ({activeRequest.whatsappPhone})
              · Destination: <strong className="text-white">{activeRequest.deliveryCity}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Logged On</span>
            <span className="text-xs font-medium text-slate-200">
              {new Date(activeRequest.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* 6-Stage Progress Stepper */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">Fulfillment Journey</div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 relative z-10">
              {STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage.key} className="flex sm:flex-col items-center sm:text-center gap-2 sm:gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition shrink-0 ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-slate-900 text-white ring-4 ring-slate-200'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-semibold ${
                          isCurrent ? 'text-slate-900' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {stage.label.split('. ')[1]}
                      </div>
                      <div className="text-[10px] text-slate-500 hidden sm:block">{stage.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Request Items Details Section */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Requested Items</h3>
          <div className="space-y-3">
            {activeRequest.items.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-start gap-3">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-300 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                      ITEM {idx + 1}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{item.name || 'UK Sourced Product'}</h4>
                      {item.dontKnowName && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                          Photo / Equivalent Request
                        </span>
                      )}
                    </div>
                    {item.brand && <p className="text-xs text-slate-600 mt-0.5">Brand: {item.brand}</p>}
                    {item.specs && <p className="text-xs text-slate-500 mt-0.5">Specs: {item.specs}</p>}
                    {item.whatItDoesOrLooksLike && (
                      <p className="text-xs text-amber-900 mt-0.5 italic">
                        Customer notes: "{item.whatItDoesOrLooksLike}"
                      </p>
                    )}
                    {item.referenceUrl && (
                      <a
                        href={item.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline mt-1"
                      >
                        <span>View reference link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUOTATION SECTION (Visible if status is 'quoted', 'approved', 'purchased', or 'dispatched') */}
        {activeRequest.quotation ? (
          <div className="p-6 bg-emerald-50/40 border-b border-emerald-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Verified Landed Quotation (DDP Lagos / Nigeria)
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Guaranteed All-Inclusive Rate
              </span>
            </div>

            {/* Price Line-Items */}
            <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block mb-0.5">Verified UK Retailer Sourced:</span>
                  <strong className="text-slate-900 text-sm">{activeRequest.quotation.retailerFound}</strong>
                  {activeRequest.quotation.sourcingNotes && (
                    <p className="text-slate-500 mt-1 italic">{activeRequest.quotation.sourcingNotes}</p>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Estimated Delivery Timeframe:</span>
                  <strong className="text-slate-900">{activeRequest.quotation.estimatedDeliveryDays}</strong>
                  <span className="block text-slate-400 mt-1">
                    Via scheduled weekly air cargo (Heathrow ➔ Lagos Murtala Muhammed Airport)
                  </span>
                </div>
              </div>

              {/* Cost breakdown table */}
              <div className="pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>1. UK Store Retail Price (GBP):</span>
                  <span className="font-mono font-medium">£{activeRequest.quotation.ukRetailPriceGbp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>2. UK Sourcing & Inspection Fee (12% / min £15):</span>
                  <span className="font-mono font-medium">£{activeRequest.quotation.sourcingFeeGbp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>3. International Air Freight to Lagos (£9.50/kg):</span>
                  <span className="font-mono font-medium">£{activeRequest.quotation.airFreightGbp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>4. Lagos Customs Clearance & DDP Port Handling:</span>
                  <span className="font-mono font-medium">£{activeRequest.quotation.customsHandlingGbp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-semibold pt-1 border-t border-slate-100">
                  <span>Subtotal in British Pounds:</span>
                  <span className="font-mono">£{activeRequest.quotation.totalGbp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Exchange Rate Benchmark (Locked):</span>
                  <span>£1.00 = ₦{activeRequest.quotation.fxRate.toLocaleString()}</span>
                </div>

                {/* Landed Total in Naira */}
                <div className="mt-3 p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-300 uppercase tracking-wider block">
                      Total Payable in Nigerian Naira (₦)
                    </span>
                    <span className="text-xs text-emerald-400">Zero hidden customs surcharges at delivery</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black font-mono text-emerald-300">
                      ₦{activeRequest.quotation.totalNgn.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons based on status */}
            {activeRequest.status === 'quoted' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Quotation locked for 48 hours to protect against foreign exchange fluctuations.</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Approve & Authorise Purchase (Pay in ₦)</span>
                </button>
              </div>
            )}

            {activeRequest.status === 'approved' && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Quotation Approved!</strong> Your pre-funded payment has been received in Naira and converted
                  to GBP. UK operator is purchasing directly from the retailer.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Sourcing in progress state */
          <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                UK Sourcing Contact is Preparing Your Quotation
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                We are verifying availability, comparing UK retailer prices, and calculating exact air freight. Your
                quotation will appear here and be sent to your WhatsApp ({activeRequest.whatsappPhone}).
              </p>
            </div>
          </div>
        )}

        {/* VERIFIED PURCHASE PROOF (Visible if status is 'purchased' or 'dispatched') */}
        {activeRequest.purchaseProof && (
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-slate-800" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Verified UK Purchase & Quality Control Proof
              </h3>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 mb-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Purchased From:</span>
                  <strong className="text-slate-900">{activeRequest.purchaseProof.storeName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Retail Receipt / Invoice #:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {activeRequest.purchaseProof.receiptNumber || 'Attached'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">QC Inspection Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    100% Passed (Tamper Seal Intact)
                  </span>
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="mt-3">
                <span className="text-[11px] font-medium text-slate-500 block mb-2">
                  London Warehouse Inspection Photos (Taken before flight departure):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeRequest.purchaseProof.qcPhotos.map((photo, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-28 object-cover" />
                      <div className="p-2">
                        <div className="text-[11px] font-bold text-slate-800 truncate">{photo.title}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{photo.description}</div>
                      </div>
                    </div>
                  ))}
                  {activeRequest.purchaseProof.receiptImageUrl && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img
                        src={activeRequest.purchaseProof.receiptImageUrl}
                        alt="Retail Receipt"
                        className="w-full h-28 object-cover"
                      />
                      <div className="p-2">
                        <div className="text-[11px] font-bold text-slate-800">Store Receipt</div>
                        <div className="text-[10px] text-slate-500">Original UK Tax Invoice</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DISPATCH & AIR CARGO TRANSIT (Visible if status is 'dispatched') */}
        {activeRequest.dispatchInfo && (
          <div className="p-6 bg-blue-50/40 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Plane className="w-5 h-5 text-blue-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                International Air Cargo & Delivery Transit
              </h3>
            </div>

            <div className="bg-white rounded-xl p-4 border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Air Carrier & Route:</span>
                <strong className="text-slate-900">{activeRequest.dispatchInfo.carrier}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Air Waybill / Tracking #:</span>
                <span className="font-mono font-bold text-blue-700">{activeRequest.dispatchInfo.trackingNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Estimated Doorstep Arrival:</span>
                <strong className="text-slate-900">{activeRequest.dispatchInfo.deliveryEstimatedDate}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Help & WhatsApp Contact Banner */}
        <div className="p-4 sm:p-5 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Have questions about this request? Your UK contact is available on WhatsApp.</span>
          </div>

          <a
            href={`https://wa.me/447700900123?text=Hello%20UK2Naija!%20Inquiring%20about%20my%20request%20${activeRequest.id}%20(${activeRequest.customerName})`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Simulated Payment Modal */}
      {showPaymentModal && activeRequest.quotation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Authorise Purchase & Pay in Naira</h3>
            <p className="text-xs text-slate-500 mb-4">
              Pay 100% locally in Naira. We convert to GBP and purchase directly from the UK merchant.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4 text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Payable Amount:</span>
                <strong className="font-mono text-slate-900 text-sm">
                  ₦{activeRequest.quotation.totalNgn.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Equivalent in GBP:</span>
                <span>£{activeRequest.quotation.totalGbp.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-2 mb-5">
              <label
                onClick={() => setPaymentOption('bank')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition ${
                  paymentOption === 'bank' ? 'border-slate-900 bg-slate-50 font-medium' : 'border-slate-200'
                }`}
              >
                <Building className="w-4 h-4 text-slate-700" />
                <div className="grow">
                  <div className="text-slate-900 font-semibold">Instant Virtual NUBAN Bank Transfer</div>
                  <div className="text-slate-500 text-[11px]">Titan Trust / Wema Bank Virtual Account</div>
                </div>
              </label>

              <label
                onClick={() => setPaymentOption('card')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition ${
                  paymentOption === 'card' ? 'border-slate-900 bg-slate-50 font-medium' : 'border-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-700" />
                <div className="grow">
                  <div className="text-slate-900 font-semibold">Nigerian Debit Card (Paystack)</div>
                  <div className="text-slate-500 text-[11px]">Mastercard, Visa, Verve (Standard NGN limits apply)</div>
                </div>
              </label>

              <label
                onClick={() => setPaymentOption('whatsapp')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition ${
                  paymentOption === 'whatsapp' ? 'border-slate-900 bg-slate-50 font-medium' : 'border-slate-200'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <div className="grow">
                  <div className="text-slate-900 font-semibold">Confirm via WhatsApp Concierge</div>
                  <div className="text-slate-500 text-[11px]">Manual corporate bank transfer with receipt upload</div>
                </div>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={paymentProcessing}
                onClick={handleApproveAndPay}
                className="w-2/3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                {paymentProcessing ? (
                  <span>Securing GBP Funds...</span>
                ) : paymentSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Payment Approved!</span>
                  </>
                ) : (
                  <span>Confirm ₦{activeRequest.quotation.totalNgn.toLocaleString()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
