/**
 * Dynamic Foreign Exchange (FX) Benchmark Service
 * Provides live GBP to NGN exchange rates, local caching, automatic background updates,
 * operator buffer adjustment, and manual override capabilities.
 */

export interface FxRateState {
  rate: number;             // Effective rate used for calculations (e.g. ₦2,180/£)
  marketRate: number;       // Raw live market rate fetched from exchange rate API
  bufferPercent: number;    // Commercial hedging buffer (default: 2.5% to protect against intra-day swings)
  lastUpdated: string;      // ISO string or formatted timestamp
  source: 'live_api' | 'cached' | 'fallback' | 'manual_override';
  status: 'idle' | 'fetching' | 'success' | 'error';
  errorMessage?: string;
}

const STORAGE_KEY = 'jamlu_fx_rate_v2';
const DEFAULT_FALLBACK_MARKET_RATE = 2125;
const DEFAULT_BUFFER_PERCENT = 2.5; // Commercial procurement buffer

// In-memory cache & listeners
let currentFxState: FxRateState = loadInitialFxState();
const listeners = new Set<(state: FxRateState) => void>();

function calculateEffectiveRate(marketRate: number, bufferPercent: number): number {
  const buffered = marketRate * (1 + bufferPercent / 100);
  return Math.round(buffered);
}

function loadInitialFxState(): FxRateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('uk2naija_fx_rate_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.rate === 'number' && parsed.rate > 0) {
        return {
          ...parsed,
          status: 'idle',
        };
      }
    }
  } catch (e) {
    console.warn('[FX Service] Failed to read cached FX rate, initializing default', e);
  }

  const effective = calculateEffectiveRate(DEFAULT_FALLBACK_MARKET_RATE, DEFAULT_BUFFER_PERCENT);
  return {
    rate: effective,
    marketRate: DEFAULT_FALLBACK_MARKET_RATE,
    bufferPercent: DEFAULT_BUFFER_PERCENT,
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
    status: 'idle',
  };
}

function persistFxState(state: FxRateState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[FX Service] Failed to cache FX rate in localStorage', e);
  }
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(currentFxState);
    } catch (err) {
      console.error('[FX Service] Error in listener callback', err);
    }
  });

  // Also dispatch window custom event for broad compatibility
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jamlu_fx_updated', { detail: currentFxState }));
    window.dispatchEvent(new CustomEvent('uk2naija_fx_updated', { detail: currentFxState }));
  }
}

/**
 * Returns current effective exchange rate (₦ per £)
 */
export function getBenchmarkFxRate(): number {
  return currentFxState.rate;
}

/**
 * Returns full FX state including market rate, buffer, and update timestamp
 */
export function getFxState(): FxRateState {
  return { ...currentFxState };
}

/**
 * Subscribes to FX state updates
 */
export function subscribeFxState(callback: (state: FxRateState) => void): () => void {
  listeners.add(callback);
  callback(currentFxState);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Fetches live market GBP -> NGN exchange rate from public feeds
 */
export async function refreshLiveFxRate(): Promise<FxRateState> {
  currentFxState = {
    ...currentFxState,
    status: 'fetching',
  };
  notifyListeners();

  try {
    let fetchedMarketRate: number | null = null;
    let apiProvider = 'open.er-api.com';

    // 1. Try Primary Feed: open.er-api.com
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/GBP', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && typeof data.rates.NGN === 'number' && data.rates.NGN > 500) {
          fetchedMarketRate = Math.round(data.rates.NGN);
        }
      }
    } catch (err) {
      console.warn('[FX Service] Primary API failed, trying backup endpoint', err);
    }

    // 2. Try Secondary Backup Feed: exchangerate-api.com
    if (!fetchedMarketRate) {
      try {
        const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/GBP', { cache: 'no-store' });
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.rates && typeof data2.rates.NGN === 'number' && data2.rates.NGN > 500) {
            fetchedMarketRate = Math.round(data2.rates.NGN);
            apiProvider = 'exchangerate-api.com';
          }
        }
      } catch (err2) {
        console.warn('[FX Service] Backup API failed as well', err2);
      }
    }

    if (fetchedMarketRate) {
      const effective = calculateEffectiveRate(fetchedMarketRate, currentFxState.bufferPercent);
      currentFxState = {
        rate: effective,
        marketRate: fetchedMarketRate,
        bufferPercent: currentFxState.bufferPercent,
        lastUpdated: new Date().toISOString(),
        source: 'live_api',
        status: 'success',
      };
      persistFxState(currentFxState);
      notifyListeners();
      return currentFxState;
    } else {
      throw new Error('Unable to parse valid NGN rate from public FX feeds');
    }
  } catch (error: any) {
    console.error('[FX Service] Failed to fetch live rate, retaining cached value', error);
    currentFxState = {
      ...currentFxState,
      status: 'error',
      errorMessage: error?.message || 'Network error fetching live rate',
    };
    notifyListeners();
    return currentFxState;
  }
}

/**
 * Manually set an override rate or adjust the commercial buffer
 */
export function setCustomFxRate(customRate: number) {
  if (customRate <= 0) return;
  currentFxState = {
    ...currentFxState,
    rate: Math.round(customRate),
    marketRate: Math.round(customRate),
    source: 'manual_override',
    lastUpdated: new Date().toISOString(),
    status: 'success',
  };
  persistFxState(currentFxState);
  notifyListeners();
}

export function setFxBufferPercent(percent: number) {
  const effective = calculateEffectiveRate(currentFxState.marketRate, percent);
  currentFxState = {
    ...currentFxState,
    bufferPercent: percent,
    rate: effective,
    lastUpdated: new Date().toISOString(),
  };
  persistFxState(currentFxState);
  notifyListeners();
}

// Auto-trigger a quiet background refresh on client initialization if data is older than 60 minutes
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const lastTime = new Date(currentFxState.lastUpdated).getTime();
    const isStale = isNaN(lastTime) || Date.now() - lastTime > 60 * 60 * 1000;
    if (isStale) {
      refreshLiveFxRate().catch(() => {});
    }
  }, 1200);
}
