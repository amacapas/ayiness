import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Layout, FileText, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { logOut } from '../services/firebase';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onOpenAuth }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-gh-header border-b border-gh-border py-4 px-6 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-gh-text hover:text-gh-blue transition-colors group">
            <Github className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight group-hover:underline">GitHired</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/') ? 'bg-gh-border text-gh-text' : 'text-gh-muted hover:text-gh-text hover:bg-gh-card'
              }`}
            >
              <FileText size={16} />
              AI Cover Letter
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/dashboard') ? 'bg-gh-border text-gh-text' : 'text-gh-muted hover:text-gh-text hover:bg-gh-card'
              }`}
            >
              <Layout size={16} />
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gh-text font-medium">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full border border-gh-border" />
                ) : (
                  <UserIcon size={20} className="bg-gh-border p-0.5 rounded-full" />
                )}
                <span className="hidden sm:inline">{user.displayName}</span>
              </div>
              <button
                onClick={logOut}
                className="text-gh-muted hover:text-red-400 transition-colors p-2 rounded-md hover:bg-gh-card"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-gh-text text-sm font-semibold border border-gh-border bg-gh-card hover:bg-gh-border px-3 py-1.5 rounded-md transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
