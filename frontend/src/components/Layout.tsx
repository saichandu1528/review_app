import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Store, Users, Star, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children, title }: { children: React.ReactNode, title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="p-6">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-emerald-400 font-bold text-xl cursor-pointer hover:text-emerald-300 transition-colors"
          >
            ReviewApp
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          {user?.role !== 'ADMIN' && (
            <>
              <div
                onClick={() => {
                  if (user?.role === 'STORE_OWNER') navigate('/owner');
                  else navigate('/dashboard');
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${title === 'Stores Directory' || title === 'Owner Dashboard' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
              <div
                onClick={() => navigate('/change-password')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${title === 'Account Security' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Key className="w-5 h-5" />
                <span className="font-medium">Change Password</span>
              </div>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <div
                onClick={() => navigate('/admin')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${title === 'Admin Dashboard' && !window.location.search.includes('tab=') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
             
              <div
                onClick={() => navigate('/admin?tab=users')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${window.location.search.includes('tab=users') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Users</span>
              </div>
               <div
                onClick={() => navigate('/admin?tab=stores')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${window.location.search.includes('tab=stores') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Store className="w-5 h-5" />
                <span className="font-medium">Stores</span>
              </div>
              <div
                onClick={() => navigate('/admin?tab=ratings')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${window.location.search.includes('tab=ratings') ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Star className="w-5 h-5" />
                <span className="font-medium">Ratings</span>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 relative">
        {/* Header */}
        <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10 flex items-center px-8">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
