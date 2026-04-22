import React from 'react';
import { HeartPulse, ArrowRight, ShieldCheck, Clock, Activity } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // On success, the AuthProvider in App.tsx will redirect.
    } catch (error) {
      console.error(error);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] font-sans text-[#1a202c]">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)] sticky top-0 z-50">
        <div className="flex items-center gap-2 text-[#059669] font-bold text-xl tracking-tight">
          <HeartPulse className="w-6 h-6 stroke-[2.5]" />
          MedAssist AI
        </div>
        <button 
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="bg-[#059669] hover:bg-[#047857] text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {isSigningIn ? 'Connecting...' : 'Sign In'}
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-[#ecfdf5] border border-[#a7f3d0] rounded-full text-[#059669] text-sm font-semibold shadow-sm">
          <Activity className="w-4 h-4" />
          Powered by MedxVerse x Gemini 2.0
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[#1a202c] leading-tight mb-6 mt-4">
          Intelligent Health Triage <br/> <span className="text-[#059669]">For Everyone.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[#4a5568] max-w-2xl mb-10 leading-relaxed">
          Instantly evaluate your symptoms using advanced AI. Get reliable possible conditions, urgency levels, and evidence-based home care advice in seconds.
        </p>

        <button 
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="bg-[#059669] hover:bg-[#047857] text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-3 border-none outline-none disabled:opacity-50"
        >
          {isSigningIn ? 'Signing In...' : 'Get Started with Google'}
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Features Grid */}
        <div className="w-full grid md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-white p-6 justify-center rounded-2xl border border-[#e2e8f0] shadow-sm">
            <div className="bg-[#ecfdf5] w-12 h-12 flex items-center justify-center rounded-lg text-[#059669] mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2d3748] mb-2">Secure & Private</h3>
            <p className="text-[#718096] text-sm leading-relaxed">
              Your health data is not stored permanently. We use Firebase Authentication for safe and secure access to your session.
            </p>
          </div>
          <div className="bg-white p-6 justify-center rounded-2xl border border-[#e2e8f0] shadow-sm">
            <div className="bg-[#ecfdf5] w-12 h-12 flex items-center justify-center rounded-lg text-[#059669] mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2d3748] mb-2">Instant Triage</h3>
            <p className="text-[#718096] text-sm leading-relaxed">
              Don't wait in uncertainty. Check symptoms immediately and understand if you need urgent care, a doctor visit, or home rest.
            </p>
          </div>
          <div className="bg-white p-6 justify-center rounded-2xl border border-[#e2e8f0] shadow-sm">
            <div className="bg-[#ecfdf5] w-12 h-12 flex items-center justify-center rounded-lg text-[#059669] mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2d3748] mb-2">Regional Context</h3>
            <p className="text-[#718096] text-sm leading-relaxed">
              Trained to evaluate conditions relevant to African regions, understanding endemic contexts and common local ailments.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto flex flex-col">
        <div className="bg-[#f8fafc] border-t border-[#e2e8f0] text-[#a0aec0] text-[0.85rem] text-center p-[16px]">
          Powered by MedxVerse • Utilizing Gemini 2.0 Flash AI • &copy; {new Date().getFullYear()} MedAssist AI
        </div>
      </footer>
    </div>
  );
}
