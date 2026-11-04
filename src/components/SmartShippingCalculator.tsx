import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ArrowRight,
  Plane,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Box,
  MapPin,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { getBenchmarkFxRate } from '../services/fxService';
import { SOURCING_FEE_PCT, SOURCING_FEE_MIN, AIR_FREIGHT_PER_KG, CUSTOMS_CLEARING_FLAT } from '../services/storage';

interface SmartShippingCalculatorProps {
  onProceedToBuyForMe?: (estimateData: {
    category: string;
    ukPriceGbp: number;
    weightKg: number;
    deliveryCity: string;
    totalNgn: number;
  }) => void;
}

const CATEGORY_PRESETS = [
  { name: 'Fashion, Shoes & Trainers', avgWeight: 1.5, length: 34, width: 22, height: 13, note: 'Shoebox dimensions typically apply' },
  { name: 'Kids, School & Smiggle Bags', avgWeight: 1.2, length: 42, width: 30, height: 18, note: 'Volumetric weight applies due to backpack volume' },
  { name: 'Designer Clearance & Luxury', avgWeight: 1.8, length: 35, width: 25, height: 15, note: 'Includes protective packaging' },
  { name: 'Electronics & Gadgets', avgWeight: 2.2, length: 30, width: 22, height: 8, note: 'Tamper-proof protective wrap included' },
  { name: 'Beauty, Skincare & Fragrance', avgWeight: 0.8, length: 20, width: 15, height: 10, note: 'Liquid/cream compliant air packaging' },
  { name: 'Baby & Infant Formula (4 tins)', avgWeight: 3.6, length: 32, width: 32, height: 20, note: '4x 800g tins with shock insulation' },
  { name: 'Medical, Diagnostic & Tools', avgWeight: 2.5, length: 35, width: 25, height: 15, note: 'Fragile calibration handling' },
];

const DESTINATIONS = [
  { city: 'Lagos (Lekki / Ikoyi / Victoria Island)', localDeliveryGbp: 3.5, label: 'Lagos Island Hub' },
  { city: 'Lagos (Ikeja GRA / Mainland / Tech Hub)', localDeliveryGbp: 3.5, label: 'Lagos Mainland Hub' },
  { city: 'Abuja (Maitama / Wuse II / Asokoro)', localDeliveryGbp: 5.0, label: 'Abuja Central Metro' },
  { city: 'Kano (Bompai / Nassarawa / Kano State)', localDeliveryGbp: 6.5, label: 'Kano Northern Hub' },
  { city: 'Kaduna (Kaduna North / Barnawa)', localDeliveryGbp: 6.5, label: 'Kaduna Hub' },
  { city: 'Jos (Rayfield / Jos North / Plateau)', localDeliveryGbp: 6.5, label: 'Jos Northern Hub' },
  { city: 'Port Harcourt (Trans-Amadi / GRA)', localDeliveryGbp: 6.0, label: 'Port Harcourt Hub' },
  { city: 'Ibadan (Bodija / Jericho / Oyo State)', localDeliveryGbp: 5.0, label: 'Ibadan Metro' },
  { city: 'Other Nigerian City (Direct Courier Waybill)', localDeliveryGbp: 7.5, label: 'Nationwide Delivery' },
];

export const SmartShippingCalculator: React.FC<SmartShippingCalculatorProps> = ({
  onProceedToBuyForMe,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORY_PRESETS[0].name);
  const [ukItemPriceGbp, setUkItemPriceGbp] = useState<number>(85);
  const [actualWeightKg, setActualWeightKg] = useState<number>(1.5);
  const [lengthCm, setLengthCm] = useState<number>(34);
  const [widthCm, setWidthCm] = useState<number>(22);
  const [heightCm, setHeightCm] = useState<number>(13);
  const [useDimensions, setUseDimensions] = useState<boolean>(true);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [deliveryCity, setDeliveryCity] = useState<string>(DESTINATIONS[0].city);

  const fxRate = getBenchmarkFxRate();

  // Volumetric weight formula: (L x W x H in cm) / 6000 (standard IATA cargo divisor)
  const volumetricWeightKg = useMemo(() => {
    if (!useDimensions || lengthCm <= 0 || widthCm <= 0 || heightCm <= 0) return 0;
    return Number(((lengthCm * widthCm * heightCm) / 6000).toFixed(2));
  }, [useDimensions, lengthCm, widthCm, heightCm]);

  const billableWeightKg = useMemo(() => {
    return Math.max(actualWeightKg, volumetricWeightKg);
  }, [actualWeightKg, volumetricWeightKg]);

  const isVolumetricHigher = volumetricWeightKg > actualWeightKg;

  // Pricing calculations
  const sourcingFeeGbp = Math.max(ukItemPriceGbp * SOURCING_FEE_PCT, SOURCING_FEE_MIN);
  const freightRatePerKg = shippingMethod === 'standard' ? AIR_FREIGHT_PER_KG : 14.5;
  const freightCostGbp = Number((billableWeightKg * freightRatePerKg).toFixed(2));
  const customsClearingGbp = CUSTOMS_CLEARING_FLAT;

  const destinationObj = DESTINATIONS.find((d) => d.city === deliveryCity) || DESTINATIONS[0];
  const localDeliveryGbp = destinationObj.localDeliveryGbp;

  const totalGbp = Number((ukItemPriceGbp + sourcingFeeGbp + freightCostGbp + customsClearingGbp + localDeliveryGbp).toFixed(2));
  const totalNgn = Math.round(totalGbp * fxRate);

  // Split payment milestones: 70% deposit / 30% balance
  const deposit70Ngn = Math.round(totalNgn * 0.7);
  const balance30Ngn = totalNgn - deposit70Ngn;

  const handleApplyPreset = (preset: typeof CATEGORY_PRESETS[0]) => {
    setSelectedCategory(preset.name);
    setActualWeightKg(preset.avgWeight);
    setLengthCm(preset.length);
    setWidthCm(preset.width);
    setHeightCm(preset.height);
  };

  const handleProceed = () => {
    if (onProceedToBuyForMe) {
      onProceedToBuyForMe({
        category: selectedCategory,
        ukPriceGbp: ukItemPriceGbp,
        weightKg: billableWeightKg,
        deliveryCity,
        totalNgn,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Editorial Header */}
      <div className="mb-8 text-center sm:text-left border-b border-stone-200/80 pb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#D9B77A] mb-1.5 flex items-center justify-center sm:justify-start gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-[#D9B77A]" />
          <span>Transparent Landed Cost Calculator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B2A] tracking-tight">
          Know Exactly What You'll Pay in Naira.
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1 max-w-2xl">
          No hidden terminal extortion, unexpected demurrage, or black-market FX spreads. Calculate your itemized landed cost before spending a penny.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Input Desk (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Quick Presets */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              1. What kind of item are you shipping?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer ${
                    selectedCategory === preset.name
                      ? 'border-[#102B2A] bg-[#102B2A] text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50/60 hover:bg-white text-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="font-semibold leading-tight">{preset.name}</div>
                  <div className={`text-[10.5px] mt-0.5 ${selectedCategory === preset.name ? 'text-stone-300' : 'text-stone-500'}`}>
                    ~{preset.avgWeight}kg · {preset.note}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Weight Inputs */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  UK Retail Price (£ GBP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-sm">£</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={ukItemPriceGbp}
                    onChange={(e) => setUkItemPriceGbp(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-stone-50/60 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-[#102B2A] focus:bg-white"
                  />
                </div>
                <span className="text-[10.5px] text-stone-500 mt-1 block">
                  ≈ ₦{(ukItemPriceGbp * fxRate).toLocaleString()} at £1 = ₦{fxRate.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Estimated Weight (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={actualWeightKg}
                    onChange={(e) => setActualWeightKg(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full px-3 py-2 text-sm bg-stone-50/60 border border-stone-200 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-[#102B2A] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-stone-400 text-xs font-medium">kg</span>
                </div>
                <span className="text-[10.5px] text-stone-500 mt-1 block">
                  Scale weight of your goods
                </span>
              </div>
            </div>

            {/* Volumetric Weight Check (L x W x H) */}
            <div className="border-t border-stone-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-stone-500" />
                  <span>Parcel Dimensions (Volumetric Check)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setUseDimensions(!useDimensions)}
                  className="text-[11px] text-[#D9B77A] font-semibold hover:underline cursor-pointer"
                >
                  {useDimensions ? 'Disable Dimensions' : 'Enable Dimensions'}
                </button>
              </div>

              {useDimensions && (
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-stone-500 uppercase font-semibold mb-1">Length (cm)</label>
                    <input
                      type="number"
                      min="1"
                      value={lengthCm}
                      onChange={(e) => setLengthCm(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-center font-medium focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 uppercase font-semibold mb-1">Width (cm)</label>
                    <input
                      type="number"
                      min="1"
                      value={widthCm}
                      onChange={(e) => setWidthCm(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-center font-medium focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 uppercase font-semibold mb-1">Height (cm)</label>
                    <input
                      type="number"
                      min="1"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-center font-medium focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {useDimensions && (
                <div className={`mt-2 p-2 rounded-lg text-[11px] flex items-center justify-between ${
                  isVolumetricHigher ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-stone-50 text-stone-600'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Volumetric: <strong>{volumetricWeightKg} kg</strong> vs Actual: <strong>{actualWeightKg} kg</strong></span>
                  </span>
                  <span className="font-semibold text-xs">
                    Billable: <span className="text-[#102B2A] font-bold">{billableWeightKg} kg</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Speed & Destination */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Destination City in Nigeria
              </label>
              <select
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50/60 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#102B2A] focus:bg-white"
              >
                {DESTINATIONS.map((dest) => (
                  <option key={dest.city} value={dest.city}>
                    {dest.city} (+£{dest.localDeliveryGbp.toFixed(2)} doorstep waybill)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Freight Transit Speed
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShippingMethod('standard')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    shippingMethod === 'standard'
                      ? 'border-[#102B2A] bg-[#102B2A] text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50/60 hover:bg-white text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Standard Air Cargo</span>
                    <span className="text-[10px] font-semibold opacity-80">£9.50/kg</span>
                  </div>
                  <div className={`text-[11px] mt-1 ${shippingMethod === 'standard' ? 'text-stone-300' : 'text-stone-500'}`}>
                    5-7 business days via Friday flight
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod('express')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    shippingMethod === 'express'
                      ? 'border-[#102B2A] bg-[#102B2A] text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50/60 hover:bg-white text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Express Priority</span>
                    <span className="text-[10px] font-semibold opacity-80">£14.50/kg</span>
                  </div>
                  <div className={`text-[11px] mt-1 ${shippingMethod === 'express' ? 'text-stone-300' : 'text-stone-500'}`}>
                    2-4 business days direct flight
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Itemized Landed Quote Summary Card (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#102B2A] text-white rounded-2xl p-6 shadow-xl border border-[#263A35] sticky top-20">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#D9B77A] font-bold">
                  Guaranteed Landed Estimate
                </span>
                <h3 className="text-xl font-bold text-white">Estimated Cost Breakdown</h3>
              </div>
              <span className="text-[11px] text-stone-300 bg-white/10 px-2 py-0.5 rounded">
                DDP Cleared
              </span>
            </div>

            {/* Line items */}
            <div className="space-y-2.5 text-xs text-stone-300 pb-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span>UK Item Retail Price</span>
                <span className="font-mono text-white font-medium">
                  £{ukItemPriceGbp.toFixed(2)} <span className="text-stone-400">· ₦{(ukItemPriceGbp * fxRate).toLocaleString()}</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>Procurement & Concierge (12%)</span>
                  <span className="text-[10px] text-stone-400" title="Min £15 floor covers physical in-store purchasing and retail VAT receipt validation">
                    (min £15)
                  </span>
                </span>
                <span className="font-mono text-white font-medium">£{sourcingFeeGbp.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>Air Cargo ({billableWeightKg} kg billable)</span>
                </span>
                <span className="font-mono text-white font-medium">£{freightCostGbp.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>DDP Terminal Customs & Port Handling</span>
                <span className="font-mono text-white font-medium">£{customsClearingGbp.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Doorstep Dispatch ({destinationObj.label})</span>
                <span className="font-mono text-white font-medium">£{localDeliveryGbp.toFixed(2)}</span>
              </div>
            </div>

            {/* Total Section */}
            <div className="pt-4 pb-5">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold">Total Landed (Naira)</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#D9B77A] tracking-tight">
                  ₦{totalNgn.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-stone-400">
                <span>Equivalent in GBP</span>
                <span className="font-mono font-medium text-stone-200">£{totalGbp.toFixed(2)}</span>
              </div>
              <div className="text-[10.5px] text-stone-400 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#D9B77A]" />
                <span>Benchmark Rate: £1.00 = ₦{fxRate.toLocaleString()} (Locked for 48h upon request)</span>
              </div>
            </div>

            {/* Split Payment Preview */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 mb-5 text-xs">
              <div className="text-[11px] font-bold text-[#D9B77A] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Split-Payment Milestone Option</span>
                <span className="text-[10px] text-emerald-400 font-normal">70% / 30% Available</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-black/20 p-2 rounded-lg">
                  <span className="text-stone-400 block text-[10px]">1. Sourcing Deposit (70%)</span>
                  <span className="font-bold text-white font-mono">₦{deposit70Ngn.toLocaleString()}</span>
                  <span className="text-[9.5px] text-stone-400 block mt-0.5">Locks UK purchase</span>
                </div>
                <div className="bg-black/20 p-2 rounded-lg">
                  <span className="text-stone-400 block text-[10px]">2. Pre-Flight Balance (30%)</span>
                  <span className="font-bold text-white font-mono">₦{balance30Ngn.toLocaleString()}</span>
                  <span className="text-[9.5px] text-stone-400 block mt-0.5">After London QC photo</span>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <button
              type="button"
              onClick={handleProceed}
              className="w-full py-3 px-4 rounded-xl bg-[#D9B77A] hover:bg-[#cba867] text-[#102B2A] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <span>Lock This Quote & Buy For Me</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10.5px] text-stone-400 text-center mt-3">
              Zero foreign card limit issues · Pay in Naira via NUBAN bank transfer or debit card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
