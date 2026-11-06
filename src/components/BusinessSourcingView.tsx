import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  FileText,
  Percent,
  Plane,
  Ship,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { CustomerRequest, ProductItem, BudgetOption } from '../types';
import { createNewRequest } from '../services/storage';

interface BusinessSourcingViewProps {
  onRequestSubmitted: (newRequest: CustomerRequest) => void;
  onOpenTrackView: (requestId: string) => void;
}

const BUSINESS_SECTORS = [
  {
    title: 'Clinics & Hospitals',
    icon: '🩺',
    examples: '3M Littmann stethoscopes, CE-certified ultrasound scanners, surgical instruments, autoclave units.',
    vatReclaim: 'Eligible for 20% UK VAT zero-rate',
  },
  {
    title: 'IT & Enterprise Fleets',
    icon: '💻',
    examples: 'Apple MacBooks (UK English keyboards), Dell servers, Cisco networking switches, Starlink enterprise kits.',
    vatReclaim: 'Commercial pro-forma invoicing',
  },
  {
    title: 'Fashion & Retail Boutiques',
    icon: '👗',
    examples: 'Bulk Next UK childrenswear palettes, ASOS boutique wholesale lots, TK Maxx designer fragrance bundles.',
    vatReclaim: 'Direct retail VAT receipts',
  },
  {
    title: 'Industrial & Solar Engineering',
    icon: '⚡',
    examples: 'Victron Energy inverters, CAT generator filters, specialized diagnostic tools, precision flow meters.',
    vatReclaim: 'Sea & Air freight consolidation',
  },
];

export const BusinessSourcingView: React.FC<BusinessSourcingViewProps> = ({
  onRequestSubmitted,
  onOpenTrackView,
}) => {
  const [companyName, setCompanyName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('+234 ');
  const [businessEmail, setBusinessEmail] = useState<string>('');
  const [sector, setSector] = useState<string>(BUSINESS_SECTORS[0].title);
  const [requiredItemsDesc, setRequiredItemsDesc] = useState<string>('');
  const [estimatedQuantity, setEstimatedQuantity] = useState<string>('5 - 20 units');
  const [logisticsMode, setLogisticsMode] = useState<'air' | 'sea'>('air');
  const [deliveryCity, setDeliveryCity] = useState<string>('Lagos (Commercial Terminal / Ikeja / Island)');
  const [submittedRequest, setSubmittedRequest] = useState<CustomerRequest | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const items: ProductItem[] = [
      {
        id: 'b2b-item-' + Date.now(),
        name: `B2B Procurement: ${sector} Equipment & Stock`,
        brand: companyName.trim() || 'Commercial Buyer',
        quantity: parseInt(estimatedQuantity) || 10,
        specs: `Company: ${companyName} | Sector: ${sector} | Volume: ${estimatedQuantity} | Freight: ${logisticsMode === 'air' ? 'Commercial Air Cargo' : 'Ocean Sea Freight'} | Requirements: ${requiredItemsDesc.trim()}`,
      },
    ];

    const newReq = createNewRequest({
      corridor: 'uk-to-ng',
      customerName: `${contactPerson.trim()} (${companyName.trim() || 'Business Buyer'})`,
      whatsappPhone: whatsappPhone.trim(),
      deliveryCity,
      deliveryAddress: `Corporate Delivery: ${companyName}`,
      category: `Corporate B2B: ${sector}`,
      items,
      budget: 'over500' as BudgetOption,
    });

    setSubmittedRequest(newReq);
    onRequestSubmitted(newReq);
  };

  if (submittedRequest) {
    const whatsappText = encodeURIComponent(
      `Hello Jamlu B2B Desk! We just submitted a commercial procurement inquiry (#${submittedRequest.id}) on behalf of ${companyName} for: ${requiredItemsDesc.slice(0, 100)}... Please assign our corporate procurement officer.`
    );
    const whatsappUrl = `https://wa.me/447700900123?text=${whatsappText}`;

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-[#102B2A] text-[#D9B77A] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-[#D9B77A] mb-1 block">
            Commercial Sourcing Request Logged
          </span>

          <h2 className="text-2xl font-extrabold text-[#102B2A] mb-2">
            Reference: {submittedRequest.id}
          </h2>

          <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">
            A dedicated Jamlu corporate sourcing specialist has been assigned to {companyName}. We are contacting verified UK distributors and preparing your formal commercial pro-forma invoice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-[#102B2A] hover:bg-[#1b3d3c] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Connect with B2B Sourcing Lead</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenTrackView(submittedRequest.id)}
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
          <Briefcase className="w-3.5 h-3.5 text-[#D9B77A]" />
          <span>Jamlu Business & Corporate Sourcing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B2A] tracking-tight">
          Procure Wholesale Equipment, Spares & Stock from the UK.
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1 max-w-2xl">
          Purpose-built for Nigerian clinics, schools, engineering firms, and retail boutiques. Receive commercial pro-forma invoices, UK VAT reclaim guidance, and secure sea or air freight.
        </p>
      </div>

      {/* 4 Pillars of Corporate Sourcing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#102B2A] text-[#D9B77A] flex items-center justify-center mb-3">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-1">
            Commercial Pro-Forma
          </h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Proper itemized pro-forma invoices with UK company registration numbers, suitable for corporate treasury and board audits.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#102B2A] text-[#D9B77A] flex items-center justify-center mb-3">
            <Percent className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-1">
            UK VAT Reclaim Support
          </h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Guidance on zero-rated export purchases for qualifying goods, saving your business up to 20% off UK retail list pricing.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#102B2A] text-[#D9B77A] flex items-center justify-center mb-3">
            <Plane className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-1">
            Commercial Air Cargo
          </h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Heavy parcel consolidated air freight with guaranteed Lagos/Abuja airport terminal handling and zero demurrage surprises.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#102B2A] text-[#D9B77A] flex items-center justify-center mb-3">
            <Ship className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-1">
            Ocean Sea Freight (LCL/FCL)
          </h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Cost-efficient sea container options for industrial spares, bulky salon supplies, or heavy educational lab setups.
          </p>
        </div>
      </div>

      {/* Corporate Intake Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h3 className="text-base font-bold text-[#102B2A]">Submit Commercial Sourcing Specification</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Our London trade desk will evaluate vendor pricing, distributor bulk discounts, and freight options within 4 business hours.
          </p>
        </div>

        {/* Sector Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
            1. Industry or Business Sector
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUSINESS_SECTORS.map((sec) => (
              <button
                key={sec.title}
                type="button"
                onClick={() => setSector(sec.title)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  sector === sec.title
                    ? 'border-[#102B2A] bg-[#102B2A] text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-white text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{sec.icon}</span>
                  <span className="font-bold text-xs">{sec.title}</span>
                </div>
                <div className={`text-[10.5px] line-clamp-2 ${sector === sec.title ? 'text-stone-300' : 'text-stone-500'}`}>
                  {sec.examples}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Company & Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Company / Institution Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Apex Health Clinic Ltd / Haven Schools"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#102B2A] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Procurement Officer / Contact Person *
            </label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Dr. Adeyemi Coker / Ngozi Okafor"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#102B2A] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              WhatsApp Contact Number *
            </label>
            <input
              type="text"
              required
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="+234 809 000 0000"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono focus:outline-none focus:border-[#102B2A] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Corporate Email Address
            </label>
            <input
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="procurement@yourcompany.com.ng"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#102B2A] focus:bg-white"
            />
          </div>
        </div>

        {/* Requirements description */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
            Required Equipment, Part Numbers or Sourcing Specifications *
          </label>
          <textarea
            required
            rows={3}
            value={requiredItemsDesc}
            onChange={(e) => setRequiredItemsDesc(e.target.value)}
            placeholder="Detail model numbers, UK brand preferences, certifications (CE/ISO), voltage specs (230V UK 3-pin standard), and target lead times..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#102B2A] focus:bg-white"
          />
        </div>

        {/* Volume & Freight Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Target Order Volume
            </label>
            <select
              value={estimatedQuantity}
              onChange={(e) => setEstimatedQuantity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white"
            >
              <option value="1 - 5 units (High-Value Diagnostic / Specialized)">1 - 5 units (High-Value Diagnostic / Specialized)</option>
              <option value="5 - 20 units (Boutique / Clinic Batch)">5 - 20 units (Boutique / Clinic Batch)</option>
              <option value="20 - 100 units (Bulk Stocking / Multi-Pallet)">20 - 100 units (Bulk Stocking / Multi-Pallet)</option>
              <option value="Full Pallet / Container Lot">Full Pallet / Container Lot</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Preferred Logistics Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLogisticsMode('air')}
                className={`p-2 rounded-xl border text-xs font-semibold text-center cursor-pointer transition ${
                  logisticsMode === 'air'
                    ? 'border-[#102B2A] bg-[#102B2A] text-white'
                    : 'border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                ✈️ Air Cargo (5-7 Days)
              </button>
              <button
                type="button"
                onClick={() => setLogisticsMode('sea')}
                className={`p-2 rounded-xl border text-xs font-semibold text-center cursor-pointer transition ${
                  logisticsMode === 'sea'
                    ? 'border-[#102B2A] bg-[#102B2A] text-white'
                    : 'border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                🚢 Sea Freight (3-4 Weeks)
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-6 bg-[#102B2A] hover:bg-[#1b3d3c] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
        >
          <span>Submit Commercial Procurement Request</span>
          <ArrowRight className="w-4 h-4 text-[#D9B77A]" />
        </button>
      </form>
    </div>
  );
};
