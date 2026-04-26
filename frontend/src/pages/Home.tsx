import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      if (user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'STORE_OWNER') navigate('/owner');
      else navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navbar */}
      <nav className="w-full bg-gray-950 border-b border-gray-800 px-8 py-4 flex items-center justify-between shadow-sm">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-emerald-600 font-bold text-2xl tracking-tight cursor-pointer"
        >
          ReviewApp
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={handleDashboardClick}
            className="text-white font-semibold hover:text-emerald-400 transition-colors text-lg"
          >
            Dashboard
          </button>
          
          {!isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-300 font-semibold hover:text-emerald-400 transition-colors text-lg px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="group relative flex items-center gap-4">
              <div className="flex items-center gap-2 text-white font-semibold bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 cursor-default transition-all group-hover:bg-gray-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {user?.name}
              </div>
              
              {/* Logout Tooltip/Button revealed on hover */}
              <button
                onClick={handleLogout}
                className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-2 text-red-600 font-bold text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all hover:bg-red-50 hover:border-red-100 z-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-8 flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Share your <br/>
          <span className="text-emerald-600"> experience with us</span>
        </h1>
        
        <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12 max-w-2xl">
          Join the most trusted review platform. Whether you are a normal user looking for the best stores, or a store owner wanting to build reputation—our platform will change your life.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-12 text-left">
          <div className="flex items-start gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600 shrink-0">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Trusted Ratings</h3>
              <p className="text-gray-400 text-sm leading-relaxed">100% verified authentic user reviews. We ensure every piece of feedback comes from real experiences.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Lightning Fast</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Instant updates and real-time dashboard analytics.</p>
            </div>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-md hover:-translate-y-1 transform duration-200">
              Get Started 
            </Link>
            {/* <Link to="/login" className="bg-white text-slate-700 border border-slate-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm">
              Log Into Account
            </Link> */}
          </div>
        )}
      </main>
    </div>
  );
}
