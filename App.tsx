
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeEssay } from './services/geminiService';
import { AppState, AuthenticityLabel, SegmentCategory, AnalysisResult } from './types';
import { APP_CONFIG } from './constants';
import Gauge from './components/Gauge';
import MetricCard from './components/MetricCard';
import Heatmap from './components/Heatmap';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import RatingsSection from './components/RatingsSection';
import Modal from './components/Modal';

type ModalType = 'how' | 'privacy' | 'counselors' | 'research' | 'terms';
type ViewType = 'home' | 'analyzer';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [history, setHistory] = useState<{score: number, label: string, timestamp: number}[]>([]);
  const [state, setState] = useState<AppState>({
    essay: '',
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = state.essay.trim() === '' ? 0 : state.essay.trim().split(/\s+/).length;
  const isCloudEnabled = !!(process.env.API_KEY && process.env.API_KEY !== 'undefined' && process.env.API_KEY.length > 10);

  const handleAnalyze = async () => {
    if (wordCount < APP_CONFIG.MIN_WORD_COUNT) {
      setState(prev => ({ ...prev, error: `Linguistic forensics requires at least ${APP_CONFIG.MIN_WORD_COUNT} words for statistical validity. Current count: ${wordCount}.` }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    
    try {
      const analysis = await analyzeEssay(state.essay);
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        result: analysis 
      }));
      
      // Track session history
      setHistory(prev => [{
        score: analysis.overallScore,
        label: analysis.label,
        timestamp: Date.now()
      }, ...prev].slice(0, 5));

    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message || "An unexpected error occurred during the audit." }));
    }
  };

  const handleDemo = () => {
    const demoEssay = "In the quiet hum of my grandfather's workshop, I first learned that creation is an act of resilience. Surrounded by the scent of cedar shavings and the metallic tang of old tools, I watched him meticulously restore a broken violin. There was no 'undo' button, no algorithm to smooth the edges. It was imperfect, yet profoundly human. This experience shaped my approach to software engineering—not as a quest for digital perfection, but as a way to bridge the gap between abstract logic and visceral human need. When I write code today, I still hear the rhythmic scrape of his plane against wood, reminding me that the most beautiful structures are often those that bear the marks of a human hand.";
    
    setView('analyzer');
    setState(prev => ({ ...prev, essay: demoEssay, error: null }));
    setTimeout(() => {
        const analyzeBtn = document.getElementById('main-analyze-btn');
        if (analyzeBtn) analyzeBtn.click();
    }, 150);
  };

  const downloadPDF = async () => {
    const element = document.getElementById('analysis-report');
    if (!element) return;
    setIsDownloading(true);
    element.classList.add('pdf-printing');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `AuthentiWrite_Forensic_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation error:', err);
    } finally {
      element.classList.remove('pdf-printing');
      setIsDownloading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setState(prev => ({ ...prev, essay: content, error: null }));
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    setState({
      essay: '',
      isAnalyzing: false,
      result: null,
      error: null,
    });
    setView('home');
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setIsMenuOpen(false);
  };

  const renderHome = () => (
    <div className="max-w-6xl mx-auto space-y-24 animate-in fade-in duration-700">
      <section className="text-center pt-12 pb-8 space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
          <i className="fa-solid fa-bolt-lightning animate-pulse"></i>
          Next-Gen Linguistic Forensics
        </div>
        <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-slate-900 leading-[0.9] tracking-tighter">
          The Future of <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Authentic Voice.</span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
          Protect your narrative integrity. AuthentiWrite uses advanced forensic auditing to ensure your personal statement sounds like <span className="text-slate-900 font-bold">you</span>—not an algorithm.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <button 
            onClick={() => setView('analyzer')}
            className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            Launch Analyzer
            <i className="fa-solid fa-arrow-right text-base opacity-50"></i>
          </button>
          <button 
            onClick={handleDemo}
            className="w-full sm:w-auto px-12 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-xl hover:bg-slate-50 transition-all"
          >
            Run Demo Analysis
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
         {[
           { icon: 'fa-dna', title: 'Voice Fingerprinting', desc: 'Analyzes burstiness and rhythmic variance to detect organic human drafting patterns.' },
           { icon: 'fa-user-secret', title: 'Zero Data Storage', desc: 'Essays are analyzed in a transient session. No databases, no training, no footprint.' },
           { icon: 'fa-scale-balanced', title: 'Admissions Ethics', desc: 'Focuses on helping you improve specificity and logic structure for a stronger application.' }
         ].map((feature, i) => (
           <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/30 group hover:-translate-y-1 transition-all">
             <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
               <i className={`fa-solid ${feature.icon} text-2xl`}></i>
             </div>
             <h3 className="font-black text-xl mb-4 text-slate-900">{feature.title}</h3>
             <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
           </div>
         ))}
      </section>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95" onClick={handleReset}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-feather-pointed text-sm sm:text-base"></i>
            </div>
            <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 truncate max-w-[140px] xs:max-w-none tracking-tighter">
              AuthentiWrite <span className="text-blue-600">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('home')} className={`text-[11px] font-black transition-colors ${view === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'} uppercase tracking-widest`}>Home</button>
            <button onClick={() => setView('analyzer')} className={`text-[11px] font-black transition-colors ${view === 'analyzer' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'} uppercase tracking-widest`}>Analyzer</button>
            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${isCloudEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
               <div className={`w-1.5 h-1.5 rounded-full ${isCloudEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
               {isCloudEnabled ? 'Forensic Cloud Active' : 'Heuristic Engine Local'}
            </div>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-xl`}></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12">
        {view === 'home' ? renderHome() : (
          <>
            {!state.result && !state.isAnalyzing ? (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-12 space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Audit Studio</h1>
                  <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
                    Upload or paste your draft to begin the authenticity audit.
                  </p>
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden relative">
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                  <div className="p-6 sm:p-12">
                    <div className="mb-6 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAnonymous ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                             <i className={`fa-solid ${isAnonymous ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                             {isAnonymous ? 'Anonymous Mode On' : 'Anonymous Mode Off'}
                          </button>
                       </div>
                       <div className="hidden sm:flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                          <i className="fa-solid fa-shield-halved"></i>
                          Secure Forensic Audit
                       </div>
                    </div>

                    <textarea
                      className="w-full h-80 sm:h-[30rem] p-8 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none text-slate-800 leading-relaxed text-lg bg-slate-50/20 focus:bg-white font-serif"
                      placeholder="Paste your personal statement here (min 200 words)..."
                      value={state.essay}
                      onChange={(e) => setState(prev => ({ ...prev, essay: e.target.value, error: null }))}
                    />
                    
                    <div className="mt-8 flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em]">
                      <div className="flex gap-8">
                        <span className="text-slate-400">{state.essay.length} Characters</span>
                        <span className={wordCount < APP_CONFIG.MIN_WORD_COUNT ? 'text-rose-500' : 'text-emerald-500'}>
                          {wordCount} / {APP_CONFIG.MIN_WORD_COUNT} Words
                        </span>
                      </div>
                    </div>

                    {state.error && (
                      <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-start gap-4 animate-in shake">
                        <i className="fa-solid fa-triangle-exclamation mt-1 shrink-0 text-base"></i>
                        <span className="font-bold leading-relaxed">{state.error}</span>
                      </div>
                    )}

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <i className={`fa-solid ${isCloudEnabled ? 'fa-cloud-bolt text-blue-500' : 'fa-brain-circuit text-slate-300'}`}></i>
                        Analysis: {isCloudEnabled ? 'Cloud Deep-Scan' : 'Local Heuristics'}
                      </div>
                      
                      <div className="flex items-stretch gap-4 w-full sm:w-auto">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.doc,.docx" />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 sm:flex-none px-8 py-4 border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-paperclip"></i>
                          Attach File
                        </button>
                        <button
                          id="main-analyze-btn"
                          onClick={handleAnalyze}
                          disabled={wordCount < APP_CONFIG.MIN_WORD_COUNT}
                          className="flex-[2] sm:flex-none px-12 py-5 bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-black text-xl transition-all active:scale-95 shadow-2xl shadow-slate-200"
                        >
                          Run Full Audit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : state.isAnalyzing ? (
              <div className="max-w-2xl mx-auto py-32 text-center animate-in fade-in">
                <div className="relative w-40 h-40 mx-auto mb-16">
                   <div className="absolute inset-0 border-[8px] border-blue-50 rounded-full"></div>
                   <div className="absolute inset-0 border-[8px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                     <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent"></div>
                     <i className={`fa-solid ${isCloudEnabled ? 'fa-fingerprint' : 'fa-dna'} text-blue-600 text-4xl animate-pulse`}></i>
                     <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 opacity-50 animate-[loading_2s_infinite]"></div>
                   </div>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight uppercase">Auditing Narrative Integrity</h2>
                <p className="text-slate-400 text-xl max-w-sm mx-auto font-medium">Calculating lexical entropy, syntactic variance, and personal markers. This usually takes 3-5 seconds.</p>
              </div>
            ) : state.result && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div id="analysis-report" className="space-y-16 bg-white/40 p-6 sm:p-12 rounded-[4rem] border border-slate-200/50 backdrop-blur-xl">
                  <div className="flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-[400px] w-full space-y-6 sticky top-24">
                      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col items-center">
                        <Gauge score={state.result.overallScore} aiInfluence={state.result.aiInfluence} label={state.result.label} confidence={state.result.confidence} />
                        <div className="mt-12 p-8 bg-blue-50/30 rounded-[2rem] w-full border border-blue-100/50 relative overflow-hidden group">
                           <i className="fa-solid fa-quote-left absolute -top-2 -left-2 text-4xl text-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                          <p className="text-slate-700 text-base leading-relaxed italic text-center font-medium relative z-10">"{state.result.generalFeedback}"</p>
                        </div>
                      </div>

                      {history.length > 1 && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <i className="fa-solid fa-history"></i> Session History
                           </h4>
                           <div className="space-y-3">
                              {history.map((h, i) => (
                                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0">
                                   <span className="font-bold text-slate-600">{new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   <span className={`px-2 py-0.5 rounded-md font-black ${h.score > 80 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>{h.score}%</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                      <MetricCard label="Voice Entropy" value={state.result.metrics.voice} icon="fa-solid fa-wave-square" description="Measures sentence length variability and rhythmic unpredictability." />
                      <MetricCard label="Detail Density" value={state.result.metrics.specificity} icon="fa-solid fa-map-pin" description="Presence of proper nouns, temporal markers, and sensory descriptors." />
                      <MetricCard label="Logic Originality" value={state.result.metrics.originality} icon="fa-solid fa-puzzle-piece" description="Detects deviations from common 'Admissions Templates'." />
                      <MetricCard label="Linguistic Depth" value={state.result.metrics.linguisticDepth} icon="fa-solid fa-layer-group" description="Syntactic complexity and vocabulary richness (Type-Token Ratio)." />
                      
                      <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-100 p-10 rounded-[3rem]">
                        <h4 className="text-[11px] font-black text-emerald-800 mb-8 flex items-center gap-3 uppercase tracking-[0.25em]">
                          <i className="fa-solid fa-award text-base"></i> Authentic Narrative Strengths
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {state.result.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-5 text-base text-emerald-900 font-bold">
                              <div className="mt-2 w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <RatingsSection ratings={state.result.ratings} />
                  <ExplainabilityPanel data={state.result.explainability} metrics={state.result.metrics} />
                  <div className="page-break-before pt-12">
                    <Heatmap segments={state.result.segments} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-12 py-20 border-t border-slate-200 print:hidden">
                  <div className="max-w-md text-center sm:text-left">
                    <h5 className="font-black text-slate-900 text-3xl mb-4 tracking-tight">Reclaim Your Narrative</h5>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">Use the forensic segment map to identify sections where the 'Human Voice' is muted and apply sensory grounding fixes.</p>
                  </div>
                  <div className="flex flex-col xs:flex-row gap-6 w-full sm:w-auto">
                    <button 
                      onClick={downloadPDF}
                      disabled={isDownloading}
                      className="w-full sm:w-auto px-12 py-6 border-2 border-slate-200 text-slate-700 rounded-3xl font-black text-lg hover:bg-white flex items-center justify-center gap-4 disabled:opacity-50 transition-all shadow-sm"
                    >
                      <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-export'}`}></i>
                      {isDownloading ? 'Generating Report...' : 'Export Audit Report'}
                    </button>
                    <button onClick={handleReset} className="w-full sm:w-auto px-14 py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl shadow-slate-300 transition-all active:scale-95">Reset Audit</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-24 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-16">
           <div className="space-y-6 max-w-xs">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <i className="fa-solid fa-feather-pointed"></i>
                 </div>
                 <span className="font-black text-2xl tracking-tighter text-slate-900">AuthentiWrite</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">Empowering students to preserve their unique voice in the age of synthetic content. Ethical, secure, and purely yours.</p>
           </div>
          <div className="flex flex-wrap gap-16">
             <div className="space-y-6">
                <h6 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Resources</h6>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                   <li><button onClick={() => openModal('how')} className="hover:text-blue-600 transition-colors">Forensic Methodology</button></li>
                   <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Privacy Disclosure</button></li>
                </ul>
             </div>
             <div className="space-y-6">
                <h6 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Legal</h6>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                   <li><button onClick={() => openModal('terms')} className="hover:text-blue-600 transition-colors">Terms of Audit</button></li>
                </ul>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
           <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">&copy; {new Date().getFullYear()} AuthentiWrite AI Studio</p>
           <div className="flex items-center gap-6">
              <i className="fa-brands fa-github text-slate-300 hover:text-slate-900 transition-colors cursor-pointer text-xl"></i>
              <i className="fa-brands fa-linkedin text-slate-300 hover:text-blue-600 transition-colors cursor-pointer text-xl"></i>
           </div>
        </div>
      </footer>

      <Modal isOpen={activeModal === 'how'} onClose={() => setActiveModal(null)} title="Forensic Auditing Methodology">
        <div className="space-y-10">
          <section className="space-y-3">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-wave-square text-blue-600"></i>
              Burstiness & Entropy
            </h3>
            <p className="leading-relaxed">Humans naturally alternate between short, emotional sentences and long, complex clauses. AI outputs are statistically "flat," tending toward a uniform length and complexity that triggers forensic detection.</p>
          </section>
          <section className="space-y-3">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-microchip text-blue-600"></i>
              Predictability Audit
            </h3>
            <p className="leading-relaxed">We calculate the "perplexity" of your prose. Highly predictable phrasing (LLM-standard) results in a lower authenticity score, while idiosyncratic logic and metaphors increase it.</p>
          </section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Privacy & Intellectual Property">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white mb-10 shadow-2xl">
          <p className="font-black text-2xl mb-4 leading-tight">Transient Forensic Sessions</p>
          <p className="opacity-70 leading-relaxed font-medium">Your text is processed in a transient memory state. Once you refresh or close the tab, the audit data is permanently wiped from the execution context.</p>
        </div>
        <div className="space-y-6">
           <p className="font-bold text-slate-900">1. No Storage Policy</p>
           <p className="leading-relaxed">We do not store, log, or index student essays. Your intellectual property is protected by design.</p>
           <p className="font-bold text-slate-900">2. No Training Policy</p>
           <p className="leading-relaxed">Your narrative will never be used to train any AI models. AuthentiWrite is a tool for auditing, not harvesting.</p>
        </div>
      </Modal>

      <style>{`
        @keyframes loading { 0% { transform: translateY(0); } 100% { transform: translateY(160px); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .pdf-only { display: none; }
        .pdf-printing .pdf-only { display: flex; }
        .pdf-printing .page-break-before { page-break-before: always; }
        @media print { .no-print { display: none; } }
      `}</style>
    </div>
  );
};

export default App;
