import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import { Star, Users, MapPin } from 'lucide-react';

export default function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/store-owner/dashboard');
      setDashboardData(res.data);
    } catch (err: any) {
      console.error('Failed to fetch owner dashboard', err);
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Store Dashboard">
        <div className="text-center py-12 text-gray-400">Loading...</div>
      </Layout>
    );
  }

  if (error || !dashboardData) {
    return (
      <Layout title="Store Dashboard">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
          {error || 'No store assigned to your account. Please contact an Administrator.'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Dashboard: ${dashboardData.storeName}`}>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            {dashboardData.storeName}
            <div className="flex items-center gap-1 bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full border border-amber-400/20 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : '0.0'}</span>
            </div>
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {dashboardData.storeAddress}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/20 relative z-10">
            <Star className="w-8 h-8 text-amber-400 fill-current" />
          </div>
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium">Average Rating</div>
            <div className="text-4xl font-bold text-white mt-1">
              {dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="flex gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.round(dashboardData.averageRating || 0) ? 'text-amber-400 fill-current' : 'text-gray-700'}`} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
          <div className="bg-blue-500/10 p-4 rounded-full border border-blue-500/20 relative z-10">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium">Total Reviews</div>
            <div className="text-4xl font-bold text-white mt-1">
              {dashboardData.usersWhoRated.length}
            </div>
            <div className="text-blue-400/60 text-xs mt-2 font-medium uppercase tracking-wider">Verified Users</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
          <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 relative z-10">
            <MapPin className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="relative z-10 overflow-hidden">
            <div className="text-gray-400 text-sm font-medium">Store Location</div>
            <div className="text-sm text-white mt-2 font-medium line-clamp-2">
              {dashboardData.storeAddress || 'No address provided'}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Ratings & Feedback</h2>
            <p className="text-gray-400 text-sm mt-1">Detailed list of users who have rated your store</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-950/50 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">User Details</th>
                <th className="py-4 px-6 font-semibold">Rating</th>
                <th className="py-4 px-6 font-semibold">Date Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {dashboardData.usersWhoRated.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                        <Users className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-500 font-medium">No ratings received yet</p>
                      <p className="text-gray-600 text-sm mt-1">When users rate your store, they will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dashboardData.usersWhoRated.map((user: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-800/30 transition-all group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">{user.name}</span>
                        <span className="text-gray-500 text-xs mt-0.5">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                          <span className="font-bold text-sm">{user.ratingValue}</span>
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div className="hidden sm:flex items-center gap-0.5 ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < user.ratingValue ? 'text-amber-400 fill-current' : 'text-gray-800'}`} />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
