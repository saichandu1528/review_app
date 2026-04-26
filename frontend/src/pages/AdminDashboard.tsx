import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import { Users, Store as StoreIcon, Star, Plus, Trash2, X } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'users' | 'stores' | 'ratings'>((searchParams.get('tab') as any) || 'users');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'users' || tab === 'stores' || tab === 'ratings') {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'users' | 'stores' | 'ratings') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '', rating: 5 });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, storesRes, ratingsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/stores'),
        api.get('/admin/ratings')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
      setRatings(ratingsRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete any store they own.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;
    try {
      await api.delete(`/admin/stores/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete store');
    }
  };

  const handleDeleteRating = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rating?')) return;
    try {
      await api.delete(`/admin/ratings/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete rating');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setIsUserModalOpen(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL' });
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error;
      if (Array.isArray(errorMsg)) {
        alert(errorMsg.map((e: any) => e.message).join('\n'));
      } else {
        alert(errorMsg || 'Failed to create user');
      }
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.ownerId) {
      alert('Please select a store owner');
      return;
    }
    try {
      await api.post('/admin/stores', newStore);
      setIsStoreModalOpen(false);
      setNewStore({ name: '', email: '', address: '', ownerId: '', rating: 5 });
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error;
      if (Array.isArray(errorMsg)) {
        alert(errorMsg.map((e: any) => e.message).join('\n'));
      } else {
        alert(errorMsg || 'Failed to create store');
      }
    }
  };

  // Filter for available owners
  const availableOwners = users.filter(user => user.role === 'STORE_OWNER');

  // Filtered Listings
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.address && user.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (store.address && store.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRatings = ratings.filter(rating => 
    rating.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rating.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rating.store?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title={activeTab === 'users' ? 'Manage Users' : activeTab === 'stores' ? 'Manage Stores' : activeTab === 'ratings' ? 'Manage Ratings' : 'Admin Dashboard'}>
      {/* Show Stats only on the main Dashboard view */}
      {!window.location.search.includes('tab=') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all cursor-pointer" onClick={() => handleTabChange('users')}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/10 transition-all" />
            <div className="bg-blue-500/10 p-4 rounded-full border border-blue-500/20 relative z-10">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div className="relative z-10">
              <div className="text-gray-400 text-sm font-medium">Total Users</div>
              <div className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</div>
              <div className="text-blue-400 text-xs mt-2 font-medium flex items-center gap-1 hover:underline">View All &rarr;</div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all cursor-pointer" onClick={() => handleTabChange('stores')}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
            <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 relative z-10">
              <StoreIcon className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="relative z-10">
              <div className="text-gray-400 text-sm font-medium">Total Stores</div>
              <div className="text-3xl font-bold text-white mt-1">{stats.totalStores}</div>
              <div className="text-emerald-400 text-xs mt-2 font-medium flex items-center gap-1 hover:underline">View All &rarr;</div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all cursor-pointer" onClick={() => handleTabChange('ratings')}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none group-hover:bg-amber-500/10 transition-all" />
            <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/20 relative z-10">
              <Star className="w-8 h-8 text-amber-400" />
            </div>
            <div className="relative z-10">
              <div className="text-gray-400 text-sm font-medium">Total Ratings</div>
              <div className="text-3xl font-bold text-white mt-1">{stats.totalRatings}</div>
              <div className="text-amber-400 text-xs mt-2 font-medium flex items-center gap-1 hover:underline">View All &rarr;</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Only show if a tab is selected */}
      {window.location.search.includes('tab=') && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Tab Content */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-white">
                  {activeTab === 'users' ? 'Users Management' : activeTab === 'stores' ? 'Stores Management' : 'Recent Ratings'}
                </h2>
                <p className="text-gray-500 text-sm">
                  Showing {activeTab === 'users' ? filteredUsers.length : activeTab === 'stores' ? filteredStores.length : filteredRatings.length} records
                </p>
              </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <Users className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
              </div>
              
              {activeTab !== 'ratings' && (
                <button 
                  onClick={() => activeTab === 'users' ? setIsUserModalOpen(true) : setIsStoreModalOpen(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-lg shadow-emerald-500/10"
                >
                  <Plus className="w-4 h-4" />
                  Add {activeTab === 'users' ? 'User' : 'Store'}
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    {activeTab === 'users' ? (
                      <>
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">Email</th>
                        <th className="py-3 px-4 font-medium">Role</th>
                        <th className="py-3 px-4 font-medium">Actions</th>
                      </>
                    ) : activeTab === 'stores' ? (
                      <>
                        <th className="py-3 px-4 font-medium">Store Name</th>
                        <th className="py-3 px-4 font-medium">Email</th>
                        <th className="py-3 px-4 font-medium">Address</th>
                        <th className="py-3 px-4 font-medium">Rating</th>
                        <th className="py-3 px-4 font-medium">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-4 font-medium">User</th>
                        <th className="py-3 px-4 font-medium">Store</th>
                        <th className="py-3 px-4 font-medium">Rating</th>
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {activeTab === 'users' ? (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4 text-white">{user.name}</td>
                        <td className="py-3 px-4 text-gray-300">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            user.role === 'STORE_OWNER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : activeTab === 'stores' ? (
                    filteredStores.map(store => (
                      <tr key={store.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{store.name}</td>
                        <td className="py-3 px-4 text-gray-300">{store.email}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm truncate max-w-xs">{store.address}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                            <Star className="w-4 h-4 fill-current" />
                            {store.rating ? store.rating.toFixed(1) : 'New'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleDeleteStore(store.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredRatings.map(rating => (
                      <tr key={rating.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-white text-sm font-medium">{rating.user?.name}</div>
                          <div className="text-gray-500 text-xs">{rating.user?.email}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{rating.store?.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < rating.value ? 'fill-current' : 'text-gray-700'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleDeleteRating(rating.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name </label>
                <input
                  required
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                  <input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="NORMAL">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <textarea
                  required
                  value={newUser.address}
                  onChange={e => setNewUser({...newUser, address: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all h-24"
                  placeholder="User address"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
              <h3 className="text-xl font-bold text-white">Add New Store</h3>
              <button onClick={() => setIsStoreModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateStore} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Store Name</label>
                <input
                  required
                  type="text"
                  value={newStore.name}
                  onChange={e => setNewStore({...newStore, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter store name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Store Email</label>
                <input
                  required
                  type="email"
                  value={newStore.email}
                  onChange={e => setNewStore({...newStore, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="store@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Store Owner</label>
                  <select
                    required
                    value={newStore.ownerId}
                    onChange={e => setNewStore({...newStore, ownerId: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">Select Owner</option>
                    {availableOwners.map(owner => (
                      <option key={owner.id} value={owner.id}>{owner.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Initial Rating</label>
                  <select
                    value={newStore.rating}
                    onChange={e => setNewStore({...newStore, rating: Number(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} Stars</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <textarea
                  required
                  value={newStore.address}
                  onChange={e => setNewStore({...newStore, address: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all h-24"
                  placeholder="Store location address"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
