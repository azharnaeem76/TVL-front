'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import FloatingSymbols from '@/components/FloatingSymbols';
import { ScalesOfJustice, GavelSVG, CourtPillars, CourtBanner } from '@/components/CourtElements';
import GavelStrike from '@/components/GavelStrike';
import VoiceSearch from '@/components/VoiceSearch';

const EXAMPLE_QUERIES = [
  { lang: 'English', text: 'What are the grounds for divorce in Pakistan?', icon: 'EN' },
  { lang: 'Roman Urdu', text: 'Mujhe talaq ka qanoon batao Pakistan mein', icon: 'RU' },
  { lang: 'Urdu', text: 'پاکستان میں طلاق کے قانون کیا ہیں؟', icon: 'UR' },
  { lang: 'English', text: 'How to get bail in a criminal case?', icon: 'EN' },
  { lang: 'Roman Urdu', text: 'Zameen ka intiqal kaise hota hai?', icon: 'RU' },
  { lang: 'English', text: 'Tenant eviction rights under rent laws', icon: 'EN' },
];

const STATS = [
  { value: '15,000+', label: 'Case Laws', icon: '⚖' },
  { value: '50+', label: 'Statutes', icon: '§' },
  { value: '3', label: 'Languages', icon: '¶' },
  { value: '100%', label: 'Free & Private', icon: '☆' },
];

const FEATURES = [
  {
    title: 'Multilingual Intelligence',
    desc: 'Type in English, Urdu script, or Roman Urdu — our AI detects and understands Pakistani legal terminology seamlessly.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    title: 'Case Law Citations',
    desc: 'Access judgments from the Supreme Court, all five High Courts, and Federal Shariat Court. Full PLD, SCMR, and CLC citations with summaries and headnotes.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'AI Legal Analysis',
    desc: 'Powered by local AI — your data never leaves the server. Get legal analysis with statute references, procedural guidance, and precedent citations.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" />
      </svg>
    ),
  },
  {
    title: 'Voice Command',
    desc: 'Speak your legal query directly — the system transcribes and processes your words, then responds with relevant citations and analysis.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Describe Your Scenario', desc: 'Type or speak your legal question in any language — English, Urdu, or Roman Urdu', gavel: true },
  { step: '02', title: 'AI Analyzes', desc: 'AI detects language, normalizes legal terms, and performs semantic search across all precedents', gavel: false },
  { step: '03', title: 'Results Delivered', desc: 'Receive relevant case laws, statute references, and comprehensive legal analysis', gavel: false },
];

const COURTS = [
  'Supreme Court of Pakistan',
  'Lahore High Court',
  'Sindh High Court',
  'Peshawar High Court',
  'Balochistan High Court',
  'Islamabad High Court',
  'Federal Shariat Court',
];

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [gavelTrigger, setGavelTrigger] = useState(false);
  const router = useRouter();

  // Typewriter
  const [typedText, setTypedText] = useState('');
  const [typeIndex, setTypeIndex] = useState(0);
  const phrases = [
    'What are the grounds for bail?',
    'Khula ka tareeqa kya hai?',
    'Section 302 PPC ki saza kya hai?',
    'How to file a writ petition?',
  ];

  useEffect(() => {
    const phrase = phrases[typeIndex % phrases.length];
    let charIndex = 0;
    let deleting = false;
    let timeout: NodeJS.Timeout;
    const tick = () => {
      if (!deleting) {
        setTypedText(phrase.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === phrase.length) { timeout = setTimeout(() => { deleting = true; tick(); }, 2500); return; }
        timeout = setTimeout(tick, 60);
      } else {
        setTypedText(phrase.slice(0, charIndex));
        charIndex--;
        if (charIndex === 0) { setTypeIndex(prev => prev + 1); return; }
        timeout = setTimeout(tick, 30);
      }
    };
    tick();
    return () => clearTimeout(timeout);
  }, [typeIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setGavelTrigger(true);
      setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }, 800);
    }
  };

  const statsSection = useInView();
  const featuresSection = useInView();
  const howSection = useInView();
  const courtsSection = useInView();

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <GavelStrike trigger={gavelTrigger} onComplete={() => setGavelTrigger(false)} />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <FloatingSymbols count={15} />
        <CourtPillars />
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="orb-gold w-[600px] h-[600px] -top-40 -left-40 animate-float opacity-20" />
        <div className="orb-accent w-[500px] h-[500px] top-20 -right-40 animate-float-delayed opacity-15" />
        <div className="orb-gold w-[400px] h-[400px] bottom-20 left-1/3 animate-float-slow opacity-10" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Scales animation */}
          <div className="animate-fade-in mb-6">
            <ScalesOfJustice size={70} className="mx-auto animate-scales-tip opacity-60" />
          </div>

          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brass-400/10 border border-brass-400/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-brass-400 animate-pulse-soft" />
            <span className="text-sm text-brass-300 font-medium tracking-wide">According to Spirit Of Law</span>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up text-5xl md:text-7xl lg:text-8xl font-display font-black text-white mb-4 leading-[0.95] tracking-tight">
            The Value
            <br />
            <span className="text-gradient-justice">of Law</span>
          </h1>

          <p className="animate-slide-up-delayed opacity-0 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-2 leading-relaxed">
            Pakistan&apos;s most comprehensive legal research platform. Search in{' '}
            <span className="text-brass-300 font-semibold">English</span>,{' '}
            <span className="text-brass-300 font-semibold font-urdu">اردو</span>, or{' '}
            <span className="text-brass-300 font-semibold">Roman Urdu</span>
          </p>
          <p className="animate-fade-in-delayed opacity-0 text-sm text-gray-600 italic font-serif">
            &ldquo;Justice is the firmest pillar of good government&rdquo;
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="animate-scale-in opacity-0 max-w-3xl mx-auto mt-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brass-500/20 via-gold-500/15 to-brass-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative court-panel !rounded-2xl p-2">
                <div className="flex items-center gap-2">
                  <GavelSVG size={32} className="hidden sm:block ml-3 opacity-40" />
                  <div className="flex-1 relative">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-4 bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
                    />
                    {!query && (
                      <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                        <span className="text-gray-500 text-lg">{typedText}</span>
                        <span className="w-0.5 h-6 bg-brass-400 ml-0.5 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <VoiceSearch onResult={(text) => setQuery(text)} />
                  <button type="submit" className="btn-gavel !rounded-xl !py-3.5 !px-8 text-base whitespace-nowrap">
                    Search Now
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Example queries */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.slice(0, 4).map((ex, i) => (
              <button
                key={i}
                onClick={() => router.push(`/search?q=${encodeURIComponent(ex.text)}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-brass-400/10 text-sm text-gray-400 hover:text-brass-300 hover:bg-brass-400/5 hover:border-brass-400/25 transition-all duration-300"
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  ex.icon === 'EN' ? 'bg-primary-500/20 text-primary-300' :
                  ex.icon === 'UR' ? 'bg-brass-500/20 text-brass-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>{ex.icon}</span>
                <span className={ex.lang === 'Urdu' ? 'font-urdu' : ''}>{ex.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-brass-400/40 uppercase tracking-widest font-serif">Explore</span>
          <svg className="w-4 h-4 text-brass-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section ref={statsSection.ref} className="relative py-20 overflow-hidden">
        <div className="divider-ornate" />
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={`text-center transition-all duration-700 ${statsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="text-2xl mb-2 opacity-30">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-display font-black text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="divider-ornate" />
      </section>

      {/* ===== FEATURES ===== */}
      <section ref={featuresSection.ref} className="section-court">
        <CourtPillars />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <CourtBanner text="Features" className="mb-6" />
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Powerful Legal Tools
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Everything a legal professional needs for fast, accurate research across Pakistani law.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`card-court p-5 sm:p-8 transition-all duration-700 ${featuresSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-brass-400/10 border border-brass-400/20 flex items-center justify-center text-brass-400 mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section ref={howSection.ref} className="section-dark">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <CourtBanner text="How It Works" className="mb-6" />
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Three Simple Steps
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              From describing your scenario to getting results — fast and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-brass-500/30 via-gold-500/20 to-brass-500/30" />

            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={i}
                className={`relative text-center transition-all duration-700 ${howSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 250}ms` }}
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl court-panel mb-6">
                  <span className="text-2xl font-display font-black text-gradient">{item.step}</span>
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COURTS COVERED ===== */}
      <section ref={courtsSection.ref} className="section-court">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <CourtBanner text="Jurisdiction" className="mb-6" />
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              All Courts. One Platform.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Judgments from every superior court in Pakistan at your fingertips.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {COURTS.map((court, i) => (
              <div
                key={i}
                className={`card-court !p-4 !rounded-xl text-center transition-all duration-700 ${courtsSection.inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-brass-400 mb-1">
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 font-medium">{court}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="court-panel p-12 md:p-16 relative overflow-hidden">
            <div className="orb-gold w-[300px] h-[300px] -top-20 -right-20 opacity-15" />
            <div className="orb-accent w-[200px] h-[200px] -bottom-10 -left-10 opacity-10" />
            <div className="relative z-10">
              <GavelSVG size={50} className="mx-auto mb-6 opacity-40" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Start Your Legal Research
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                Join thousands of legal professionals using TVL for faster, smarter legal research. Completely free. Completely private.
              </p>
              <p className="text-brass-400/60 italic font-serif text-sm mb-8">
                &ldquo;According to Spirit Of Law&rdquo;
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/search" className="btn-gavel text-lg !py-4 !px-10">
                  Search Case Laws
                </a>
                <a href="/login" className="btn-outline text-lg !py-4 !px-10">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-brass-400/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Logo size={32} />
                <div>
                  <span className="font-display font-bold text-white text-lg">TVL</span>
                  <span className="text-[10px] text-brass-400/60 block -mt-0.5 tracking-widest uppercase">The Value of Law</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-3">
                AI-powered legal research platform for Pakistani law. Search case laws, get AI analysis, and find relevant citations — all in your preferred language.
              </p>
              <p className="text-brass-400/40 italic text-xs font-serif">&ldquo;According to Spirit Of Law&rdquo;</p>
            </div>
            <div>
              <h4 className="text-brass-300 font-display font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <div className="space-y-3">
                <a href="/search" className="block text-gray-400 hover:text-brass-300 text-sm transition-colors">Scenario Search</a>
                <a href="/case-laws" className="block text-gray-400 hover:text-brass-300 text-sm transition-colors">Case Laws</a>
                <a href="/chat" className="block text-gray-400 hover:text-brass-300 text-sm transition-colors">AI Chat</a>
                <a href="/login" className="block text-gray-400 hover:text-brass-300 text-sm transition-colors">Sign In</a>
              </div>
            </div>
            <div>
              <h4 className="text-brass-300 font-display font-semibold mb-4 text-sm uppercase tracking-wider">Jurisdiction</h4>
              <div className="space-y-3">
                <span className="block text-gray-500 text-sm">Criminal Law</span>
                <span className="block text-gray-500 text-sm">Family Law</span>
                <span className="block text-gray-500 text-sm">Constitutional Law</span>
                <span className="block text-gray-500 text-sm">Property & Land</span>
                <span className="block text-gray-500 text-sm">Cyber Crime</span>
              </div>
            </div>
          </div>
          <div className="divider-ornate mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p>2024 TVL — The Value of Law. All rights reserved.</p>
            <p className="mt-2 md:mt-0 italic font-serif text-brass-400/30">According to Spirit Of Law</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
