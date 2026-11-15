import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@schemesaarthi.gov.in');
      setPassword('Admin@123456');
    } else {
      setEmail('citizen@schemesaarthi.gov.in');
      setPassword('Citizen@123456');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
          SS
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
          Citizen & Admin Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your saved schemes, eligibility profile, and verified scheme alerts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@schemesaarthi.gov.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-700 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-500 mb-2 text-center">
              Quick Demo Fill:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('citizen')}
                className="text-xs bg-slate-100 hover:bg-slate-200 font-medium py-2 px-3 rounded-lg text-slate-700 text-center transition-colors cursor-pointer"
              >
                👤 Citizen Login
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="text-xs bg-purple-50 hover:bg-purple-100 font-bold py-2 px-3 rounded-lg text-purple-900 border border-purple-200 text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-700 hover:underline">
              Register free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
