import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AuthModal from './components/AuthModal';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-gh-muted">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gh-bg text-gh-text flex flex-col">
        <Navbar user={user} onOpenAuth={() => setIsAuthModalOpen(true)} />
        
        <main className="flex-1">
          <Routes>
            <Route 
              path="/" 
              element={<Home user={user} onOpenAuth={() => setIsAuthModalOpen(true)} />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/" replace />} 
            />
          </Routes>
        </main>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    </Router>
  );
};

export default App;
