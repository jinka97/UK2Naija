export type BudgetOption = 'flexible' | 'under50' | '50-150' | '150-500' | 'over500' | 'custom';

export type RequestStatus =
  | 'submitted'
  | 'sourcing'
  | 'quoted'
  | 'approved'
  | 'purchased'
  | 'warehouse'
  | 'quality_checked'
  | 'dispatched'
  | 'in_nigeria'
  | 'out_for_delivery'
  | 'delivered';

export interface ProductItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  specs?: string;
  dontKnowName?: boolean;
  whatItDoesOrLooksLike?: string;
  referenceUrl?: string;
  photoUrl?: string;
}

export interface Quotation {
  ukRetailPriceGbp: number;
  sourcingFeeGbp: number; // 12% or £15 min
  airFreightGbp: number; // £9.50/kg
  customsHandlingGbp: number; // DDP pre-cleared
  totalGbp: number;
  fxRate: number; // e.g. 2150 NGN per GBP
  totalNgn: number;
  retailerFound: string;
  retailerUrl?: string;
  sourcingNotes?: string;
  estimatedDeliveryDays: string;
  quotedAt: string;
  expiresAt: string;
  billableWeightKg?: number;
  isVolumetricWeight?: boolean;
  dimensionsCm?: { length: number; width: number; height: number };
  splitMilestone?: {
    deposit70Ngn: number;
    balance30Ngn: number;
  };
}

export interface PurchaseProof {
  purchasedAt: string;
  storeName: string;
  receiptNumber?: string;
  receiptNote?: string;
  receiptImageUrl?: string;
  qcPhotos: {
    title: string;
    description: string;
    imageUrl: string;
  }[];
}

export interface DispatchInfo {
  dispatchedAt: string;
  carrier: string;
  trackingNumber: string;
  flightOrCourierRef: string;
  deliveryEstimatedDate: string;
}

export interface CustomerRequest {
  id: string; // e.g. JAMLU-4821
  createdAt: string;
  customerName: string;
  whatsappPhone: string;
  deliveryCity: string;
  deliveryAddress?: string;
  category: string;
  items: ProductItem[];
  budget: BudgetOption;
  customBudgetNotes?: string;
  status: RequestStatus;
  corridor?: 'uk-to-ng' | 'ng-to-uk'; // Bidirectional corridor
  paymentMilestone?: {
    type: 'full' | 'split_70_30';
    depositPaidNgn?: number;
    balanceDueNgn?: number;
    depositPaidAt?: string;
    balancePaidAt?: string;
  };
  quotation?: Quotation;
  purchaseProof?: PurchaseProof;
  dispatchInfo?: DispatchInfo;
  adminNotes?: string;
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  sheetName: string;
  lastSyncedAt?: string;
  autoSync: boolean;
}

export interface RecommendedStore {
  id: string;
  name: string;
  url: string;
  category: string;
  tagline: string;
  badge?: string;
  popularItems: string[];
  logoText: string;
  accentColor?: string;
  nigerianBuyerTip?: string;
  isFeatured?: boolean;
}

