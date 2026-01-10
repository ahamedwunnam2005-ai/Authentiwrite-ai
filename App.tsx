
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

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasCloudKey, setHasCloudKey] = useState(false);
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

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasCloudKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleActivateCloud = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasCloudKey(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnalyze = async () => {
    if (wordCount < APP_CONFIG.MIN_WORD_COUNT) {
      setState(prev => ({ ...prev, error: `Forensic analysis requires at least ${APP_CONFIG.MIN_WORD_COUNT} words for statistical reliability. Current count: ${wordCount}.` }));
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
      
      setHistory(prev => [{
        score: analysis.overallScore,
        label: analysis.label,
        timestamp: Date.now()
      }, ...prev].slice(0, 5));

    } catch (err: any) {
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasCloudKey(false);
        setState(prev => ({ ...prev, isAnalyzing: false, error: "Forensic Cloud session expired. Please re-activate." }));
      } else {
        setState(prev => ({ ...prev, isAnalyzing: false, error: err.message || "An unexpected error occurred during the audit." }));
      }
    }
  };

  const handleDemo = () => {
    const demoEssay = "The smell of cedar shavings always takes me back to my grandfather’s workshop. I remember a Tuesday in 2014, watching his calloused hands move with a rhythm that felt ancient. He wasn’t just building furniture; he was fighting the silence of his small apartment after my grandmother passed. It wasn't perfect—one leg of the stool was a fraction shorter than the rest—but that stool sits in my kitchen today, a lopsided monument to persistence. This taught me that the most meaningful work isn't the most polished; it's the work that carries the weight of a lived moment. As I look toward a career in engineering, I don't just want to build efficient systems; I want to build things that feel as sturdy and honest as that lopsided stool.";
    
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
      filename: `AuthentiWrite_Audit_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF error:', err);
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
    setState({ essay: '', isAnalyzing: false, result: null, error: null });
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
          <i className="fa-solid fa-microscope animate-pulse"></i>
          Elite Linguistic Forensics
        </div>
        <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-slate-900 leading-[0.9] tracking-tighter">
          Voice <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Reclaimed.</span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-500 max-w-4xl mx-auto leading-relaxed font-medium">
          Improving academic writing with clarity, originality, and confidence. Protect your narrative from algorithmic flattening.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <button 
            onClick={() => setView('analyzer')}
            className="w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            Enter Audit Studio
            <i className="fa-solid fa-arrow-right text-base opacity-50"></i>
          </button>
          <button 
            onClick={handleDemo}
            className="w-full sm:w-auto px-12 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-xl hover:bg-slate-50 transition-all"
          >
            Run Neural Demo
          </button>
        </div>
      </section>

      {/* ABOUT SECTION - INTEGRATED MISSION TEXT */}
      <section id="about" className="space-y-16 py-12 scroll-mt-24">
        <div className="flex flex-col md:flex-row gap-12 items-start">
           <div className="flex-1 space-y-8">
              <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest">About AuthentiWrite</div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">Your Companion for <br/><span className="text-indigo-600">Growth & Integrity.</span></h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Welcome to AuthentiWrite, your AI-powered companion for improving academic writing with clarity, originality, and confidence. Designed for students, researchers, and lifelong learners, AuthentiWrite provides intuitive tools that guide you in refining essays, reports, and other academic work, all while fostering responsible learning habits.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                 <div className="flex items-center gap-4 text-indigo-600 font-black text-xs uppercase tracking-widest">
                    <i className="fa-solid fa-shield-check text-xl"></i>
                    Ethical Standards First
                 </div>
                 <a href="mailto:authentiwrite@gmail.com" className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold hover:bg-slate-50 transition-all shadow-sm group">
                    <i className="fa-solid fa-envelope text-indigo-500 group-hover:scale-110 transition-transform"></i>
                    authentiwrite@gmail.com
                 </a>
              </div>
           </div>
           <div className="flex-1 space-y-6 bg-white p-10 sm:p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                <i className="fa-solid fa-feather-pointed text-[15rem]"></i>
              </div>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium relative z-10">
                With real-time feedback, insightful suggestions, and easy-to-understand guidance, our platform helps you enhance your writing skills without compromising ethical standards.
              </p>
              <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/30 relative z-10">
                 <p className="text-sm text-slate-400 font-medium italic">"Cultivating originality in every draft."</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl space-y-8 group hover:-translate-y-2 transition-all">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                 <i className="fa-solid fa-bullseye-arrow text-2xl"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight">Our Mission</h3>
                <p className="text-slate-400 text-base leading-relaxed font-medium">
                  At AuthentiWrite, our mission is to support academic growth by combining advanced AI technology with a commitment to integrity and education. We aim to empower users to express ideas effectively, develop strong writing techniques, and cultivate originality in their work. By focusing on learning rather than shortcuts, AuthentiWrite ensures that every user can build confidence in their writing while respecting institutional expectations.
                </p>
              </div>
           </div>

           <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                 <i className="fa-solid fa-gem text-2xl"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Core Values</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  Our core values are centered on transparency, trustworthiness, and ethical AI use. We believe that technology should augment human learning, not replace it, and that responsible academic practices are essential to personal and professional development. AuthentiWrite encourages critical thinking, ethical research practices, and thoughtful reflection, making it a reliable companion for anyone seeking to improve their writing skills.
                </p>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 p-12 sm:p-20 rounded-[4rem] text-center space-y-10 relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
           <div className="relative z-10 space-y-8">
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Academic Integrity & Excellence</h3>
              <p className="text-lg text-slate-300 max-w-4xl mx-auto leading-relaxed font-medium">
                By integrating AI assistance with these principles, AuthentiWrite creates a safe and supportive environment where students and researchers can explore, learn, and excel. Whether you are drafting your first essay or polishing an advanced research paper, our platform is designed to help you achieve your best results while maintaining the highest standards of academic integrity.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                 {['Transparency', 'Trustworthiness', 'Ethical AI', 'Originality'].map((tag, i) => (
                   <div key={i} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                      {tag}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
         {[
           { icon: 'fa-dna', title: 'Neural Analysis', desc: 'Detects rhythmic monotony and synthetic logic pivots used by major LLMs.' },
           { icon: 'fa-shield-halved', title: 'Absolute Privacy', desc: 'Essays are processed in transient memory. No logs, no storage, no training.' },
           { icon: 'fa-graduation-cap', title: 'Academic Ethics', desc: 'Designed to help students reclaim their voice while respecting institutional standards.' }
         ].map((feature, i) => (
           <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/30 group hover:-translate-y-1 transition-all">
             <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all">
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
    <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-indigo-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95" onClick={handleReset}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-feather-pointed text-sm sm:text-base"></i>
            </div>
            <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 truncate tracking-tighter">
              AuthentiWrite <span className="text-indigo-600">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('home')} className={`text-[11px] font-black transition-colors ${view === 'home' ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'} uppercase tracking-widest`}>Home</button>
            <button onClick={() => { setView('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-[11px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">About</button>
            <button onClick={() => setView('analyzer')} className={`text-[11px] font-black transition-colors ${view === 'analyzer' ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'} uppercase tracking-widest`}>Audit Studio</button>
            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${hasCloudKey ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
               <div className={`w-1.5 h-1.5 rounded-full ${hasCloudKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
               {hasCloudKey ? 'Forensic Cloud Active' : 'Heuristic Mode'}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
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
                  <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">Narrative Audit</h1>
                  <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">Measuring entropy, rhythm, and temporal grounding.</p>
                </div>

                {!hasCloudKey && (
                  <div className="mb-12 bg-indigo-950 text-white p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform">
                       <i className="fa-solid fa-bolt text-[10rem]"></i>
                    </div>
                    <div className="space-y-2 relative z-10">
                       <h3 className="text-xl font-black uppercase tracking-tight">Activate Forensic Cloud</h3>
                       <p className="text-white/60 text-sm font-medium">Unlock deep neural scanning for elite detection accuracy and detailed segment mapping.</p>
                       <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener" className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest underline decoration-dotted">Billing Details</a>
                    </div>
                    <button 
                      onClick={handleActivateCloud}
                      className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl relative z-10"
                    >
                      Connect Forensic Pro
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden relative">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <div className="p-6 sm:p-12">
                    <textarea
                      className="w-full h-80 sm:h-[30rem] p-8 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none text-slate-800 leading-relaxed text-lg bg-slate-50/20 focus:bg-white font-serif"
                      placeholder="Paste your essay here (min 200 words)..."
                      value={state.essay}
                      onChange={(e) => setState(prev => ({ ...prev, essay: e.target.value, error: null }))}
                    />
                    
                    {state.error && (
                      <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-start gap-4 animate-in shake">
                        <i className="fa-solid fa-triangle-exclamation mt-1 shrink-0"></i>
                        <span className="font-bold">{state.error}</span>
                      </div>
                    )}

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <span>{wordCount} Words</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span>{hasCloudKey ? 'Deep Neural Audit' : 'Heuristic Mode'}</span>
                      </div>
                      
                      <div className="flex items-stretch gap-4 w-full sm:w-auto">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.doc,.docx" />
                        <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50">Attach</button>
                        <button
                          id="main-analyze-btn"
                          onClick={handleAnalyze}
                          disabled={wordCount < APP_CONFIG.MIN_WORD_COUNT}
                          className="flex-1 sm:flex-none px-12 py-5 bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-black text-xl shadow-2xl transition-all"
                        >
                          Run Audit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : state.isAnalyzing ? (
              <div className="max-w-2xl mx-auto py-32 text-center animate-in fade-in">
                <div className="relative w-40 h-40 mx-auto mb-16">
                   <div className="absolute inset-0 border-[8px] border-indigo-50 rounded-full"></div>
                   <div className="absolute inset-0 border-[8px] border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <i className={`fa-solid ${hasCloudKey ? 'fa-dna' : 'fa-microchip'} text-indigo-600 text-4xl animate-pulse`}></i>
                   </div>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight uppercase">Auditing Integrity</h2>
                <p className="text-slate-400 text-xl max-w-sm mx-auto font-medium">Mapping linguistic entropy and narrative markers...</p>
              </div>
            ) : state.result && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div id="analysis-report" className="space-y-16 bg-white/40 p-6 sm:p-12 rounded-[4rem] border border-slate-200/50 backdrop-blur-xl">
                  
                  {state.result.isHighRisk && (
                    <div className="bg-rose-600 text-white p-6 sm:p-8 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 shadow-2xl animate-bounce-short">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-2xl font-black tracking-tight mb-1">Synthetic Influence Flagged</h4>
                        <p className="text-white/80 font-medium">This narrative exhibits patterns highly consistent with algorithmic generation.</p>
                      </div>
                      <div className="flex gap-2">
                         {state.result.explainability.aiFlags.slice(0, 2).map((flag, i) => (
                           <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                             {flag}
                           </span>
                         ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-[400px] w-full space-y-6 sticky top-24">
                      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col items-center">
                        <Gauge score={state.result.overallScore} aiInfluence={state.result.aiInfluence} label={state.result.label} confidence={state.result.confidence} />
                        <div className="mt-12 p-8 bg-indigo-50/30 rounded-[2rem] w-full border border-indigo-100/50">
                          <p className="text-slate-700 text-base leading-relaxed italic text-center font-medium">"{state.result.generalFeedback}"</p>
                        </div>
                      </div>

                      {state.result.explainability.aiFlags.length > 0 && (
                        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem]">
                           <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <i className="fa-solid fa-microscope"></i> Anomalies Identified
                           </h4>
                           <div className="space-y-3">
                              {state.result.explainability.aiFlags.map((flag, i) => (
                                <div key={i} className="flex items-center gap-3 py-2 border-b border-rose-100/50 last:border-0">
                                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                   <span className="text-xs font-bold text-rose-800">{flag}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                      <MetricCard label="Perplexity" value={state.result.metrics.perplexity} icon="fa-solid fa-shuffle" description="Word choice unpredictability. Humans choose words emotionally, not statistically." />
                      <MetricCard label="Burstiness" value={state.result.metrics.burstiness} icon="fa-solid fa-wave-square" description="Structural rhythm variance. AI tends to be uniform; humans are dynamic." />
                      <MetricCard label="Grounding" value={state.result.metrics.specificity} icon="fa-solid fa-location-dot" description="Density of temporal markers and sensory details unique to lived experience." />
                      <MetricCard label="Complexity" value={state.result.metrics.linguisticDepth} icon="fa-solid fa-layer-group" description="The depth of syntactic layers and nuanced clause variation." />
                      
                      <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-100 p-10 rounded-[3rem]">
                        <h4 className="text-[11px] font-black text-emerald-800 mb-8 uppercase tracking-[0.25em]">Human Signal Strengths</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {state.result.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-4 text-emerald-900 font-bold">
                              <div className="mt-2 w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <RatingsSection ratings={state.result.ratings} />
                  <ExplainabilityPanel data={state.result.explainability} metrics={state.result.metrics} />
                  <Heatmap segments={state.result.segments} />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-12 py-20 border-t border-slate-200">
                  <div className="max-w-md text-center sm:text-left">
                    <h5 className="font-black text-slate-900 text-3xl mb-4 tracking-tight">Reclaim Your Voice</h5>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">Focus on segments flagged as "Neutral" to inject sensory grounding and specific temporal markers.</p>
                  </div>
                  <div className="flex gap-6 w-full sm:w-auto">
                    <button onClick={downloadPDF} disabled={isDownloading} className="px-12 py-6 border-2 border-slate-200 text-slate-700 rounded-3xl font-black hover:bg-white flex items-center justify-center gap-4 shadow-sm">
                      <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-export'}`}></i>
                      Export Audit
                    </button>
                    <button onClick={handleReset} className="px-14 py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl">Reset</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-24 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-16">
           <div className="space-y-6 max-w-xs">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
                    <i className="fa-solid fa-feather-pointed"></i>
                 </div>
                 <span className="font-black text-2xl tracking-tighter">AuthentiWrite</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">Empowering original thought in a synthetic age. The gold standard for academic integrity.</p>
           </div>
          <div className="flex flex-wrap gap-16 sm:gap-24">
             <div className="space-y-6 text-sm font-bold text-slate-400">
                <h6 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Contact</h6>
                <ul className="space-y-4">
                   <li>
                      <a href="mailto:authentiwrite@gmail.com" className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-colors">
                         <i className="fa-solid fa-envelope"></i>
                         authentiwrite@gmail.com
                      </a>
                   </li>
                </ul>
             </div>
             <div className="space-y-6 text-sm font-bold text-slate-400">
                <h6 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900">Discovery</h6>
                <ul className="space-y-4">
                   <li><button onClick={() => openModal('how')} className="hover:text-indigo-600 transition-colors">Linguistic Entropy</button></li>
                   <li><button onClick={() => openModal('privacy')} className="hover:text-indigo-600 transition-colors">Privacy Disclosure</button></li>
                </ul>
             </div>
          </div>
        </div>
      </footer>

      <Modal isOpen={activeModal === 'how'} onClose={() => setActiveModal(null)} title="The Forensic Method">
        <div className="space-y-8">
          <p>AuthentiWrite utilizes two primary forensic metrics to distinguish between human and synthetic origin:</p>
          <div className="grid gap-6">
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-2">Perplexity</h4>
              <p className="text-sm">A measure of lexical surprise. Humans use unpredictable metaphors and emotional resonance. AI is statistically predictable.</p>
            </div>
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-2">Burstiness</h4>
              <p className="text-sm">Human writing features varied sentence structure and length "bursts." AI typically generates uniform, flat rhythmic patterns.</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Forensic Privacy">
        <div className="space-y-4">
          <p className="font-bold text-slate-900">Your narratives are your intellectual property.</p>
          <p>We do not store your essays. We do not use your data for training. All analysis happens in temporary memory sessions and is cleared immediately upon audit completion or browser refresh.</p>
        </div>
      </Modal>

      <style>{`
        @keyframes bounce-short { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-10px);} 60% {transform: translateY(-5px);} }
        .animate-bounce-short { animation: bounce-short 2s ease-in-out 1; }
        .pdf-printing .print-hidden { display: none !important; }
      `}</style>
    </div>
  );
};

export default App;
