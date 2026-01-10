
import React, { useState, useCallback, useRef } from 'react';
import { analyzeEssay } from './services/geminiService';
import { AppState, AuthenticityLabel } from './types';
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

    const fileName = file.name.toLowerCase();
    const isValidExtension = fileName.endsWith('.txt') || fileName.endsWith('.md');

    if (!isValidExtension) {
      setState(prev => ({ ...prev, error: "Please upload a valid .txt or .md file." }));
      return;
    }

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
      {/* Hero Section */}
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
          Welcome to AuthentiWrite, your AI-powered companion for improving academic writing with clarity, originality, and confidence.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <button 
            onClick={() => setView('analyzer')}
            className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            Start Analysis
            <i className="fa-solid fa-arrow-right text-base opacity-50"></i>
          </button>
          <button 
            onClick={() => openModal('how')}
            className="w-full sm:w-auto px-12 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-xl hover:bg-slate-50 transition-all"
          >
            How it Works
          </button>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="space-y-20 py-12">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-1 bg-blue-600 rounded-full"></span>
              Welcome to AuthentiWrite
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Designed for students, researchers, and lifelong learners, AuthentiWrite provides intuitive tools that guide you in refining essays, reports, and other academic work, all while fostering responsible learning habits. With real-time feedback, insightful suggestions, and easy-to-understand guidance, our platform helps you enhance your writing skills without compromising ethical standards.
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <i className="fa-solid fa-graduation-cap text-9xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Our Mission</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              At AuthentiWrite, our mission is to support academic growth by combining advanced AI technology with a commitment to integrity and education. We aim to empower users to express ideas effectively, develop strong writing techniques, and cultivate originality in their work. By focusing on learning rather than shortcuts, AuthentiWrite ensures that every user can build confidence in their writing while respecting institutional expectations.
            </p>
          </div>
        </div>

        {/* Values & Integration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 p-8 opacity-10">
              <i className="fa-solid fa-shield-halved text-9xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <i className="fa-solid fa-star text-amber-400"></i>
              Core Values
            </h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Our core values are centered on transparency, trustworthiness, and ethical AI use. We believe that technology should augment human learning, not replace it, and that responsible academic practices are essential to personal and professional development. AuthentiWrite encourages critical thinking, ethical research practices, and thoughtful reflection, making it a reliable companion for anyone seeking to improve their writing skills.
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-1 bg-indigo-600 rounded-full"></span>
              A Safe Environment
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              By integrating AI assistance with these principles, AuthentiWrite creates a safe and supportive environment where students and researchers can explore, learn, and excel. Whether you are drafting your first essay or polishing an advanced research paper, our platform is designed to help you achieve your best results while maintaining the highest standards of academic integrity.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 rounded-[4rem] p-12 sm:p-20 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-500 rounded-full blur-[120px]"></div>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Ready to Reclaim Your Voice?</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
          Start your free analysis now. No login required. No data stored. Just pure insights into your writing integrity.
        </p>
        <div className="pt-4">
          <button 
            onClick={() => {setView('analyzer'); window.scrollTo(0,0);}}
            className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl shadow-white/5"
          >
            Launch Analyzer
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-100">
      {/* Navigation */}
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
            <button onClick={() => openModal('privacy')} className="text-sm font-black text-slate-600 hover:text-blue-600 transition-colors uppercase">Ethics</button>
            <button onClick={() => openModal('counselors')} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-xs font-black hover:bg-slate-200 transition-all border border-slate-200/50 uppercase">Counselors</button>
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

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-slate-100 ${isMenuOpen ? 'max-h-64' : 'max-h-0'}`}>
          <div className="px-4 py-4 flex flex-col gap-1">
            <button onClick={() => {setView('home'); setIsMenuOpen(false);}} className="text-left py-3 px-4 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">Home</button>
            <button onClick={() => {setView('analyzer'); setIsMenuOpen(false);}} className="text-left py-3 px-4 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">Analyzer</button>
            <button onClick={() => openModal('privacy')} className="text-left py-3 px-4 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">Privacy & Ethics</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
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
                      className="w-full h-80 sm:h-[30rem] p-6 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none text-slate-800 leading-relaxed text-base bg-slate-50/30 focus:bg-white"
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
                        <i className="fa-solid fa-lock text-blue-500/50"></i>
                        Secure Session Analysis
                      </div>
                      
                      <div className="flex items-stretch gap-4 w-full sm:w-auto">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md" />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 sm:flex-none px-6 py-4 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-paperclip"></i>
                          Upload
                        </button>
                        <button
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
                     <i className="fa-solid fa-microchip text-blue-600 text-2xl animate-pulse"></i>
                   </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6">Evaluating Linguistic Integrity</h2>
                <p className="text-slate-500 text-lg max-w-sm mx-auto font-medium">Measuring vocabulary richness, sentence entropy, and narrative markers. Please hold.</p>
                <div className="mt-12 h-1.5 bg-slate-100 rounded-full max-w-xs mx-auto overflow-hidden relative">
                   <div className="absolute top-0 left-0 h-full bg-blue-600 w-1/3 animate-[loading_2s_infinite]"></div>
                </div>
              </div>
            ) : state.result && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div id="analysis-report" className="space-y-12 bg-white/50 p-6 rounded-[3rem] border border-slate-200/50 backdrop-blur-sm">
                  {/* Results Header */}
                  <div className="flex flex-col lg:flex-row gap-12 items-stretch">
                    <div className="lg:w-[350px] bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col items-center h-fit">
                      <Gauge score={state.result.overallScore} aiInfluence={state.result.aiInfluence} label={state.result.label} confidence={state.result.confidence} />
                      <div className="mt-10 p-6 bg-blue-50/30 rounded-3xl w-full border border-blue-100/50">
                        <p className="text-slate-700 text-sm leading-relaxed italic text-center font-medium">"{state.result.generalFeedback}"</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
                      <MetricCard label="Voice Entropy" value={state.result.metrics.voice} icon="fa-solid fa-wave-square" description="Unpredictability of phrasing." />
                      <MetricCard label="Specificity" value={state.result.metrics.specificity} icon="fa-solid fa-map-pin" description="Personal markers and details." />
                      <MetricCard label="Originality" value={state.result.metrics.originality} icon="fa-solid fa-puzzle-piece" description="Logic structure uniqueness." />
                      <MetricCard label="Linguistic Depth" value={state.result.metrics.linguisticDepth} icon="fa-solid fa-layer-group" description="Vocabulary richness and syntax." />
                      
                      <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2.5rem]">
                        <h4 className="text-xs font-black text-emerald-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
                          <i className="fa-solid fa-award"></i> Authentic Strengths
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

                {/* Print/Download Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-12 py-16 border-t border-slate-200 print:hidden">
                  <div className="max-w-md text-center sm:text-left">
                    <h5 className="font-black text-slate-900 text-2xl mb-3 tracking-tight">Protect Your Narrative</h5>
                    <p className="text-slate-500 font-medium">Apply humanizing fixes to over-polished areas to ensure your authentic truth shines through.</p>
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
                    <button onClick={handleReset} className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-300 transition-all active:scale-95">New Analysis</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-20 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 text-center md:text-left">
          <div className="col-span-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl">
                <i className="fa-solid fa-feather-pointed"></i>
              </div>
              <span className="text-2xl font-black tracking-tighter">AuthentiWrite AI</span>
            </div>
            <p className="text-slate-500 max-w-sm mb-10 mx-auto md:mx-0 font-medium leading-relaxed">
              We empower students to preserve their unique voice in a world of synthetic content through ethical AI auditing and linguistic forensics.
            </p>
          </div>
          <div>
            <h6 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-[11px]">Resources</h6>
            <ul className="space-y-5 text-sm font-bold text-slate-500">
              <li><button onClick={() => openModal('how')} className="hover:text-blue-600 transition-colors">How it Works</button></li>
              <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Ethics Guide</button></li>
              <li><button onClick={() => openModal('counselors')} className="hover:text-blue-600 transition-colors">For Counselors</button></li>
            </ul>
          </div>
          <div>
            <h6 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-[11px]">Legal</h6>
            <ul className="space-y-5 text-sm font-bold text-slate-500">
              <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => openModal('terms')} className="hover:text-blue-600 transition-colors">Terms of Use</button></li>
            </ul>
          </div>
          <div>
            <h6 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-[11px]">Contact Info</h6>
            <ul className="space-y-5">
              <li>
                <a href="mailto:authentiwrite@gmail.com" className="group flex items-center justify-center md:justify-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                    <i className="fa-solid fa-envelope text-slate-400 group-hover:text-white transition-colors"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email Us</p>
                    <p className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">authentiwrite@gmail.com</p>
                  </div>
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <i className="fa-solid fa-clock text-slate-400"></i>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Response Time</p>
                  <p className="text-sm font-bold text-slate-600">Typically &lt; 24 hours</p>
                </div>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <i className="fa-solid fa-location-dot text-slate-400"></i>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Location</p>
                  <p className="text-sm font-bold text-slate-600">Global Remote Studio</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} AuthentiWrite AI Studio</p>
           <p className="text-[10px] text-slate-400 italic">Built for the next generation of authentic voices.</p>
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={activeModal === 'how'} onClose={() => setActiveModal(null)} title="The Science of Authenticity">
        <div className="space-y-8">
          <section>
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">Linguistic Entropy</h3>
            <p>Our engine calculates the unpredictability of your prose. Humans have high "burstiness"—variations in complexity—whereas AI outputs tend to be uniformly balanced.</p>
          </section>
          <section>
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">Type-Token Ratio</h3>
            <p>We analyze the richness of your vocabulary. We look for specific, unique word choices that correlate with personal, lived experiences rather than general probability.</p>
          </section>
          <section>
            <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">Statistical Accuracy</h3>
            <p>A minimum of 200 words is required because linguistic signatures only become statistically significant after a certain volume of text. Shorter snippets are easily mimicked.</p>
          </section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Privacy & Integrity">
        <div className="bg-blue-600 p-8 rounded-3xl text-white mb-8 shadow-2xl shadow-blue-200">
          <p className="font-black text-lg mb-2 leading-tight">Your writing remains yours.</p>
          <p className="opacity-90 font-medium">We do not store, share, or use your essays for training. Every analysis is fresh and transient.</p>
        </div>
        <div className="space-y-4 text-slate-600">
          <p>AuthentiWrite is an educational tool, not a punitive one. We believe every student deserves to have their true voice heard by admissions committees, free from the homogenizing effects of synthetic tools.</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'counselors'} onClose={() => setActiveModal(null)} title="Admissions & Counselors">
        <p className="leading-relaxed">AuthentiWrite serves as a collaborative mirror for the writing process. Counselors use our reports to initiate healthy discussions about voice, helping students understand when they've "over-edited" the heart out of their story.</p>
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
