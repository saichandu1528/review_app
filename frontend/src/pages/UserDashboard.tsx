import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import { Search, MapPin, Star, Edit3 } from 'lucide-react';

export default function UserDashboard() {
  const [stores, setStores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Rating modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await api.get(`/user/stores?search=${encodeURIComponent(query)}`);
      setStores(res.data);
    } catch (error) {
      console.error('Failed to fetch stores', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStores(searchQuery);
  };

  const openRatingModal = (store: any) => {
    setSelectedStore(store);
    setRatingValue(store.userRating || 5);
    setIsRatingModalOpen(true);
  };

  const submitRating = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/user/ratings', {
        storeId: selectedStore.id,
        value: ratingValue
      });
      setIsRatingModalOpen(false);
      fetchStores(searchQuery); // Refresh list
    } catch (error) {
      console.error('Failed to submit rating', error);
      alert('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Stores Directory">
      {/* Search Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-inner"
            />
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Stores Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Stores List</h2>
          <p className="text-gray-500 text-sm">Showing {stores.length} stores</p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading stores...
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20">
            <StoreIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No stores found</h3>
            <p className="text-gray-400">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Store Name</th>
                  <th className="py-4 px-6 font-semibold">Address</th>
                  <th className="py-4 px-6 font-semibold">Overall Rating</th>
                  <th className="py-4 px-6 font-semibold">Your Rating</th>
                  <th className="py-4 px-6 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stores.map(store => (
                  <tr key={store.id} className="hover:bg-emerald-500/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="text-white font-bold group-hover:text-emerald-400 transition-colors">{store.name}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-600" />
                        {store.address}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                        <span className="text-white font-medium">
                          {store.overallRating ? store.overallRating.toFixed(1) : 'New'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {store.userRating ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-sm font-bold">{store.userRating} / 5</span>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-sm italic">Not rated</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => openRatingModal(store)}
                        className="inline-flex items-center gap-2 bg-gray-800 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/20"
                      >
                        <Edit3 className="w-4 h-4" />
                        {store.userRating ? 'Change' : 'Rate Now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {isRatingModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-emerald-500/30 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">Rate Store</h3>
            <p className="text-gray-400 mb-6 line-clamp-1">{selectedStore.name}</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`w-10 h-10 ${star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`} />
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Just a helper to not break the imports
const StoreIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
);
