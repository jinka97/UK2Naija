import React, { useState } from 'react';
import {
  ExternalLink,
  Plus,
  Search,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  X,
  Trash2,
  Bookmark,
  Store,
  Lightbulb,
} from 'lucide-react';
import { RecommendedStore } from '../types';
import {
  getStoredRecommendedStores,
  addRecommendedStore,
  deleteRecommendedStore,
  resetRecommendedStores,
} from '../services/storage';

interface RecommendedSitesDirectoryProps {
  onSelectStoreForRequest: (store: RecommendedStore, specificItem?: string) => void;
}

export const RecommendedSitesDirectory: React.FC<RecommendedSitesDirectoryProps> = ({
  onSelectStoreForRequest,
}) => {
  const [stores, setStores] = useState<RecommendedStore[]>(getStoredRecommendedStores());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Store Form State
  const [newStoreName, setNewStoreName] = useState<string>('');
  const [newStoreUrl, setNewStoreUrl] = useState<string>('');
  const [newStoreCategory, setNewStoreCategory] = useState<string>('Fashion & Schoolwear');
  const [newStoreTagline, setNewStoreTagline] = useState<string>('');
  const [newStoreBadge, setNewStoreBadge] = useState<string>('UK Verified Store');
  const [newStoreItems, setNewStoreItems] = useState<string>('');
  const [newStoreTip, setNewStoreTip] = useState<string>('');

  const refreshStores = () => {
    setStores(getStoredRecommendedStores());
  };

  const categories = [
    'all',
    'Kids, Stationery & School',
    'Designer Clearance & Fashion',
    'Fashion & Schoolwear',
    'Beauty, Pharmacy & Baby',
    'Tech & Electronics',
    'Department Store & Home',
    'Footwear',
    'Home, Toys & Gadgets',
  ];

  const filteredStores = stores.filter((s) => {
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      s.name.toLowerCase().includes(term) ||
      s.tagline.toLowerCase().includes(term) ||
      s.popularItems.some((item) => item.toLowerCase().includes(term)) ||
      (s.nigerianBuyerTip && s.nigerianBuyerTip.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStoreUrl.trim()) {
      alert('Please enter a Store Name and Website URL.');
      return;
    }

    const popularItemsList = newStoreItems
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    addRecommendedStore({
      name: newStoreName.trim(),
      url: newStoreUrl.trim().startsWith('http') ? newStoreUrl.trim() : `https://${newStoreUrl.trim()}`,
      category: newStoreCategory,
      tagline: newStoreTagline.trim() || 'Quality UK retailer verified for authentic consumer goods.',
      badge: newStoreBadge.trim() || 'UK Verified Store',
      popularItems:
        popularItemsList.length > 0
          ? popularItemsList
          : ['Popular British clothing', 'Genuine authentic products', 'Verified retailer items'],
      logoText: newStoreName.slice(0, 4).toUpperCase(),
      nigerianBuyerTip: newStoreTip.trim() || 'Verified genuine UK retailer with standard consumer protection.',
      isFeatured: false,
    });

    refreshStores();
    setShowAddModal(false);
    // Reset form
    setNewStoreName('');
    setNewStoreUrl('');
    setNewStoreTagline('');
    setNewStoreItems('');
    setNewStoreTip('');
  };

  const handleDeleteStore = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from recommended sites?`)) {
      deleteRecommendedStore(id);
      refreshStores();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Directory Hero Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-950/40 to-transparent pointer-events-none hidden md:block"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-semibold mb-3 border border-slate-700">
            <Store className="w-3.5 h-3.5" />
            <span>Some UK Retailers</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Browse Popular UK Retailers & Tell Us What to Buy
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Explore trusted British stores like <strong>Marks & Spencer</strong>, <strong>Next</strong>,{' '}
            <strong>Boots</strong>, <strong>John Lewis</strong>, and <strong>Apple Store UK</strong>. Check their
            websites for items of interest, or click <em>"Request from this Store"</em> and our UK team will buy,
            inspect, and deliver to your doorstep in Nigeria.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add a UK Retailer</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset retailers list to default verified UK stores?')) {
                  resetRecommendedStores();
                  refreshStores();
                }
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Reset Retailers
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative grow max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stores or items (e.g. M&S, school uniforms, AirPods, Aptamil)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-slate-900 shadow-xs"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg border font-medium shrink-0 transition ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Stores' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden"
          >
            {/* Top Card Header */}
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs tracking-wider shrink-0 shadow-xs">
                    {store.logoText || store.name.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{store.name}</h3>
                    <span className="text-[11px] text-slate-500 font-medium block">{store.category}</span>
                  </div>
                </div>

                {store.badge && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    {store.badge}
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mt-2">{store.tagline}</p>

              {/* Nigerian Shopper Tip Callout */}
              {store.nigerianBuyerTip && (
                <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{store.nigerianBuyerTip}</span>
                </div>
              )}
            </div>

            {/* Popular Items to Sourcing */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 grow">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Popular Items from {store.name.split(' (')[0]}:</span>
                <span className="text-[10px] text-emerald-700 font-medium">Click to request</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {store.popularItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectStoreForRequest(store, item)}
                    className="text-[11px] bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition text-left flex items-center gap-1 group"
                  >
                    <span className="truncate max-w-[210px]">{item}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
              <a
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition shrink-0"
              >
                <span>Browse Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <button
                type="button"
                onClick={() => onSelectStoreForRequest(store)}
                className="grow inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Request from this Store</span>
              </button>

              {/* Delete button if custom store */}
              {!['store-ms', 'store-next', 'store-boots', 'store-johnlewis', 'store-apple'].includes(store.id) && (
                <button
                  type="button"
                  onClick={() => handleDeleteStore(store.id, store.name)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition"
                  title="Remove store"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No UK stores match your search</h3>
          <p className="text-slate-500 text-xs mt-1 mb-4">
            Try adjusting your search term or add a new recommended retailer.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Add Recommended UK Store</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="e.g. Selfridges, Asos UK, Argos"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Website URL *</label>
                  <input
                    type="text"
                    required
                    value={newStoreUrl}
                    onChange={(e) => setNewStoreUrl(e.target.value)}
                    placeholder="e.g. https://www.selfridges.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newStoreCategory}
                    onChange={(e) => setNewStoreCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="Fashion & Schoolwear">Fashion & Schoolwear</option>
                    <option value="Beauty, Pharmacy & Baby">Beauty, Pharmacy & Baby</option>
                    <option value="Tech & Electronics">Tech & Electronics</option>
                    <option value="Department Store & Home">Department Store & Home</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Home, Toys & Gadgets">Home, Toys & Gadgets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Store Badge (Short)</label>
                  <input
                    type="text"
                    value={newStoreBadge}
                    onChange={(e) => setNewStoreBadge(e.target.value)}
                    placeholder="e.g. Luxury Designer, Top Pick"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">What is this store best for? *</label>
                <textarea
                  rows={2}
                  required
                  value={newStoreTagline}
                  onChange={(e) => setNewStoreTagline(e.target.value)}
                  placeholder="e.g. High-end British fashion, luxury beauty hampers, and exclusive department store collections."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Popular Items to Highlight (Comma separated)
                </label>
                <input
                  type="text"
                  value={newStoreItems}
                  onChange={(e) => setNewStoreItems(e.target.value)}
                  placeholder="e.g. Designer handbags, Fragrance sets, Evening gowns"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tip for Nigerian Shoppers (Why buy from here?)
                </label>
                <input
                  type="text"
                  value={newStoreTip}
                  onChange={(e) => setNewStoreTip(e.target.value)}
                  placeholder="e.g. Guaranteed authentic UK stock with original luxury packaging and gift bags."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-xs"
                >
                  Add Store to Directory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
