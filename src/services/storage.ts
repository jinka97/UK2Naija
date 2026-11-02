import { CustomerRequest, GoogleSheetsConfig, RecommendedStore } from '../types';
import {
  DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL,
  DEFAULT_SHEET_TAB_NAME,
} from '../config/sheetsConfig';

export const BENCHMARK_FX_RATE = 2150; // ₦2,150 per £1 GBP
export const SOURCING_FEE_PCT = 0.12; // 12%
export const SOURCING_FEE_MIN = 15; // £15 min
export const AIR_FREIGHT_PER_KG = 9.5; // £9.50/kg
export const CUSTOMS_CLEARING_FLAT = 4.0; // £4.00 DDP terminal handling

export const INITIAL_SEED_REQUESTS: CustomerRequest[] = [
  {
    id: 'UK2N-4821',
    createdAt: '2026-11-01T04:15:00.000Z',
    customerName: 'Amina Bello',
    whatsappPhone: '+234 803 555 0192',
    deliveryCity: 'Lagos (Lekki Phase 1)',
    deliveryAddress: 'Block B4, Admiralty Way, Lekki Phase 1, Lagos',
    category: 'Baby & Infant Care',
    items: [
      {
        id: 'item-1',
        name: 'Aptamil Profutura 1 First Infant Milk (800g)',
        brand: 'Aptamil / Nutricia UK',
        quantity: 4,
        specs: 'Stage 1 (0-6 months). Must be original UK batch with tamper seal intact.',
        referenceUrl: 'https://www.boots.com/aptamil-profutura-first-infant-milk-800g',
        photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      },
    ],
    budget: '50-150',
    status: 'quoted',
    quotation: {
      ukRetailPriceGbp: 64.0,
      sourcingFeeGbp: 15.0, // Minimum floor fee £15 applied
      airFreightGbp: 32.3, // 3.4kg @ £9.50/kg
      customsHandlingGbp: 4.0, // Lagos DDP port clearance
      totalGbp: 115.3,
      fxRate: BENCHMARK_FX_RATE,
      totalNgn: 247895,
      retailerFound: 'Boots UK (Victoria Street London store)',
      retailerUrl: 'https://www.boots.com',
      sourcingNotes: 'Authentic Boots UK stock reserved. Fresh production batch expiry: November 2027.',
      estimatedDeliveryDays: '5-7 business days via Friday flight',
      quotedAt: '2026-11-01T04:45:00.000Z',
      expiresAt: '2026-11-03T04:45:00.000Z',
    },
    adminNotes: 'Customer requested photo verification of batch code prior to dispatch.',
  },
  {
    id: 'UK2N-4819',
    createdAt: '2026-10-31T11:20:00.000Z',
    customerName: 'Femi Alabi',
    whatsappPhone: '+234 812 444 8921',
    deliveryCity: 'Lagos (Yaba / Tech Hub)',
    deliveryAddress: 'Herbert Macaulay Way, Yaba, Lagos',
    category: 'Electronics & Audio',
    items: [
      {
        id: 'item-2',
        name: 'Apple MacBook Air 13" M3 Chip (16GB RAM / 512GB SSD)',
        brand: 'Apple',
        quantity: 1,
        specs: 'Midnight colorway, UK Type G 3-pin power plug, British English keyboard layout.',
        referenceUrl: 'https://www.apple.com/uk/shop/buy-mac/macbook-air/13-inch-m3',
        photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
      },
    ],
    budget: 'over500',
    status: 'purchased',
    quotation: {
      ukRetailPriceGbp: 1299.0,
      sourcingFeeGbp: 129.9, // 10% high-ticket negotiated rate
      airFreightGbp: 23.75, // 2.5kg billable
      customsHandlingGbp: 8.0, // Tech customs processing
      totalGbp: 1460.65,
      fxRate: BENCHMARK_FX_RATE,
      totalNgn: 3140397,
      retailerFound: 'Apple Store Regent Street (London)',
      retailerUrl: 'https://www.apple.com/uk',
      sourcingNotes: 'Purchased directly from official Apple Store with paper retail receipt included.',
      estimatedDeliveryDays: '4-6 days (Express Courier)',
      quotedAt: '2026-10-31T12:00:00.000Z',
      expiresAt: '2026-11-02T12:00:00.000Z',
    },
    purchaseProof: {
      purchasedAt: '2026-11-01T01:30:00.000Z',
      storeName: 'Apple Regent Street London W1B 2EL',
      receiptNumber: 'APL-UK-2026-90412',
      receiptNote: 'Official Apple UK VAT invoice attached with serial number matched on box.',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e49fe744040?w=500&auto=format&fit=crop&q=60',
      qcPhotos: [
        {
          title: 'Tamper Pull-Tab Sealed',
          description: 'Factory Apple pull tabs 100% untouched and clean.',
          imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=60',
        },
        {
          title: 'UK 3-Pin Type G Adapter',
          description: 'Verified British 3-pin fused plug (Type G) 35W Dual USB-C port.',
          imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60',
        },
      ],
    },
    adminNotes: 'High-value customer. Prepaid in full via NIP bank transfer.',
  },
  {
    id: 'UK2N-4815',
    createdAt: '2026-10-30T16:00:00.000Z',
    customerName: 'Grace Eze',
    whatsappPhone: '+234 802 888 1234',
    deliveryCity: 'Lagos (Ikeja GRA)',
    deliveryAddress: 'Isaac John Street, Ikeja GRA, Lagos',
    category: 'Beauty & Skincare',
    items: [
      {
        id: 'item-3',
        name: 'Natural baby soothing cream for sensitive dry eczema skin',
        brand: 'Saw it recommended on UK mum blog (Childs Farm or Aveeno Baby)',
        quantity: 2,
        dontKnowName: true,
        whatItDoesOrLooksLike:
          'A gentle pump lotion with grapefruit or unfragranced organic oats. Very popular in UK supermarkets for infant eczema.',
        photoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60',
      },
    ],
    budget: 'under50',
    status: 'submitted',
    adminNotes: 'Assigned to UK team: check Childs Farm 500ml moisturiser at Boots/Sainsbury.',
  },
  {
    id: 'UKS-4810',
    createdAt: '2026-10-29T09:15:00.000Z',
    customerName: 'Dr. Adeyemi Coker',
    whatsappPhone: '+234 809 333 7711',
    deliveryCity: 'Abuja (Maitama)',
    deliveryAddress: 'Private Diagnostic Centre, Aguiyi Ironsi St, Maitama, Abuja',
    category: 'Health & Pharmacy',
    items: [
      {
        id: 'item-4',
        name: '3M Littmann Cardiology IV Diagnostic Stethoscope',
        brand: '3M Littmann UK',
        quantity: 1,
        specs: 'Black tube, champagne finish chestpiece. Must be CE marked genuine UK medical supply.',
        referenceUrl: 'https://www.medisave.co.uk/littmann-cardiology-iv',
      },
    ],
    budget: '150-500',
    status: 'sourcing',
    adminNotes: 'Checking Medisave UK and Williams Medical trade accounts for bulk clinician pricing.',
  },
  {
    id: 'UK2N-4802',
    createdAt: '2026-10-28T14:40:00.000Z',
    customerName: 'Tunde Bakare',
    whatsappPhone: '+234 818 999 5566',
    deliveryCity: 'Lagos (Victoria Island)',
    deliveryAddress: 'Ahmadu Bello Way, Victoria Island, Lagos',
    category: 'Fashion & Accessories',
    items: [
      {
        id: 'item-5',
        name: 'Clarks Originals Wallabee Boot (Beeswax Leather)',
        brand: 'Clarks UK',
        quantity: 1,
        specs: 'Size UK 9.5 (EU 44). Classic crepe sole.',
        referenceUrl: 'https://www.clarks.co.uk/mens/wallabee',
        photoUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60',
      },
    ],
    budget: '50-150',
    status: 'dispatched',
    quotation: {
      ukRetailPriceGbp: 140.0,
      sourcingFeeGbp: 16.8, // 12%
      airFreightGbp: 17.1, // 1.8kg
      customsHandlingGbp: 4.0,
      totalGbp: 177.9,
      fxRate: BENCHMARK_FX_RATE,
      totalNgn: 382485,
      retailerFound: 'Clarks Regent Street Store',
      estimatedDeliveryDays: 'Delivering tomorrow',
      quotedAt: '2026-10-28T15:30:00.000Z',
      expiresAt: '2026-10-30T15:30:00.000Z',
    },
    purchaseProof: {
      purchasedAt: '2026-10-29T10:00:00.000Z',
      storeName: 'Clarks UK Store',
      receiptNumber: 'CLK-LON-8831',
      qcPhotos: [
        {
          title: 'Crepe Sole & Beeswax Finish',
          description: 'Flawless leather conditioning and original fob tags.',
          imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60',
        },
      ],
    },
    dispatchInfo: {
      dispatchedAt: '2026-10-31T18:00:00.000Z',
      carrier: 'British Airways World Cargo (LHR ➔ LOS) + GIG Logistics',
      trackingNumber: 'BAW-LOS-804192',
      flightOrCourierRef: 'Flight BA075 / Waybill 125-994102',
      deliveryEstimatedDate: 'Arrived Lagos Hub. Out for Doorstep Delivery via Rider Tunde.',
    },
    adminNotes: 'Customer approved same-day doorstep motorbike dispatch in Lagos.',
  },
];

const STORAGE_KEY = 'uk_source_requests_v1';
const SHEETS_CONFIG_KEY = 'uk_source_sheets_config_v1';

export function getStoredRequests(): CustomerRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_REQUESTS));
      return INITIAL_SEED_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SEED_REQUESTS;
  }
}

export function saveStoredRequests(requests: CustomerRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save requests to localStorage', err);
  }
}

export function createNewRequest(newReq: Omit<CustomerRequest, 'id' | 'createdAt' | 'status'>): CustomerRequest {
  const current = getStoredRequests();
  const nextNumber = 4825 + Math.floor(Math.random() * 80);
  const id = `UK2N-${nextNumber}`;
  const request: CustomerRequest = {
    ...newReq,
    id,
    createdAt: new Date().toISOString(),
    status: 'submitted',
  };

  const updated = [request, ...current];
  saveStoredRequests(updated);

  // Real-time DOM event notification so Admin and App instantly reflect new request
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uk2n_storage_updated', { detail: request }));
  }

  // Attempt Google Sheets webhook sync if configured
  syncToGoogleSheets(request).catch((err) => {
    console.warn('Google Sheets background sync notice:', err);
  });

  return request;
}

export function updateRequestStatus(
  id: string,
  status: CustomerRequest['status'],
  additionalData?: Partial<CustomerRequest>
): CustomerRequest | null {
  const current = getStoredRequests();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedReq: CustomerRequest = {
    ...current[index],
    ...additionalData,
    status,
  };

  current[index] = updatedReq;
  saveStoredRequests(current);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uk2n_storage_updated', { detail: updatedReq }));
  }

  syncToGoogleSheets(updatedReq).catch(() => {
    // Non-blocking
  });

  return updatedReq;
}

export function resetToSeedData(): CustomerRequest[] {
  saveStoredRequests(INITIAL_SEED_REQUESTS);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uk2n_storage_updated'));
  }
  return INITIAL_SEED_REQUESTS;
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  try {
    const raw = localStorage.getItem(SHEETS_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate legacy sheet names to required tab: UK_Source_Orders_11-2026
      const sheetName =
        parsed.sheetName && parsed.sheetName !== 'UK2Naija_Orders'
          ? parsed.sheetName
          : DEFAULT_SHEET_TAB_NAME;

      return {
        webhookUrl: parsed.webhookUrl || DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL,
        sheetName,
        autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
        lastSyncedAt: parsed.lastSyncedAt,
      };
    }
  } catch {
    // ignore
  }
  return {
    webhookUrl: DEFAULT_GOOGLE_SHEETS_WEBHOOK_URL,
    sheetName: DEFAULT_SHEET_TAB_NAME,
    autoSync: true,
  };
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  try {
    localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save sheets config', err);
  }
}

/**
 * Syncs a request to Google Sheets using a Google Apps Script Webhook
 * Explicitly targets the UK_Source_Orders_11-2026 sheet tab
 */
export async function syncToGoogleSheets(request: CustomerRequest): Promise<boolean> {
  const config = getGoogleSheetsConfig();
  if (!config.webhookUrl || !config.webhookUrl.startsWith('http')) {
    return false;
  }

  try {
    const targetSheet = config.sheetName || DEFAULT_SHEET_TAB_NAME || 'UK_Source_Orders_11-2026';
    const payload = {
      action: 'append_or_update',
      sheet: targetSheet,
      sheetName: targetSheet,
      data: {
        timestamp: new Date().toISOString(),
        requestId: request.id,
        customerName: request.customerName,
        whatsapp: request.whatsappPhone,
        deliveryCity: request.deliveryCity,
        deliveryAddress: request.deliveryAddress || 'Standard Hub Collection',
        category: request.category,
        productItems: request.items
          .map((i) => `${i.name} (Qty: ${i.quantity}${i.brand ? `, Brand: ${i.brand}` : ''})`)
          .join('; '),
        budget: request.budget,
        status: request.status.toUpperCase(),
        quoteGbp: request.quotation ? `£${request.quotation.totalGbp.toFixed(2)}` : 'Pending',
        quoteNgn: request.quotation ? `₦${request.quotation.totalNgn.toLocaleString()}` : 'Pending',
        retailer: request.quotation?.retailerFound || 'Not yet assigned',
        notes: request.adminNotes || request.items[0]?.specs || '',
        sheetName: targetSheet,
      },
    };

    // Google Apps Script requires mode: 'no-cors' with text/plain payload to avoid CORS preflight rejection in browsers
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors', // standard for Apps Script web endpoints
    });

    config.lastSyncedAt = new Date().toISOString();
    saveGoogleSheetsConfig(config);
    return true;
  } catch (err) {
    console.warn('Google Sheets sync warning:', err);
    return false;
  }
}

/**
 * Batch syncs all customer requests to Google Sheets
 */
export async function syncAllRequestsToGoogleSheets(
  requests: CustomerRequest[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const config = getGoogleSheetsConfig();
  if (!config.webhookUrl || !config.webhookUrl.startsWith('http')) {
    return { success: false, count: 0, error: 'No Google Apps Script Web App URL configured.' };
  }

  let synced = 0;
  for (const req of requests) {
    const ok = await syncToGoogleSheets(req);
    if (ok) synced++;
  }

  return { success: true, count: synced };
}

/**
 * Exports current database records to CSV
 */
export function exportRequestsToCsv(requests: CustomerRequest[]): void {
  const headers = [
    'Timestamp',
    'Request_ID',
    'Customer_Name',
    'WhatsApp_Number',
    'Delivery_Location',
    'Delivery_Address',
    'Category',
    'Product_Items',
    'Budget',
    'Status',
    'Quote_GBP',
    'Quote_NGN',
    'UK_Retailer',
    'Admin_Notes',
  ];

  const rows = requests.map((r) => [
    `"${r.createdAt}"`,
    `"${r.id}"`,
    `"${r.customerName.replace(/"/g, '""')}"`,
    `"${r.whatsappPhone}"`,
    `"${r.deliveryCity.replace(/"/g, '""')}"`,
    `"${(r.deliveryAddress || '').replace(/"/g, '""')}"`,
    `"${r.category}"`,
    `"${r.items.map((i) => `${i.name} x${i.quantity}`).join('; ').replace(/"/g, '""')}"`,
    `"${r.budget}"`,
    `"${r.status}"`,
    `"${r.quotation ? `£${r.quotation.totalGbp.toFixed(2)}` : ''}"`,
    `"${r.quotation ? `₦${r.quotation.totalNgn}` : ''}"`,
    `"${(r.quotation?.retailerFound || '').replace(/"/g, '""')}"`,
    `"${(r.adminNotes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `UK2Naija_Requests_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formats a clean WhatsApp/text summary so the user can easily copy their request
 */
export function generateSampleCopyText(req: Partial<CustomerRequest>): string {
  const itemsText = (req.items || [])
    .map(
      (item, idx) =>
        `Item ${idx + 1}: ${item.name || 'UK Product'}
- Quantity: ${item.quantity || 1}
${item.brand ? `- Preferred Brand: ${item.brand}\n` : ''}${
          item.dontKnowName ? `- Note: Customer uploaded photo / looking for equivalent\n` : ''
        }${item.specs ? `- Specs/Requirements: ${item.specs}\n` : ''}${
          item.referenceUrl ? `- Link: ${item.referenceUrl}\n` : ''
        }`
    )
    .join('\n');

  return `📦 *UK2NAIJA SOURCING REQUEST*
----------------------------------------
*Customer:* ${req.customerName || 'Customer'}
*WhatsApp:* ${req.whatsappPhone || 'Pending'}
*Delivery Location:* ${req.deliveryCity || 'Nigeria'}
*Category:* ${req.category || 'General'}
*Budget Range:* ${req.budget || 'Flexible – recommend best option'}

*Requested Items:*
${itemsText}
----------------------------------------
*Generated via UK2Naija Direct Sourcing Assistant*
_Direct bidirectional sourcing between verified UK retailers and Nigeria._`;
}

export const INITIAL_RECOMMENDED_STORES: RecommendedStore[] = [
  {
    id: 'store-smiggle',
    name: 'Smiggle UK',
    url: 'https://www.smiggle.co.uk',
    category: 'Kids, Stationery & School',
    tagline: 'World-famous Australian-British kids stationery: scented pencil cases, double-decker lunchboxes, pop-out water bottles, and backpacks.',
    badge: 'Top Pick: Scented School Gear & Bags',
    popularItems: [
      'Hardtop embossed scented character pencil cases',
      'Dual-compartment double-decker insulated lunchboxes',
      'Silicone spout pop-out drink bottles',
      'Junior & senior school backpacks with padded laptop sleeves',
    ],
    logoText: 'SMIGGLE',
    accentColor: 'from-fuchsia-600 to-pink-600',
    nigerianBuyerTip:
      'Massive status symbol in Lagos and Abuja private schools. Buying direct from UK stores gets you exclusive seasonal releases at true retail prices.',
    isFeatured: true,
  },
  {
    id: 'store-next',
    name: 'Next UK',
    url: 'https://www.next.co.uk',
    category: 'Fashion & Schoolwear',
    tagline: 'Britain’s favorite high-street department store: modern family apparel, stylish children’s occasionwear, and chic homeware.',
    badge: 'Top Pick: Kids & Family Fashion',
    popularItems: [
      'Multi-pack baby sleepsuits & rompers (100% pure cotton)',
      'Tailored boys wedding suits & girls occasion party dresses',
      'Signature real leather chelsea & ankle boots',
      'Stain-resistant school trousers, polo shirts & pleated pinafores',
    ],
    logoText: 'NEXT',
    accentColor: 'from-slate-900 to-neutral-800',
    nigerianBuyerTip:
      'Next kids’ collections are vibrant and durable; their multi-packs give incredible value for Lagos and Abuja families.',
    isFeatured: true,
  },
  {
    id: 'store-tkmaxx',
    name: 'TK Maxx UK',
    url: 'https://www.tkmaxx.com',
    category: 'Designer Clearance & Fashion',
    tagline: 'Big brands and designer labels at up to 60% less than RRP: authentic perfumes, designer handbags, luggage, and luxury cookware.',
    badge: 'Designer Labels at Clearance Prices',
    popularItems: [
      'Designer perfumes & aftershaves (Chanel, Dior, Tom Ford, Creed)',
      'Luxury designer leather handbags & crossbody totes',
      'Le Creuset & MasterClass heavy cast iron Dutch ovens',
      'Branded trainers, activewear & luggage sets (Samsonite, Nike)',
    ],
    logoText: 'TK MAXX',
    accentColor: 'from-red-700 to-rose-900',
    nigerianBuyerTip:
      'The ultimate UK bargain treasure hunt. Sourced directly from London stores with paper receipts proving genuine designer brand authenticity.',
    isFeatured: true,
  },
  {
    id: 'store-ms',
    name: 'Marks & Spencer (M&S)',
    url: 'https://www.marksandspencer.com',
    category: 'Fashion & Schoolwear',
    tagline: 'British heritage clothing, stain-defence school uniforms, 100% pure cotton underwear, and luxury knitwear.',
    badge: 'Top Pick: Schoolwear & Underwear',
    popularItems: [
      'Stain-defence non-iron school shirts & pleated skirts',
      'Pure cotton multi-pack vests & sleepsuits',
      'Autograph luxury shirts & cashmere sweaters',
      'Shortbread tins & British tea gift sets',
    ],
    logoText: 'M&S',
    accentColor: 'from-emerald-900 to-slate-900',
    nigerianBuyerTip:
      'Legendary among Nigerian parents: M&S cotton school uniforms and vests endure hot washes without losing shape or fading.',
    isFeatured: true,
  },
  {
    id: 'store-boots',
    name: 'Boots UK',
    url: 'https://www.boots.com',
    category: 'Beauty, Pharmacy & Baby',
    tagline: 'The UK’s premier pharmacy: authentic infant formula, active dermaceuticals, daily vitamins, and No7 beauty.',
    badge: 'Essential: Infant Milk & Skincare',
    popularItems: [
      'Aptamil Profutura 1 & Kendamil Organic Infant Milk',
      'Boots Soltan 5-star UVA sun protection',
      'CeraVe & La Roche-Posay UK formulations',
      'Vitabiotics Pregnacare, Wellman & Wellwoman',
    ],
    logoText: 'BOOTS',
    accentColor: 'from-blue-900 to-indigo-950',
    nigerianBuyerTip:
      '100% counterfeit-free guarantee. Foil seals and expiration dates are verified and photographed before air cargo dispatch.',
    isFeatured: true,
  },
  {
    id: 'store-johnlewis',
    name: 'John Lewis & Partners',
    url: 'https://www.johnlewis.com',
    category: 'Department Store & Home',
    tagline: 'Britain’s trusted luxury department store: Dyson electronics, designer prams, high-end nursery, and Barbour apparel.',
    badge: 'Top Tier: Electronics & Nursery',
    popularItems: [
      'Dyson Supersonic & Airwrap hair stylers',
      'Silver Cross & Bugaboo strollers & car seats',
      'Barbour waxed jackets & Ralph Lauren polo shirts',
      'Le Creuset cast iron casseroles & kitchenware',
    ],
    logoText: 'JOHN LEWIS',
    accentColor: 'from-emerald-950 to-teal-900',
    nigerianBuyerTip:
      'Includes 2-year UK retailer guarantee on electrical items with authentic store purchase receipts.',
    isFeatured: true,
  },
  {
    id: 'store-apple',
    name: 'Apple Store UK',
    url: 'https://www.apple.com/uk',
    category: 'Tech & Electronics',
    tagline: 'Direct from Apple UK: MacBooks, iPads, and AirPods with official British English keyboards and UK 3-pin fused adapters.',
    badge: 'Official UK Tech Spec',
    popularItems: [
      'MacBook Air & MacBook Pro (M3/M4 chips)',
      'AirPods Pro 2 with MagSafe USB-C',
      'iPad Air 11" & 13" with Apple Pencil Pro',
      'Apple Watch Series 10 (Cellular & GPS)',
    ],
    logoText: 'APPLE',
    accentColor: 'from-zinc-900 to-slate-900',
    nigerianBuyerTip:
      'Avoid refurbished traps in local markets. We buy direct from Apple UK with official paper receipts for global AppleCare.',
    isFeatured: true,
  },
  {
    id: 'store-currys',
    name: 'Currys PC World',
    url: 'https://www.currys.co.uk',
    category: 'Tech & Electronics',
    tagline: 'The UK’s largest specialist electrical retailer: laptops, PlayStation 5, audio monitors, and kitchen tech.',
    badge: 'Genuine 230V UK 3-Pin',
    popularItems: [
      'Lenovo Legion & ASUS ROG gaming laptops',
      'Sony WH-1000XM5 noise cancelling headphones',
      'Ninja Double Stack XL Air Fryers',
      'De’Longhi bean-to-cup espresso machines',
    ],
    logoText: 'CURRYS',
    accentColor: 'from-purple-950 to-slate-900',
    nigerianBuyerTip:
      'Every electronic item runs on UK 230V 50Hz electrical standard with British Type G 3-pin safety plugs.',
    isFeatured: false,
  },
  {
    id: 'store-clarks',
    name: 'Clarks UK',
    url: 'https://www.clarks.co.uk',
    category: 'Footwear',
    tagline: 'Iconic British shoemakers since 1825: Wallabees, Desert Boots, formal city brogues, and indestructible school shoes.',
    badge: 'Heritage British Footwear',
    popularItems: [
      'Wallabee Boot in Beeswax Leather & Suede',
      'Desert Boot in Cola & Sand Suede',
      'Rip-tape leather school shoes with scuff protection',
      'Cushioned orthopedic formal work shoes',
    ],
    logoText: 'CLARKS',
    accentColor: 'from-amber-950 to-stone-900',
    nigerianBuyerTip:
      'Clarks crepe soles and genuine leather are an enduring status symbol in Nigeria and last for years.',
    isFeatured: true,
  },
  {
    id: 'store-argos',
    name: 'Argos UK',
    url: 'https://www.argos.co.uk',
    category: 'Home, Toys & Gadgets',
    tagline: 'Instant retail catalog: educational toys (LEGO, VTech), DeWalt power tools, luggage, and personal grooming.',
    badge: 'Fast London Collection',
    popularItems: [
      'LEGO Technic & architectural sets',
      'DeWalt 18V XR brushless power tool kits',
      'Babyliss & Remington hair clippers & trimmers',
      'Samsonite & Antler lightweight suitcases',
    ],
    logoText: 'ARGOS',
    accentColor: 'from-red-950 to-slate-900',
    nigerianBuyerTip:
      'Our London team collects directly from local Argos hubs within 2 hours of payment confirmation.',
    isFeatured: false,
  },
  {
    id: 'store-superdrug',
    name: 'Superdrug UK',
    url: 'https://www.superdrug.com',
    category: 'Beauty, Pharmacy & Baby',
    tagline: 'Affordable British high-street beauty, viral skincare dupes, cruelty-free cosmetics, and afro-textured hair care.',
    badge: 'Affordable British Beauty',
    popularItems: [
      'Me+ Niacinamide & Salicylic Acid serums',
      'Real Techniques British makeup brushes',
      'Shea Moisture & Cantu UK formulations',
      'E45 Dermatological dry skin cream',
    ],
    logoText: 'SUPERDRUG',
    accentColor: 'from-pink-950 to-slate-900',
    nigerianBuyerTip:
      'Great for ordering UK exclusive budget skincare and cruelty-free hair treatments formulated for melanin-rich skin.',
    isFeatured: false,
  },
];

const RECOMMENDED_STORES_KEY = 'uk_source_recommended_stores_v2';

export function getStoredRecommendedStores(): RecommendedStore[] {
  try {
    const raw = localStorage.getItem(RECOMMENDED_STORES_KEY);
    if (!raw) {
      localStorage.setItem(RECOMMENDED_STORES_KEY, JSON.stringify(INITIAL_RECOMMENDED_STORES));
      return INITIAL_RECOMMENDED_STORES;
    }
    const parsed: RecommendedStore[] = JSON.parse(raw);
    // Ensure all initial stores like Smiggle & TK Maxx exist
    const hasSmiggle = parsed.some((s) => s.id === 'store-smiggle' || s.name.toLowerCase().includes('smiggle'));
    const hasTkMaxx = parsed.some((s) => s.id === 'store-tkmaxx' || s.name.toLowerCase().includes('tk maxx'));
    if (!hasSmiggle || !hasTkMaxx) {
      localStorage.setItem(RECOMMENDED_STORES_KEY, JSON.stringify(INITIAL_RECOMMENDED_STORES));
      return INITIAL_RECOMMENDED_STORES;
    }
    return parsed;
  } catch {
    return INITIAL_RECOMMENDED_STORES;
  }
}

export function saveStoredRecommendedStores(stores: RecommendedStore[]): void {
  try {
    localStorage.setItem(RECOMMENDED_STORES_KEY, JSON.stringify(stores));
  } catch (err) {
    console.error('Failed to save recommended stores', err);
  }
}

export function addRecommendedStore(store: Omit<RecommendedStore, 'id'>): RecommendedStore {
  const current = getStoredRecommendedStores();
  const id = 'store-' + Date.now();
  const newStore: RecommendedStore = { ...store, id };
  const updated = [newStore, ...current];
  saveStoredRecommendedStores(updated);
  return newStore;
}

export function updateRecommendedStore(id: string, updates: Partial<RecommendedStore>): RecommendedStore | null {
  const current = getStoredRecommendedStores();
  const idx = current.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  current[idx] = { ...current[idx], ...updates };
  saveStoredRecommendedStores(current);
  return current[idx];
}

export function deleteRecommendedStore(id: string): void {
  const current = getStoredRecommendedStores();
  const updated = current.filter((s) => s.id !== id);
  saveStoredRecommendedStores(updated);
}

export function resetRecommendedStores(): RecommendedStore[] {
  saveStoredRecommendedStores(INITIAL_RECOMMENDED_STORES);
  return INITIAL_RECOMMENDED_STORES;
}

