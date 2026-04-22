import React, { useState } from 'react';
import { analyzeSymptoms, TriageResult } from '../services/geminiService';
import { ShieldAlert, Activity, AlertTriangle, CheckCircle2, HeartPulse, Loader2, LogOut } from 'lucide-react';
import { logout } from '../lib/firebase';

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const triageResult = await analyzeSymptoms(symptoms);
      setResult(triageResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBadge = (level: TriageResult['urgencyLevel']) => {
    switch (level) {
      case 'URGENT':
        return (
          <div className="inline-flex items-center px-[16px] py-[6px] rounded-full font-bold text-[0.9rem] uppercase tracking-[0.05em] bg-[#fff5f5] text-[#c53030] border border-[#feb2b2]">
            🔴 Urgent
          </div>
        );
      case 'SEE_DOCTOR':
        return (
          <div className="inline-flex items-center px-[16px] py-[6px] rounded-full font-bold text-[0.9rem] uppercase tracking-[0.05em] bg-[#fffaf0] text-[#9c4221] border border-[#fbd38d]">
            🟡 See a Doctor
          </div>
        );
      case 'HOME_CARE':
        return (
          <div className="inline-flex items-center px-[16px] py-[6px] rounded-full font-bold text-[0.9rem] uppercase tracking-[0.05em] bg-[#f0fff4] text-[#276749] border border-[#9ae6b4]">
            🟢 Manage at Home
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] font-sans text-[#1a202c]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#e2e8f0] px-6 py-4 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 text-[#059669] font-bold text-xl tracking-tight">
          <HeartPulse className="w-6 h-6 stroke-[2.5]" />
          MedAssist AI
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-[#718096] hover:text-[#c53030] transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 lg:p-5 grid lg:grid-cols-[420px_1fr] gap-5 items-start">
        
        {/* Intro / Form Card */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] p-6 flex flex-col">
          <h2 className="text-[1.1rem] font-semibold text-[#2d3748] m-0 mb-1">Symptom Checker</h2>
          <p className="text-[#718096] text-[0.85rem] m-0 mb-4">
            Provide a detailed description of how you are feeling.
          </p>
          
          <form onSubmit={handleAnalyze} className="flex flex-col flex-grow gap-3">
            <textarea
              className="w-full min-h-[250px] flex-grow p-4 border-[1.5px] border-[#cbd5e1] rounded-lg text-[1rem] focus:border-[#059669] focus:ring-0 outline-none transition-colors resize-none shadow-sm"
              placeholder="Example: I have had a sharp headache and high fever for 2 days. My joints also feel very weak..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={isLoading || !symptoms.trim()}
              className="w-full bg-[#059669] hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg p-[14px] text-[1rem] flex items-center justify-center gap-2.5 transition-colors shadow-md border-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  <span>Check Symptoms</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Area Container */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] p-6 min-h-[400px] flex flex-col relative h-full">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
               <div className="w-10 h-10 border-[4px] border-[#ecfdf5] border-t-[#059669] rounded-full animate-spin shadow-sm"></div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4 flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-red-800">
                <h3 className="font-semibold text-[0.95rem]">Analysis Failed</h3>
                <p className="text-[0.85rem] mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Results Area */}
          {result && !error && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2">
                <h2 className="m-0 text-[1.1rem] font-semibold text-[#2d3748]">Triage Analysis</h2>
                {renderBadge(result.urgencyLevel)}
              </div>

              <div className="border-b border-[#edf2f7] pb-4">
                <p className="m-0 mb-3 text-[0.85rem] text-[#718096] uppercase font-bold tracking-wider">
                  Possible Conditions
                </p>
                <div className="flex gap-2 flex-wrap">
                  {result.conditions.map((condition, idx) => (
                    <span key={idx} className="bg-[#ecfdf5] text-[#059669] px-3 py-1.5 rounded-md text-[0.85rem] font-semibold border border-[#a7f3d0] shadow-sm">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#f8fafc] border-l-4 border-[#059669] rounded-r-lg p-4 shadow-sm">
                <h4 className="m-0 mb-2 text-[#059669] font-semibold text-[1.05rem]">Home Care & Next Steps</h4>
                <div className="m-0 text-[0.95rem] leading-[1.6] text-[#2d3748] whitespace-pre-line">
                  {result.careAdvice}
                </div>
              </div>

              <div className="bg-[#ecfdf5] p-4 rounded-lg text-[0.9rem] text-[#047857] border border-[#a7f3d0] shadow-sm">
                <strong className="block mb-1 text-[#059669]">Assessment / Regional Context:</strong>
                {result.explanation}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && !error && !isLoading && (
             <div className="flex flex-col items-center justify-center flex-grow text-[#a0aec0] h-full my-auto">
               <Activity className="w-12 h-12 mb-3 opacity-30" />
               <p className="text-center text-[0.9rem] max-w-sm">
                 Waiting for symptoms...
               </p>
             </div>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <div className="mt-auto flex flex-col">
        <div className="bg-white border-t border-[#e2e8f0] text-[#718096] text-[0.75rem] text-center px-5 py-[10px]">
          <strong>IMPORTANT DISCLAIMER:</strong> This tool is an AI assistant and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your local emergency services immediately.
        </div>
        <div className="bg-[#f8fafc] border-t border-[#e2e8f0] text-[#a0aec0] text-[0.8rem] text-center p-[12px]">
          Powered by MedxVerse • Utilizing Gemini 2.0 Flash AI • &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
