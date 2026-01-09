
import React, { useState, useCallback } from 'react';
import { analyzeEssay } from './services/geminiService';
import { AppState, AuthenticityLabel } from './types';
import { APP_CONFIG } from './constants';
import Gauge from './components/Gauge';
import MetricCard from './components/MetricCard';
import Heatmap from './components/Heatmap';
import ExplainabilityPanel from './components/ExplainabilityPanel';
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

  const handleReset = () => {
    setState({
      essay: '',
      isAnalyzing: false,
      result: null,
      error: null,
    });
    setIsMenuOpen(false);
  };

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-feather-pointed text-sm sm:text-base"></i>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 truncate max-w-[150px] sm:max-w-none">
              AuthentiWrite AI
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => openModal('how')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it Works</button>
            <button onClick={() => openModal('privacy')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Privacy Ethics</button>
            <button onClick={() => openModal('counselors')} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">Counselor Access</button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 py-4 px-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
            <button onClick={() => openModal('how')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-600">How it Works</button>
            <button onClick={() => openModal('privacy')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-600">Privacy Ethics</button>
            <button onClick={() => openModal('counselors')} className="text-left py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">Counselor Access</button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12">
        {!state.result && !state.isAnalyzing ? (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6 tracking-tight leading-tight">
                Evaluate Your Unique <br className="hidden sm:block" /> Writing Voice
              </h1>
              <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Paste your personal statement below to analyze authenticity, specificity, and tone. 
                Our AI highlights areas for reflection, helping you sound more like <strong>you</strong>.
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <div className="p-4 sm:p-8">
                <textarea
                  className="w-full h-64 sm:h-96 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-slate-800 leading-relaxed text-sm sm:text-base"
                  placeholder="Paste your personal statement here (minimum 200 characters)..."
                  value={state.essay}
                  onChange={(e) => setState(prev => ({ ...prev, essay: e.target.value, error: null }))}
                />
                
                <div className="mt-3 flex justify-end gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className={state.essay.length < APP_CONFIG.MIN_ESSAY_LENGTH ? 'text-rose-400' : 'text-emerald-500'}>
                    {state.essay.length} Characters
                  </span>
                  <span>{wordCount} Words</span>
                </div>

                {state.error && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs sm:text-sm flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {state.error}
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] sm:text-xs">
                    <i className="fa-solid fa-lock"></i>
                    <span>Analyses are session-only. Data is never stored permanently.</span>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={!state.essay || state.essay.length < APP_CONFIG.MIN_ESSAY_LENGTH}
                    className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                  >
                    Analyze Authenticity
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-heart-pulse"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Voice Detection</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Identifies personal anecdotes and human phrasing.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Anti-Polish Audit</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Flags generic admissions buzzwords and cliches.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-scale-balanced"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Ethics First</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Focuses on self-reflection, not punishment.</p>
              </div>
            </div>
          </div>
        ) : state.isAnalyzing ? (
          <div className="max-w-2xl mx-auto py-16 sm:py-24 text-center animate-pulse">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Analyzing Your Narrative...</h2>
            <p className="text-sm sm:text-base text-slate-500">Our AI is mapping linguistic patterns and looking for personal detail density.</p>
            <div className="mt-10 space-y-3 max-w-sm mx-auto">
              <div className="h-2 bg-slate-200 rounded-full w-full"></div>
              <div className="h-2 bg-slate-200 rounded-full w-3/4 mx-auto"></div>
              <div className="h-2 bg-slate-200 rounded-full w-5/6 mx-auto"></div>
            </div>
          </div>
        ) : state.result && (
          <div className="space-y-10 sm:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-stretch sm:items-start">
              <div className="lg:w-1/3 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center">
                <Gauge score={state.result.overallScore} label={state.result.label} confidence={state.result.confidence} />
                <div className="mt-8 w-full space-y-3">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>CONFIDENCE LEVEL</span>
                    <span>{Math.round(state.result.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${state.result.confidence * 100}%` }}></div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl w-full border border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Analysis Summary</h4>
                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    "{state.result.generalFeedback}"
                  </p>
                </div>
              </div>

              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard 
                  label="Linguistic Voice" 
                  value={state.result.metrics.voice} 
                  icon="fa-solid fa-microphone-lines"
                  description="Human phrasing variability and narrative flow vs machine-like consistency."
                />
                <MetricCard 
                  label="Personal Specificity" 
                  value={state.result.metrics.specificity} 
                  icon="fa-solid fa-location-dot"
                  description="Presence of sensory details, names, dates, and unique personal contexts."
                />
                <MetricCard 
                  label="Structural Originality" 
                  value={state.result.metrics.originality} 
                  icon="fa-solid fa-dna"
                  description="How much the logic deviates from generic essay templates."
                />
                <MetricCard 
                  label="Tone Authenticity" 
                  value={state.result.metrics.toneBalance} 
                  icon="fa-solid fa-masks-theater"
                  description="Balance between academic formality and sincere personal expression."
                />
                
                <div className="sm:col-span-2 bg-emerald-50 border border-emerald-100 p-5 sm:p-6 rounded-2xl">
                  <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-star"></i>
                    Identified Strengths
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {state.result.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                        <i className="fa-solid fa-check mt-1 text-[10px]"></i>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Explainability Panel */}
            <ExplainabilityPanel data={state.result.explainability} metrics={state.result.metrics} />

            {/* Heatmap Area */}
            <Heatmap segments={state.result.segments} />

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 sm:py-12 border-t border-slate-200">
              <div className="max-w-md text-center sm:text-left">
                <h5 className="font-bold text-slate-800 text-lg mb-1">What's Next?</h5>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Focus on the 'Over-Polished' sections. Instead of using the AI to rewrite them, 
                  try answering the reflection questions provided in your own voice.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-print"></i>
                  Save Report
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <i className="fa-solid fa-feather-pointed text-xs"></i>
              </div>
              <span className="text-xl font-bold text-slate-900">AuthentiWrite AI</span>
            </div>
            <p className="text-sm sm:text-base text-slate-500 max-w-sm mb-6 leading-relaxed">
              Empowering students to find their true voice in a world of AI. 
              Built on the principles of integrity, self-discovery, and ethical technology use.
            </p>
            <div className="flex gap-5 text-slate-400">
              <a href="#" className="hover:text-blue-600 transition-colors"><i className="fa-brands fa-github text-2xl"></i></a>
              <a href="#" className="hover:text-blue-600 transition-colors"><i className="fa-brands fa-twitter text-2xl"></i></a>
              <a href="#" className="hover:text-blue-600 transition-colors"><i className="fa-brands fa-linkedin text-2xl"></i></a>
            </div>
          </div>
          <div>
            <h6 className="font-bold text-slate-800 mb-5 uppercase tracking-wider text-xs">Resources</h6>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><button onClick={() => openModal('how')} className="hover:text-blue-600 transition-colors">Writing Guides</button></li>
              <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Ethics Toolkit</button></li>
              <li><button onClick={() => openModal('counselors')} className="hover:text-blue-600 transition-colors">For Counselors</button></li>
              <li><button onClick={() => openModal('research')} className="hover:text-blue-600 transition-colors">Research Paper</button></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-slate-800 mb-5 uppercase tracking-wider text-xs">Integrity</h6>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => openModal('terms')} className="hover:text-blue-600 transition-colors">Terms of Use</button></li>
              <li><button onClick={() => openModal('privacy')} className="hover:text-blue-600 transition-colors">How we Handle Data</button></li>
              <li><button onClick={() => openModal('how')} className="hover:text-blue-600 transition-colors">AI Safety</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400 italic text-center md:text-left leading-relaxed max-w-md">
            Disclaimer: AI authenticity detection is probabilistic and should be used as a reflective tool, not a definitive verdict.
          </p>
          <p className="text-xs font-medium text-slate-400">
            &copy; {new Date().getFullYear()} AuthentiWrite AI.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'how'} 
        onClose={() => setActiveModal(null)} 
        title="How it Works & AI Safety"
      >
        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-slate-800 mb-2">1. Linguistic Mapping</h3>
            <p>Our engine analyzes the "entropy" of your writing. Human thought often presents unique, unpredictable sentence structures and word choices that reflect deep personal experiences. AI tends to favor "high probability" tokens, leading to overly balanced or generic phrasing.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">2. Personal Detail Density</h3>
            <p>AuthentiWrite looks for "Temporal Markers" (specific moments in time), "Sensory Details" (smell, sound, touch), and "Idiosyncratic Phrasing" that are hallmark traits of genuine human storytelling.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">3. Over-Polish Audit</h3>
            <p>We flag sections that feel "homogenized"—writing that has been cleaned up so much it has lost its original character. This includes overuse of admissions buzzwords or abstract generalizations without concrete examples.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">4. AI Safety & Ethics</h3>
            <p>We prioritize "Self-Awareness" over "Surveillance". Our goal is to help you see where your writing might be losing its human touch due to over-reliance on external tools, ensuring you maintain full creative agency.</p>
          </section>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
        title="Privacy, Ethics & Data Handling"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
            <p className="text-blue-700 text-sm font-medium">AuthentiWrite AI is an ethics-first system. Our mission is to protect human voice, not to monitor or punish students.</p>
          </div>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Data Privacy & Handling</h3>
            <p>Your essays are analyzed in real-time and are never stored permanently on our servers. We do not use your personal writing to train AI models. Once you refresh your session, your text is gone. We do not track personal identifying information alongside your writing.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Probabilistic Nature</h3>
            <p>AI detection is not an exact science. Our scores are probabilistic and include confidence ranges. A score of 80% with a ±5% range means the model is quite certain, but we always emphasize that the student is the ultimate authority on their own voice.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Agency & Integrity</h3>
            <p>We believe writing is a process of self-discovery. This tool is designed to help students identify when they are letting "the machine" do the thinking for them, empowering them to reclaim their unique perspective.</p>
          </section>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'counselors'} 
        onClose={() => setActiveModal(null)} 
        title="For Counselors & Educators"
      >
        <div className="space-y-6">
          <p className="text-slate-600">Counselors play a vital role in guiding students toward ethical writing practices. Use AuthentiWrite as a collaborative tool:</p>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Guided Revision</h3>
            <p>Instead of viewing a low authenticity score as a "red flag," use it as a starting point for a conversation about voice. Ask the student: "Which parts of this essay feel the most like you?"</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Identifying 'AI-Polishing'</h3>
            <p>AI often strips away the "beautiful imperfections" that make a student's essay stand out. Help students see that admissions officers value sincere reflection over robotic perfection.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Educational Integrity</h3>
            <p>Focus on the 'why' behind the feedback. Encourage students to explore the reflection prompts to build their descriptive writing skills.</p>
          </section>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'research'} 
        onClose={() => setActiveModal(null)} 
        title="Linguistic Research & Methodology"
      >
        <div className="space-y-6 text-sm">
          <p>AuthentiWrite AI is based on emerging research in "Linguistic Forensics" and "Statistical NLP".</p>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Burstiness & Perplexity</h3>
            <p>Human writing typically exhibits high "burstiness"—variability in sentence length and structure—and higher perplexity (unpredictability). Generative models are optimized for fluency, often resulting in lower burstiness and more uniform sentence patterns.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Lexical Diversity</h3>
            <p>We measure the Type-Token Ratio (TTR) and the use of low-frequency vocabulary. Humans use idioms, personal slang, and emotional nuances that AI often averages out.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-800 mb-2">Admissions Bias Awareness</h3>
            <p>We actively work to mitigate bias against ESL (English as a Second Language) writers by focusing on narrative specificity rather than just grammatical "perfection."</p>
          </section>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'terms'} 
        onClose={() => setActiveModal(null)} 
        title="Terms of Use"
      >
        <div className="space-y-4 text-xs text-slate-500">
          <p>By using AuthentiWrite AI, you agree to the following:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Non-Commercial Use:</strong> This tool is provided free of charge for students and educators for personal and educational purposes.</li>
            <li><strong>No Guarantee:</strong> Scores are estimates based on linguistic models. We are not responsible for admissions outcomes or school disciplinary actions.</li>
            <li><strong>No Misuse:</strong> This tool should not be used to "game" AI detectors. Its purpose is to foster human voice and self-reflection.</li>
            <li><strong>Input Ownership:</strong> You retain all rights to your writing. We do not claim ownership of any text submitted for analysis.</li>
            <li><strong>Service Limits:</strong> We reserve the right to limit access to ensure stability for all users.</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default App;
