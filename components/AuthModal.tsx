import React, { useState } from 'react';
import { X, Github, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import { signInWithGoogle, registerWithEmail, loginWithEmail, sendVerification, logOut } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

type ViewState = 'login' | 'register' | 'verify_sent';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [view, setView] = useState<ViewState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Track the email we sent verification to
  const [verificationEmail, setVerificationEmail] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setIsLoading(false);
    setShowPassword(false);
  };

  const switchToRegister = () => {
    setView('register');
    resetForm();
  };

  const switchToLogin = () => {
    setView('login');
    resetForm();
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      onLoginSuccess();
      onClose();
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user') {
          return; // Ignore
      }
      setError("Login failed. Check Firebase Console configuration.");
    }
  };

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(pass)) return "Password must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (view === 'register') {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (view === 'register') {
        // 1. Create User
        const user = await registerWithEmail(email, password);
        
        // 2. Send Verification
        await sendVerification(user);
        
        // 3. Sign out immediately (Requirement: Do not sign them in automatically)
        await logOut();

        // 4. Show Verification Screen
        setVerificationEmail(email);
        setView('verify_sent');
      } else {
        // Login Flow
        const user = await loginWithEmail(email, password);
        
        if (!user.emailVerified) {
          // Requirement: Block access and show verification screen
          await logOut();
          setVerificationEmail(email);
          setView('verify_sent');
        } else {
          onLoginSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      // Handle Firebase errors by checking 'code' property instead of instanceof FirebaseError
      if (err && err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError("Email is already in use.");
            break;
          case 'auth/invalid-email':
            setError("Invalid email address.");
            break;
          case 'auth/weak-password':
            setError("Password should be at least 6 characters.");
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError("Invalid email or password.");
            break;
          case 'auth/operation-not-allowed':
          case 'auth/configuration-not-found':
            setError("Email/Password sign-in is disabled in Firebase Console. Please enable it.");
            break;
          case 'auth/too-many-requests':
             setError("Too many attempts. Please try again later.");
             break;
          default:
            setError(err.message || "Authentication failed.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gh-card border border-gh-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gh-border bg-gh-header">
          <h2 className="text-lg font-semibold text-gh-text">
            {view === 'register' ? 'Create an account' : view === 'verify_sent' ? 'Verify your email' : 'Sign in to GitHired'}
          </h2>
          <button onClick={onClose} className="text-gh-muted hover:text-gh-text transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {view === 'verify_sent' ? (
            <div className="text-center space-y-6">
               <div className="w-16 h-16 bg-gh-border/50 rounded-full flex items-center justify-center mx-auto text-gh-blue">
                 <Mail size={32} />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold text-gh-text">Check your inbox</h3>
                 <p className="text-gh-muted text-sm leading-relaxed">
                   We have sent you a verification email to <br/>
                   <span className="font-semibold text-gh-text">{verificationEmail}</span>.
                 </p>
                 <p className="text-gh-muted text-sm">
                   Please verify it and log in.
                 </p>
               </div>
               <button
                 onClick={switchToLogin}
                 className="w-full bg-gh-green hover:bg-gh-greenHover text-white font-semibold py-2.5 rounded-md transition-colors text-sm"
               >
                 Login
               </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Github className="mx-auto w-12 h-12 text-gh-text mb-2" />
                <p className="text-sm text-gh-muted">
                  Sync your job applications and generate AI cover letters.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-gh-bg border border-gh-border hover:bg-gh-border text-gh-text font-medium py-2.5 rounded-md transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gh-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gh-card px-2 text-gh-muted">Or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="bg-red-900/20 border border-red-900/50 text-red-200 text-xs p-3 rounded-md">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gh-muted mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gh-bg border border-gh-border text-gh-text rounded-md px-3 py-2 focus:ring-2 focus:ring-gh-blue focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gh-muted">Password</label>
                    {view === 'login' && <a href="#" className="text-xs text-gh-blue hover:underline">Forgot password?</a>}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gh-bg border border-gh-border text-gh-text rounded-md px-3 py-2 focus:ring-2 focus:ring-gh-blue focus:border-transparent outline-none text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gh-muted hover:text-gh-text transition-colors"
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  {view === 'register' && (
                    <div className="mt-2 text-[10px] text-gh-muted space-y-0.5">
                       <p>At least 8 characters</p>
                       <p>Include uppercase, lowercase, number & special char</p>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gh-green hover:bg-gh-greenHover text-white font-semibold py-2 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    view === 'register' ? 'Create account' : 'Sign in'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        {view !== 'verify_sent' && (
          <div className="p-4 bg-gh-bg border-t border-gh-border text-center">
            <p className="text-sm text-gh-muted">
              {view === 'register' ? 'Already have an account?' : 'New to GitHired?'}
              <button
                onClick={view === 'register' ? switchToLogin : switchToRegister}
                className="ml-1 text-gh-blue hover:underline font-medium"
              >
                {view === 'register' ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;