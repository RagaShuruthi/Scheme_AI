import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import BrowseSchemes from './pages/BrowseSchemes';
import SchemeDetail from './pages/SchemeDetail';
import FindForMe from './pages/FindForMe';
import Updates from './pages/Updates';
import SavedSchemes from './pages/SavedSchemes';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Suite
import AdminDashboard from './pages/AdminDashboard';
import AdminUpdates from './pages/AdminUpdates';
import AdminSources from './pages/AdminSources';
import AdminLogs from './pages/AdminLogs';
import AdminSchemes from './pages/AdminSchemes';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/schemes" element={<BrowseSchemes />} />
                <Route path="/schemes/:id" element={<SchemeDetail />} />
                <Route path="/find-for-me" element={<FindForMe />} />
                <Route path="/updates" element={<Updates />} />
                <Route path="/saved" element={<SavedSchemes />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/updates" element={<AdminUpdates />} />
                <Route path="/admin/sources" element={<AdminSources />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
                <Route path="/admin/schemes" element={<AdminSchemes />} />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
