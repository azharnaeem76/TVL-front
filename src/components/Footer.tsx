'use client';

import Logo from '@/components/Logo';

export default function Footer() {
  return (
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
  );
}
