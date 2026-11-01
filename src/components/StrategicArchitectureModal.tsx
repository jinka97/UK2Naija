import React, { useState } from 'react';
import { X, BookOpen, Layers, TrendingUp, ShieldCheck, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { BENCHMARK_FX_RATE } from '../services/storage';

export const StrategicArchitectureDossier: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'economics' | 'regulatory' | 'roadmap'>('strategy');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Dossier Header */}
      <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-lg font-bold">UK–Nigeria Strategic Architectural Dossier</h2>
            <p className="text-slate-400 text-xs">
              Stages 1–7 Sourcing Mechanics, Landed Cost Mathematics, NCS/NAFDAC Rules & 90-Day Scaling
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
          Admin Confidential
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-semibold shrink-0 overflow-x-auto">
        {[
          { key: 'strategy', label: '1. Model & Opportunity' },
          { key: 'economics', label: '2. Unit Economics & Pricing Formula' },
          { key: 'regulatory', label: '3. Logistics & NCS/NAFDAC Rules' },
          { key: 'roadmap', label: '4. 90-Day Agile Scaling Plan' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeTab === t.key
                ? 'border-slate-900 text-slate-900 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 text-xs text-slate-700 space-y-4">
        {activeTab === 'strategy' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <h3 className="font-bold text-emerald-950 text-sm mb-1">
                The Demand-Led Asymmetric Advantage
              </h3>
              <p className="text-emerald-900 leading-relaxed">
                Instead of capital-intensive retail inventory or drop-shipping Chinese replicas, KoraBridge acts as a
                trusted UK Sourcing Concierge. Customers have Naira liquidity but face a $0–$100 international card
                limit. By collecting Naira and purchasing directly in GBP from Boots, Apple, and Clarks, we unlock
                authentic British goods with zero inventory risk.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block mb-1">1. Beachhead: Affluent Parents</span>
                <p className="text-slate-600">
                  High WTP on infant formula (Aptamil, Kendamil) where counterfeit risk in Lagos open markets is unacceptable.
                  Orders repeat every 4-6 weeks.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block mb-1">2. Beachhead: Tech Professionals</span>
                <p className="text-slate-600">
                  High average basket (£800–£1,400) for genuine UK-spec MacBooks and audio equipment with valid Apple receipts and
                  Type G 3-pin adapters.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block mb-1">3. Skincare & Healthcare</span>
                <p className="text-slate-600">
                  Boots Soltan, CeraVe UK, and Littmann stethoscopes where provenance and cold-storage handling guarantee active ingredients.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'economics' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl font-mono">
              <span className="text-emerald-400 font-bold block mb-2">// LANDED COST ALGORITHMIC EQUATION</span>
              <p className="text-xs text-slate-300">
                Total Landed Cost = (P_uk + Shipping_uk + Commission + Freight_air + Handling_lagos) × (FX_spot × 1.025)
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-sans">
                <p>• Commission: Max(12% × P_uk, £15.00 min floor)</p>
                <p>• Freight: Billable weight × £9.50/kg</p>
                <p>• Benchmark Rate: £1.00 = ₦{BENCHMARK_FX_RATE.toLocaleString()} with 2.5% slippage hedge</p>
                <p>• Breakeven Volume: Only 12 monthly orders to achieve operating cash-flow positive.</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h4 className="font-bold text-slate-900 mb-2">HMRC Notice 703 (UK Export VAT Zero-Rating Opportunity)</h4>
              <p className="text-slate-600 leading-relaxed">
                On non-exempt UK goods (electronics, luxury fashion), formal direct export allows zero-rating of the 20%
                UK VAT, generating a 16.7% procurement margin upside that can either be retained as profit or passed on as a price discount.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'regulatory' && (
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 mb-1">Nigerian Customs Service (NCS) & DDP Courier Route</h4>
              <p className="text-slate-600 leading-relaxed">
                Consolidated shipments fly via British Airways Cargo (LHR ➔ LOS) under Courier Express Simplified Manifest.
                Personal-use quantities (sub-£1,000) are exempt from commercial Form M and commercial SONCAP dossiers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 mb-1">NAFDAC Personal Import Exemption</h4>
              <p className="text-slate-600 leading-relaxed">
                Personal quantities of infant milk and vitamins (under 6 tins per order) are classified as private personal effects,
                avoiding the 6-month lab registration delay required for commercial import containers.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-3">
            <div className="border-l-2 border-emerald-600 pl-3 py-1">
              <span className="font-bold text-slate-900 block">Days 1–30: Micro-Cohort Pilot (25 Orders)</span>
              <p className="text-slate-600">
                Acquire initial 25 orders from Lekki/Abuja parent WhatsApp groups and tech networks. Validate 5–7 day air transit SLA.
              </p>
            </div>
            <div className="border-l-2 border-slate-400 pl-3 py-1">
              <span className="font-bold text-slate-900 block">Days 31–60: Automated Quotations & WhatsApp Webhooks</span>
              <p className="text-slate-600">
                Scale to 50–70 monthly orders. Connect automated Google Sheets webhook triggers and automated WhatsApp milestone alerts.
              </p>
            </div>
            <div className="border-l-2 border-slate-400 pl-3 py-1">
              <span className="font-bold text-slate-900 block">Days 61–90: Fast-Track Vault & B2B Clinic Procurement</span>
              <p className="text-slate-600">
                Introduce pre-negotiated volume bundles for baby essentials and diagnostic equipment; expand into Ghana (Accra hub).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StrategicArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategicArchitectureModal: React.FC<StrategicArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <StrategicArchitectureDossier />
      </div>
    </div>
  );
};
