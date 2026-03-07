'use client';

import { useState, useEffect } from 'react';

const TOUR_KEY = 'tvl_onboarding_done';

const STEPS = [
  {
    title: 'Welcome to TVL',
    desc: 'The Value of Law — Pakistan\'s most comprehensive AI-powered legal research platform.',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    title: 'Search in Any Language',
    desc: 'Type your legal scenario in English, Urdu, or Roman Urdu. Our AI understands all three seamlessly.',
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  },
  {
    title: 'AI-Powered Analysis',
    desc: 'Get comprehensive legal analysis with relevant case laws, statute references, and precedent citations.',
    icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5',
  },
  {
    title: 'Bookmark & Export',
    desc: 'Save important cases, add notes, export to PDF, and share with colleagues. Use Ctrl+K for quick navigation.',
    icon: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
  },
];

export function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  if (!show) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" onClick={dismiss}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md mx-4 court-panel p-8 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={dismiss} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-16 h-16 rounded-2xl bg-brass-400/10 border border-brass-400/20 flex items-center justify-center text-brass-400 mb-6 mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={current.icon} />
          </svg>
        </div>

        <h2 className="text-xl font-display font-bold text-white text-center mb-3">{current.title}</h2>
        <p className="text-gray-400 text-center text-sm leading-relaxed mb-8">{current.desc}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-brass-400 w-6' : 'bg-white/10'}`} />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={dismiss} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Skip</button>
            <button onClick={next} className="btn-primary !py-2 !px-6 text-sm">
              {step < STEPS.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
