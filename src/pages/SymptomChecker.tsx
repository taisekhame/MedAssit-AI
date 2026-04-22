import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeSymptoms, TriageResult } from '../services/geminiService';
import { ShieldAlert, Activity, HeartPulse, Loader2, LogOut, Clock, PlusCircle, ChevronRight } from 'lucide-react';
import { logout } from '../lib/firebase';

interface PastQuery {
  id: string;
  userId: string;
  symptoms: string;
  result: TriageResult;
  createdAt: Date;
}

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<PastQuery[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const q = query(
        collection(db, `users/${user.uid}/queries`),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedHistory: PastQuery[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let createdDate = new Date();
        if (data.createdAt?.toDate) {
          createdDate = data.createdAt.toDate();
        } else if (typeof data.createdAt === 'number') {
           createdDate = new Date(data.createdAt);
        }
        fetchedHistory.push({
          id: docSnap.id,
          userId: data.userId,
          symptoms: data.symptoms,
          result: data.result,
          createdAt: createdDate,
        });
      });
      setHistory(fetchedHistory);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedId(null);

    try {
      const triageResult = await analyzeSymptoms(symptoms);
      setResult(triageResult);
      
      // Save to Firebase
      const user = auth.currentUser;
      if (user) {
        const newQueryRef = doc(collection(db, `users/${user.uid}/queries`));
        const newQueryData = {
          userId: user.uid,
          symptoms: symptoms,
          result: triageResult,
          createdAt: serverTimestamp()
        };
        await setDoc(newQueryRef, newQueryData);
        // Refresh local history
        await fetchHistory();
        setSelectedId(newQueryRef.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPastQuery = (item: PastQuery) => {
    setSymptoms(item.symptoms);
    setResult(item.result);
    setError(null);
    setSelectedId(item.id);
  };

  const handleNewAnalysis = () => {
    setSymptoms('');
    setResult(null);
    setError(null);
    setSelectedId(null);
  };

  const renderBadge = (level: TriageResult['urgencyLevel']) => {
    switch (level) {
      case 'URGENT':
        return (
          <div className="inline-flex items-center px-[16px] py-[6px] rounded-full font-bold text-[0.85rem] md:text-[0.9rem] uppercase tracking-[0.05em] bg-[#fff5f5] text-[#c53030] border border-[#feb2b2]">
            🔴 Urgent
          </div>
        );
      case 'SEE_DOCTOR':
        return (
          <div className="inline-flex items-center px-[16px] py-[6px] rounded-full font-bold text-[0.85rem] md:text-[0.9rem] uppercase tracking-[0.05em] bg-[#fffaf0] text-[#9c4221] border border-[#fbd38d]">
            🟡 See Doctor
          </div>
        );
      case 'HOME_CARE':
        return (
          <div className="inline-flex items-center px-[16px] py-[6px] rounded-full font-bold text-[0.85rem] md:text-[0.9rem] uppercase tracking-[0.05em] bg-[#f0fff4] text-[#276749] border border-[#9ae6b4]">
            🟢 Manage at Home
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] font-sans text-[#1a202c]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#e2e8f0] px-6 py-4 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)] sticky top-0 z-50">
        <div className="flex items-center gap-2 text-[#059669] font-bold text-xl tracking-tight">
          <HeartPulse className="w-6 h-6 stroke-[2.5]" />
          MedAssist AI
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-[#718096] hover:text-[#c53030] transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 lg:p-5 grid lg:grid-cols-[280px_400px_1fr] gap-5 items-start">
        
        {/* History Sidebar */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-4 flex flex-col h-[300px] lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 overflow-hidden">
          <button 
            onClick={handleNewAnalysis}
            className="w-full bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#059669] font-semibold border border-[#a7f3d0] rounded-lg p-3 text-sm flex items-center justify-center gap-2 transition-colors mb-4"
          >
            <PlusCircle className="w-4 h-4" />
            New Analysis
          </button>
          
          <h3 className="text-xs font-bold text-[#a0aec0] uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Recent Queries
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 pb-4 scrollbar-thin">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-6 text-[#a0aec0]">
                 <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-[#718096] text-center italic py-4">No past queries found.</p>
            ) : (
              history.map(item => (
                <button
                  key={item.id}
                  onClick={() => loadPastQuery(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedId === item.id 
                      ? 'bg-[#059669] border-[#047857] text-white shadow-md' 
                      : 'bg-white border-[#e2e8f0] hover:border-[#a7f3d0] hover:bg-[#f0fdf4] text-[#4a5568]'
                  }`}
                >
                  <div className={`text-[0.7rem] mb-1 font-semibold ${selectedId === item.id ? 'text-[#a7f3d0]' : 'text-[#a0aec0]'}`}>
                    {item.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm line-clamp-2 leading-tight">
                    {item.symptoms}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col lg:h-[calc(100vh-120px)] lg:sticky lg:top-24">
          <h2 className="text-[1.1rem] font-semibold text-[#2d3748] m-0 mb-1">Symptom Checker</h2>
          <p className="text-[#718096] text-[0.85rem] m-0 mb-4">
            Provide a detailed description of how you are feeling.
          </p>
          
          <form onSubmit={handleAnalyze} className="flex flex-col flex-grow gap-3 relative">
            <textarea
              className="w-full h-[200px] lg:h-auto lg:flex-grow p-4 border-[1.5px] border-[#cbd5e1] rounded-lg text-[0.95rem] focus:border-[#059669] focus:ring-0 outline-none transition-colors resize-none shadow-sm"
              placeholder="Example: I have had a sharp headache and high fever for 2 days. My joints also feel very weak..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={isLoading || !symptoms.trim()}
              className="w-full bg-[#059669] hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg p-[14px] text-[1rem] flex items-center justify-center gap-2.5 transition-colors shadow-md border-none flex-shrink-0 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
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

        {/* Results Area */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-6 min-h-[400px] flex flex-col relative h-full">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
               <div className="flex flex-col items-center">
                 <div className="w-10 h-10 border-[4px] border-[#ecfdf5] border-t-[#059669] rounded-full animate-spin shadow-sm mb-3"></div>
                 <p className="text-[#059669] font-medium animate-pulse">Running AI Triage...</p>
               </div>
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

          {/* Results Block */}
          {result && !error && (
            <div className="flex flex-col gap-5 h-full">
              <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3 pb-3">
                <h2 className="m-0 text-[1.2rem] font-bold text-[#1a202c]">Triage Summary</h2>
                {renderBadge(result.urgencyLevel)}
              </div>

              <div className="border-b border-[#edf2f7] pb-5">
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

              <div className="bg-[#f8fafc] border-l-4 border-[#059669] rounded-r-lg p-5 shadow-sm">
                <h4 className="m-0 mb-3 text-[#059669] font-semibold text-[1.05rem]">Home Care & Next Steps</h4>
                <div className="m-0 text-[0.95rem] leading-[1.7] text-[#2d3748] whitespace-pre-line">
                  {result.careAdvice}
                </div>
              </div>

              <div className="bg-[#ecfdf5] p-5 rounded-lg text-[0.9rem] text-[#047857] border border-[#a7f3d0] shadow-sm mt-auto">
                <strong className="block mb-2 text-[#059669] text-[0.95rem]">Assessment / Regional Context:</strong>
                <p className="leading-relaxed">{result.explanation}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && !error && !isLoading && (
             <div className="flex flex-col items-center justify-center flex-grow text-[#a0aec0] h-full py-16">
               <Activity className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-center text-[1rem] max-w-sm font-medium">
                 Ready for Analysis
               </p>
               <p className="text-center text-[0.85rem] mt-2 px-6">
                 Select a past query from history, or enter new symptoms to get started.
               </p>
             </div>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="mt-auto flex flex-col z-10 shrink-0">
        <div className="bg-white border-t border-[#e2e8f0] text-[#718096] text-[0.75rem] text-center px-5 py-[10px]">
          <strong>IMPORTANT:</strong> This tool is an AI assistant and is NOT a substitute for professional medical advice. If you think you may have a medical emergency, call your local emergency services immediately.
        </div>
      </footer>
    </div>
  );
}
