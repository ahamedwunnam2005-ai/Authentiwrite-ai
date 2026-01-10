
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeEssay } from './services/geminiService';
import { AppState, AuthenticityLabel, SegmentCategory } from './types';
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
  const isCloudEnabled = process.env.API_KEY && process.env.API_KEY !== 'undefined';

  const handleAnalyze = async () => {
    if (wordCount < APP_CONFIG.MIN_WORD_COUNT) {
      setState(prev => ({ ...prev, error: `To ensure statistical accuracy, essays must be at least ${APP_CONFIG.MIN_WORD_COUNT} words. Current count: ${wordCount}.` }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    
    try {
      const analysis = await analyzeEssay(state.essay);
      setState(prev => ({ ...prev, isAnalyzing: false, result: analysis }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message || "An unexpected error occurred." }));
    }
  };

  const handleDemo = () => {
    const demoEssay = "In the quiet hum of my grandfather's workshop, I first learned that creation is an act of resilience. Surrounded by the scent of cedar shavings and the metallic tang of old tools, I watched him meticulously restore a broken violin. There was no 'undo' button, no algorithm to smooth the edges. It was imperfect, yet profoundly human. This experience shaped my approach to software engineering—not as a quest for digital perfection, but as a way to bridge the gap between abstract logic and visceral human need. When I write code today, I still hear the rhythmic scrape of his plane against wood, reminding me that the most beautiful structures are often those that bear the marks of a human hand.";
    
    setView('analyzer');
    setState(prev => ({ ...prev, essay: demoEssay, error: null }));
    // Trigger analysis automatically for the demo
    setTimeout(() => {
        const analyzeBtn = document.getElementById('main-analyze-btn');
        if (analyzeBtn) analyzeBtn.click();
    }, 100);
  };

  const downloadPDF = async () => {
    const element = document.getElementById('analysis-report');
    if (!element) return;
    setIsDownloading(true);
    element.classList.add('pdf-printing');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `AuthentiWrite_Analysis_${new Date().toISOString().split('T')[0]}.pdf`,
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
          <i className="fa-solid fa-feather-pointed"></i>
          Redefining Authenticity in Writing
        </div>
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 leading-[1] tracking-tight">
          Your Voice. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Purely Yours.</span>
        </h1>
        <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
          The world's first ethics-first personal statement analyzer. Evaluate your voice, ensure specificity, and reclaim your narrative from the homogenizing effects of AI.
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
            Try Demo Mode
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
         {[
           { icon: 'fa-microchip', title: 'Hybrid Intelligence', desc: 'Seamlessly switches between Cloud AI and Local Heuristics to provide analysis in any environment.' },
           { icon: 'fa-shield-halved', title: 'Privacy First', desc: 'No essays are stored. No data is used for training. Your intellectual property remains 100% yours.' },
           { icon: 'fa-scale-balanced', title: 'Ethics Driven', desc: 'Designed to help students find their true voice, not to punish or surveil.' }
         ].map((feature, i) => (
           <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 group hover:-translate-y-1 transition-all">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <i className={`fa-solid ${feature.icon} text-xl`}></i>
             </div>
             <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
             <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-feather-pointed text-sm sm:text-base"></i>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 truncate max-w-[140px] xs:max-w-none">
              AuthentiWrite AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('home')} className={`text-sm font-black transition-colors ${view === 'home' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>HOME</button>
            <button onClick={() => setView('analyzer')} className={`text-sm font-black transition-colors ${view === 'analyzer' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>ANALYZER</button>
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${isCloudEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
               <div className={`w-1.5 h-1.5 rounded-full ${isCloudEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
               {isCloudEnabled ? 'Cloud AI Ready' : 'Local Mode'}
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

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-slate-100 ${isMenuOpen ? 'max-h-64' : 'max-h-0'}`}>
          <div className="px-4 py-4 flex flex-col gap-1">
            <button onClick={() => {setView('home'); setIsMenuOpen(false);}} className="text-left py-3 px-4 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">Home</button>
            <button onClick={() => {setView('analyzer'); setIsMenuOpen(false);}} className="text-left py-3 px-4 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">Analyzer</button>
            <button onClick={() => openModal('privacy')} className="text-left py-3 px-4 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">Privacy & Ethics</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12">
        {view === 'home' ? renderHome() : (
          <>
            {!state.result && !state.isAnalyzing ? (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-12 space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Analyzer Studio</h1>
                  <p className="text-lg text-slate-600 max-w-xl mx-auto">
                    Requires a minimum of <strong>{APP_CONFIG.MIN_WORD_COUNT} words</strong> for deep linguistic profiling.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                  <div className="p-6 sm:p-12">
                    <textarea
                      className="w-full h-80 sm:h-[30rem] p-6 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none text-slate-800 leading-relaxed text-base bg-slate-50/30 focus:bg-white font-serif"
                      placeholder="Paste your personal statement here (min 200 words)..."
                      value={state.essay}
                      onChange={(e) => setState(prev => ({ ...prev, essay: e.target.value, error: null }))}
                    />
                    
                    <div className="mt-6 flex justify-between items-center text-[11px] font-black uppercase tracking-[0.15em]">
                      <div className="flex gap-6">
                        <span className="text-slate-400">{state.essay.length} Characters</span>
                        <span className={wordCount < APP_CONFIG.MIN_WORD_COUNT ? 'text-rose-500' : 'text-emerald-500'}>
                          {wordCount} / {APP_CONFIG.MIN_WORD_COUNT} Words
                        </span>
                      </div>
                    </div>

                    {state.error && (
                      <div className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-start gap-3 animate-in shake">
                        <i className="fa-solid fa-circle-exclamation mt-1 shrink-0"></i>
                        <span className="font-bold leading-relaxed">{state.error}</span>
                      </div>
                    )}

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-wide">
                        <i className={`fa-solid ${isCloudEnabled ? 'fa-bolt text-amber-500' : 'fa-brain text-blue-500'} opacity-50`}></i>
                        Powered by {isCloudEnabled ? 'Gemini 3 Flash' : 'Linguistic Heuristics v2.0'}
                      </div>
                      
                      <div className="flex items-stretch gap-4 w-full sm:w-auto">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.doc,.docx" />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 sm:flex-none px-6 py-4 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-paperclip"></i>
                          Upload
                        </button>
                        <button
                          id="main-analyze-btn"
                          onClick={handleAnalyze}
                          disabled={wordCount < APP_CONFIG.MIN_WORD_COUNT}
                          className="flex-[2] sm:flex-none px-12 py-4 bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-slate-200"
                        >
                          Analyze Essay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : state.isAnalyzing ? (
              <div className="max-w-2xl mx-auto py-32 text-center animate-in fade-in">
                <div className="relative w-32 h-32 mx-auto mb-12">
                   <div className="absolute inset-0 border-[6px] border-blue-50 rounded-full"></div>
                   <div className="absolute inset-0 border-[6px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <i className={`fa-solid ${isCloudEnabled ? 'fa-microchip' : 'fa-brain'} text-blue-600 text-2xl animate-pulse`}></i>
                   </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6">Running Forensics</h2>
                <p className="text-slate-500 text-lg max-w-sm mx-auto font-medium">Measuring vocabulary richness, sentence entropy, and narrative markers. This typically takes 3-5 seconds.</p>
              </div>
            ) : state.result && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div id="analysis-report" className="space-y-12 bg-white/50 p-6 rounded-[3rem] border border-slate-200/50 backdrop-blur-sm">
                  <div className="flex flex-col lg:flex-row gap-12 items-stretch">
                    <div className="lg:w-[350px] bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col items-center h-fit">
                      <Gauge score={state.result.overallScore} aiInfluence={state.result.aiInfluence} label={state.result.label} confidence={state.result.confidence} />
                      <div className="mt-10 p-6 bg-blue-50/30 rounded-3xl w-full border border-blue-100/50">
                        <p className="text-slate-700 text-sm leading-relaxed italic text-center font-medium">"{state.result.generalFeedback}"</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
                      <MetricCard label="Voice Entropy" value={state.result.metrics.voice} icon="fa-solid fa-wave-square" description="Rhythmic variation of prose." />
                      <MetricCard label="Specificity" value={state.result.metrics.specificity} icon="fa-solid fa-map-pin" description="Personal markers and sensory details." />
                      <MetricCard label="Originality" value={state.result.metrics.originality} icon="fa-solid fa-puzzle-piece" description="Logic structure and metaphorical depth." />
                      <MetricCard label="Linguistic Depth" value={state.result.metrics.linguisticDepth} icon="fa-solid fa-layer-group" description="Syntactic complexity and vocabulary." />
                      
                      <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2.5rem]">
                        <h4 className="text-xs font-black text-emerald-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
                          <i className="fa-solid fa-award"></i> Narrative Strengths
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {state.result.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-4 text-sm text-emerald-900 font-bold">
                              <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
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

                <div className="flex flex-col sm:flex-row items-center justify-between gap-12 py-16 border-t border-slate-200 print:hidden">
                  <div className="max-w-md text-center sm:text-left">
                    <h5 className="font-black text-slate-900 text-2xl mb-3 tracking-tight">Preserve Your Truth</h5>
                    <p className="text-slate-500 font-medium">Use the heatmap to identify and humanize over-polished sections where your authentic voice might be muted.</p>
                  </div>
                  <div className="flex flex-col xs:flex-row gap-4 w-full sm:w-auto">
                    <button 
                      onClick={downloadPDF}
                      disabled={isDownloading}
                      className="w-full sm:w-auto px-10 py-5 border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-lg hover:bg-white flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-sm"
                    >
                      <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                      {isDownloading ? 'Exporting...' : 'Export Report'}
                    </button>
                    <button onClick={handleReset} className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-300 transition-all active:scale-95">Reset Analyzer</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <i className="fa-solid fa-feather-pointed"></i>
             </div>
             <span className="font-bold text-slate-900">AuthentiWrite AI Studio</span>
          </div>
          <div className="flex gap-8 text-xs font-black uppercase text-slate-400 tracking-widest">
             <button onClick={() => openModal('how')} className="hover:text-blue-600 transition-colors">How it Works</button>
             <button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Integrity</button>
             <button onClick={() => openModal('terms')} className="hover:text-blue-600 transition-colors">Legal</button>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} All Rights Reserved</p>
        </div>
      </footer>

      <Modal isOpen={activeModal === 'how'} onClose={() => setActiveModal(null)} title="The Forensics of Voice">
        <div className="space-y-8">
          <section>
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">Burstiness & Entropy</h3>
            <p>Humans naturally alternate between short, punchy sentences and long, complex clauses. AI outputs are statistically "flat," tending toward a uniform length and complexity that triggers detection.</p>
          </section>
          <section>
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">The Type-Token Ratio</h3>
            <p>We measure the diversity of your vocabulary against your specific narrative. High originality is detected when you use unique, concrete nouns rather than abstract admissions buzzwords.</p>
          </section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Commitment to Privacy">
        <div className="bg-slate-900 p-8 rounded-3xl text-white mb-8">
          <p className="font-black text-xl mb-3">Ephemeral Processing</p>
          <p className="opacity-70 leading-relaxed">Your essay is analyzed in a transient session. Once you close this tab, the text is gone. We do not maintain a database of student work.</p>
        </div>
        <p className="text-slate-600 leading-relaxed">We built AuthentiWrite to empower the student, not to serve as a tool for institutions. Our goal is to help you present the best, most authentic version of yourself to the world.</p>
      </Modal>

      <style>{`
        @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .pdf-only { display: none; }
        .pdf-printing .pdf-only { display: flex; }
        .pdf-printing .page-break-before { page-break-before: always; }
      `}</style>
    </div>
  );
};

export default App;
