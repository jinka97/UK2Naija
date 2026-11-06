import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Camera,
  FileCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'pricing' | 'trust' | 'shipping' | 'customs';
}

const FAQS: FaqItem[] = [
  {
    category: 'pricing',
    question: 'How do you calculate the exchange rate and will it change after I submit?',
    answer:
      'We use a live benchmark UK Pound to Naira exchange rate with a minimal 2.5% treasury liquidity buffer. Once we issue your official quotation, the quoted Naira rate is locked for a full 48 hours. Even if the FX market fluctuates before you pay your deposit, your quoted cost remains 100% fixed.',
  },
  {
    category: 'customs',
    question: 'Will I have to pay unexpected customs fees or demurrage when my parcel arrives in Nigeria?',
    answer:
      'Never. All Jamlu shipments are strictly Delivered Duty Paid (DDP). Customs duties, airport handling charges, and terminal clearance at Lagos Murtala Muhammed or Abuja Nnamdi Azikiwe International Airports are pre-calculated and cleared by our licensed clearing team. The amount on your quotation is the final amount you pay to your doorstep.',
  },
  {
    category: 'trust',
    question: 'How do I know my products are original and not counterfeit or factory seconds?',
    answer:
      'We buy directly from authorized UK high-street retailers (Boots, Apple, Next, Clarks, Smiggle, John Lewis, TK Maxx). Every purchase is accompanied by the official UK paper retail VAT invoice with store location and timestamp. Before flight dispatch, our London warehouse performs a 5-point physical QC inspection and uploads high-resolution photos of tamper seals, batch codes, and electrical plugs to your tracking dashboard.',
  },
  {
    category: 'pricing',
    question: 'How does the 70% / 30% Split-Payment Milestone work?',
    answer:
      'For orders over £50, you can choose our milestone payment structure. You pay a 70% procurement deposit in Naira via bank transfer or debit card to lock your purchase in the UK. The remaining 30% logistics balance is only payable after you inspect and approve your verified London QC photographs and paper receipts before flight departure.',
  },
  {
    category: 'shipping',
    question: 'How fast will my parcel arrive in Nigeria?',
    answer:
      'Standard Air Cargo leaves London Heathrow every Friday and arrives in Lagos for customs clearance within 5-7 business days. Express Priority shipments depart mid-week with a 2-4 business day turnaround. Once cleared, local riders deliver directly to your address in Lagos, Abuja, Kano, Kaduna, Jos, Port Harcourt, and nationwide.',
  },
  {
    category: 'trust',
    question: 'What happens if an item is out of stock or arrives damaged at the London warehouse?',
    answer:
      'Because our team inspects goods inside the UK while still within the UK retailer’s return window, any wrong size, defect, or damage is returned or exchanged with the UK merchant immediately at zero cost to you. If an item is completely out of stock across UK stores, your funds are refunded immediately in full in Naira.',
  },
];

export const TrustAndFaqSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-[#FAF8F5] py-14 px-4 sm:px-6 border-t border-stone-200">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#D9B77A] mb-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D9B77A]" />
            <span>Built on Total Provenance & Certainty</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B2A] tracking-tight">
            How Jamlu Removes Cross-Border Shopping Risk
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto mt-2">
            No mysteries, no card limits, and no clearance surprises. Here is how we address the common pain points of shopping from the UK.
          </p>
        </div>

        {/* 5 Friction Points Solved Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#102B2A] text-[#D9B77A] flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#102B2A] mb-1">
                  The Quotation Problem Solved
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  No endless waiting without feedback. Quotes are generated within <strong>2 hours</strong> and locked for <strong>48 hours</strong> at current prevailing benchmark rates.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#102B2A] text-[#D9B77A] flex items-center justify-center shrink-0 mt-0.5">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#102B2A] mb-1">
                  The Card Limits & FX Problem Solved
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Bypass Nigerian bank card $20/month international limits. Pay locally in Naira via bank transfer or card with fully disclosed, transparent itemized fees.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#102B2A] text-[#D9B77A] flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#102B2A] mb-1">
                  The Trust & Counterfeit Problem Solved
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Direct physical sourcing in official London flagship stores. 5-point physical inspection, high-res photos, and paper retail VAT receipts uploaded before flight dispatch.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#102B2A] text-[#D9B77A] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#102B2A] mb-1">
                  The Customs Demurrage Problem Solved
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  100% Guaranteed DDP (Delivered Duty Paid). Customs clearing and airport handling are pre-cleared by our team—zero surprise demurrage fees at delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
            <HelpCircle className="w-4 h-4 text-[#D9B77A]" />
            <h3 className="font-bold text-base text-[#102B2A]">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-stone-200/80 rounded-xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-900 bg-stone-50/50 hover:bg-stone-100/50 transition cursor-pointer"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transform transition-transform ${
                      openFaqIndex === idx ? 'rotate-180 text-[#102B2A]' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="p-4 bg-white text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
