
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

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    essay: '',
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = state.essay.trim() === '' ? 0 : state.essay.trim().split(/\s+/).length;

  const handleAnalyze = async () => {
    if (!state.essay.trim() || state.essay.length < APP_CONFIG.MIN_ESSAY_LENGTH) {
      setState(prev => ({ ...prev, error: `Essay must be at least ${APP_CONFIG.MIN_ESSAY_LENGTH} characters.` }));
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/plain', 'text/markdown', '']; 
    const fileName = file.name.toLowerCase();
    const isValidExtension = fileName.endsWith('.txt') || fileName.endsWith('.md');

    if (!validTypes.includes(file.type) && !isValidExtension) {
      setState(prev => ({ ...prev, error: "Please upload a valid .txt or .md file." }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setState(prev => ({ ...prev, error: "File is too large. Please upload a file smaller than 2MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setState(prev => ({ ...prev, essay: content, error: null }));
    };
    reader.onerror = () => {
      setState(prev => ({ ...prev, error: "Failed to read file. Please try again." }));
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
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
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
            <button onClick={() => openModal('how')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">How it Works</button>
            <button onClick={() => openModal('privacy')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Privacy Ethics</button>
            <button onClick={() => openModal('counselors')} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200/50">Counselor Access</button>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-slate-100 ${isMenuOpen ? 'max-h-64' : 'max-h-0'}`}>
          <div className="px-4 py-4 flex flex-col gap-1">
            <button onClick={() => openModal('how')} className="text-left py-3 px-4 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">How it Works</button>
            <button onClick={() => openModal('privacy')} className="text-left py-3 px-4 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">Privacy Ethics</button>
            <button onClick={() => openModal('counselors')} className="text-left py-3 px-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold mt-2">Counselor Access</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12">
        {!state.result && !state.isAnalyzing ? (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 sm:mb-6 tracking-tight leading-[1.15]">
                Evaluate Your Unique <br className="hidden sm:block" /> Writing Voice
              </h1>
              <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Paste your personal statement below to analyze authenticity, specificity, and tone. 
                Our AI highlights areas for reflection, helping you sound more like <strong>you</strong>.
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <div className="p-4 sm:p-10">
                <textarea
                  className="w-full h-64 sm:h-96 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-slate-800 leading-relaxed text-sm sm:text-base bg-slate-50/50 focus:bg-white"
                  placeholder="Paste your personal statement here (minimum 200 characters)..."
                  value={state.essay}
                  onChange={(e) => setState(prev => ({ ...prev, essay: e.target.value, error: null }))}
                />
                
                <div className="mt-4 flex justify-end gap-3 sm:gap-4 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                  <span className={state.essay.length < APP_CONFIG.MIN_ESSAY_LENGTH ? 'text-rose-500' : 'text-emerald-500'}>
                    {state.essay.length} Characters
                  </span>
                  <span>{wordCount} Words</span>
                </div>

                {state.error && (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs sm:text-sm flex items-start gap-3 animate-in shake duration-300">
                    <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                    <span className="font-semibold">{state.error}</span>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2.5 text-slate-400 text-[10px] sm:text-xs font-medium">
                    <i className="fa-solid fa-shield-halved text-blue-500/50"></i>
                    <span>Analyses are session-only. Privacy first.</span>
                  </div>
                  
                  <div className="flex items-stretch gap-3 w-full sm:w-auto">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".txt,.md"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-none px-5 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <i className="fa-solid fa-paperclip"></i>
                      Upload
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={!state.essay || state.essay.length < APP_CONFIG.MIN_ESSAY_LENGTH}
                      className="flex-[2] sm:flex-none px-8 sm:px-12 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl sm:rounded-2xl font-bold text-base shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Icons ... */}
            <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 text-center pb-12">
              {/* Voice Detection */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <i className="fa-solid fa-heart-pulse text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Voice Detection</h4>
                <p className="text-sm text-slate-500 leading-relaxed px-4">Identifies personal anecdotes and human phrasing patterns.</p>
              </div>
              {/* Anti-Polish */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Anti-Polish Audit</h4>
                <p className="text-sm text-slate-500 leading-relaxed px-4">Flags generic admissions buzzwords and robotic structures.</p>
              </div>
              {/* Ethics */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <i className="fa-solid fa-scale-balanced text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Ethics First</h4>
                <p className="text-sm text-slate-500 leading-relaxed px-4">Designed for self-reflection, not for monitoring or punishment.</p>
              </div>
            </div>
          </div>
        ) : state.isAnalyzing ? (
          <div className="max-w-2xl mx-auto py-20 sm:py-32 text-center animate-in fade-in duration-500">
            {/* Loading state ... */}
            <div className="relative w-24 h-24 mx-auto mb-10">
              <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-feather-pointed text-blue-600 animate-pulse"></i>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Analyzing Your Narrative...</h2>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">Our AI is mapping linguistic patterns and calculating narrative specificity.</p>
            <div className="mt-12 space-y-4 max-w-xs mx-auto">
              <div className="h-2.5 bg-slate-200 rounded-full w-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-blue-500 w-1/3 animate-[loading_2s_infinite]"></div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full w-4/5 mx-auto"></div>
            </div>
          </div>
        ) : state.result && (
          <div className="space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
              <div className="lg:w-[350px] bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center">
                <Gauge 
                   score={state.result.overallScore} 
                   aiInfluence={state.result.aiInfluence} 
                   label={state.result.label} 
                   confidence={state.result.confidence} 
                />
                <div className="mt-10 w-full space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-tighter uppercase">
                    <span>CONFIDENCE INDEX</span>
                    <span>{Math.round(state.result.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${state.result.confidence * 100}%` }}></div>
                  </div>
                </div>
                <div className="mt-10 p-5 bg-slate-50 rounded-2xl w-full border border-slate-100 relative">
                  <div className="absolute -top-3 left-4 px-2 bg-white border border-slate-100 rounded text-[10px] font-bold text-slate-400">SUMMARY</div>
                  <p className="text-slate-700 text-sm leading-relaxed italic text-center">
                    "{state.result.generalFeedback}"
                  </p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <MetricCard 
                  label="Linguistic Voice" 
                  value={state.result.metrics.voice} 
                  icon="fa-solid fa-microphone-lines"
                  description="Evaluates unpredictability and natural phrasing variation."
                />
                <MetricCard 
                  label="Personal Specificity" 
                  value={state.result.metrics.specificity} 
                  icon="fa-solid fa-location-dot"
                  description="Measures sensory details and unique personal markers."
                />
                <MetricCard 
                  label="Structural Originality" 
                  value={state.result.metrics.originality} 
                  icon="fa-solid fa-dna"
                  description="How much the logic deviates from standardized templates."
                />
                <MetricCard 
                  label="Tone Authenticity" 
                  value={state.result.metrics.toneBalance} 
                  icon="fa-solid fa-masks-theater"
                  description="The balance between sincerity and academic formality."
                />
                
                <div className="sm:col-span-2 bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl shadow-sm">
                  <h4 className="text-sm font-black text-emerald-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <i className="fa-solid fa-circle-check"></i>
                    Voice Strengths
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.result.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-emerald-900/80 font-medium">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Ratings Section */}
            <RatingsSection ratings={state.result.ratings} />

            {/* Explainability Panel */}
            <ExplainabilityPanel data={state.result.explainability} metrics={state.result.metrics} />

            {/* Heatmap Area */}
            <Heatmap segments={state.result.segments} />

            {/* Bottom Actions ... */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-12 sm:py-16 border-t border-slate-200">
              <div className="max-w-md text-center sm:text-left">
                <h5 className="font-bold text-slate-900 text-xl mb-2">Reclaim Your Narrative</h5>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                  The 'Over-Polished' sections are opportunities. Answer the reflection prompts and apply the "Humanizing Fixes" to bring back the "beautiful imperfections" of your story.
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fa-solid fa-file-pdf"></i>
                  Save Report
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer ... */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <i className="fa-solid fa-feather-pointed text-xs"></i>
              </div>
              <span className="text-xl font-bold tracking-tight">AuthentiWrite AI</span>
            </div>
            <p className="text-sm sm:text-base text-slate-500 max-w-sm mb-8 leading-relaxed font-medium">
              We empower students to preserve their unique voice in a world increasingly dominated by synthetic content.
            </p>
            <div className="flex gap-6 text-slate-300">
              <a href="#" className="hover:text-blue-600 transition-colors"><i className="fa-brands fa-github text-2xl"></i></a>
              <a href="#" className="hover:text-blue-600 transition-colors"><i className="fa-brands fa-twitter text-2xl"></i></a>
              <a href="#" className="hover:text-blue-600 transition-colors"><i className="fa-brands fa-linkedin text-2xl"></i></a>
            </div>
          </div>
          <div>
            <h6 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Resources</h6>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><button onClick={() => openModal('how')} className="hover:text-blue-600 transition-colors">Writing Guides</button></li>
              <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Ethics Toolkit</button></li>
              <li><button onClick={() => openModal('counselors')} className="hover:text-blue-600 transition-colors">For Counselors</button></li>
              <li><button onClick={() => openModal('research')} className="hover:text-blue-600 transition-colors">Research Paper</button></li>
            </ul>
          </div>
          <div>
            <h6 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Integrity</h6>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => openModal('terms')} className="hover:text-blue-600 transition-colors">Terms of Use</button></li>
              <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Data Handling</button></li>
              <li><button onClick={() => openModal('how')} className="hover:text-blue-600 transition-colors">AI Safety</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400 italic text-center md:text-left leading-relaxed max-w-sm font-medium">
            AI authenticity detection is probabilistic and should be used as a reflective tool, not a definitive verdict.
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} AuthentiWrite AI.
          </p>
        </div>
      </footer>

      {/* Modals ... */}
      <Modal 
        isOpen={activeModal === 'how'} 
        onClose={() => setActiveModal(null)} 
        title="How it Works & AI Safety"
      >
        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-slate-800 mb-2">1. Linguistic Mapping</h3>
            <p className="text-sm sm:text-base">Our engine analyzes the "entropy" of your writing. Human thought often presents unique, unpredictable sentence structures and word choices that reflect deep personal experiences. AI tends to favor "high probability" tokens, leading to overly balanced or generic phrasing.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">2. Personal Detail Density</h3>
            <p className="text-sm sm:text-base">AuthentiWrite looks for "Temporal Markers" (specific moments in time), "Sensory Details" (smell, sound, touch), and "Idiosyncratic Phrasing" that are hallmark traits of genuine human storytelling.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">3. Over-Polish Audit</h3>
            <p className="text-sm sm:text-base">We flag sections that feel "homogenized"—writing that has been cleaned up so much it has lost its original character. This includes overuse of admissions buzzwords or abstract generalizations without concrete examples.</p>
          </section>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
        title="Privacy & Ethics"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <p className="text-blue-700 text-sm font-bold">AuthentiWrite AI is an ethics-first system. Our mission is to protect human voice, not to monitor or punish students.</p>
          </div>
          <section>
            <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Data Privacy</h3>
            <p className="text-sm sm:text-base">Your essays are analyzed in real-time and are never stored permanently. We do not use your personal writing to train AI models. Once you refresh your session, your text is gone.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Agency & Integrity</h3>
            <p className="text-sm sm:text-base">We believe writing is a process of self-discovery. This tool is designed to help students identify when they are letting "the machine" do the thinking for them, empowering them to reclaim their unique perspective.</p>
          </section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'counselors'} onClose={() => setActiveModal(null)} title="For Counselors"><p>Content for counselors...</p></Modal>
      <Modal isOpen={activeModal === 'research'} onClose={() => setActiveModal(null)} title="Research"><p>Methodology content...</p></Modal>
      <Modal isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)} title="Terms"><p>Terms content...</p></Modal>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default App;
