'use client';

import { useState, useRef, useEffect } from 'react';

const GLOSSARY: Record<string, { en: string; ur: string; desc: string }> = {
  'PPC': { en: 'Pakistan Penal Code', ur: 'مجموعہ تعزیرات پاکستان', desc: 'The main criminal code of Pakistan, defining offenses and prescribing punishments' },
  'CrPC': { en: 'Code of Criminal Procedure', ur: 'ضابطہ فوجداری', desc: 'Procedural law for administration of substantive criminal law in Pakistan' },
  'PLD': { en: 'Pakistan Legal Decisions', ur: 'پاکستان لیگل ڈیسیژنز', desc: 'Premier law report containing judgments from superior courts of Pakistan' },
  'SCMR': { en: 'Supreme Court Monthly Review', ur: 'سپریم کورٹ ماہانہ جائزہ', desc: 'Monthly compilation of Supreme Court of Pakistan judgments' },
  'CLC': { en: 'Civil Law Cases', ur: 'سول لا کیسز', desc: 'Report of civil law cases from courts across Pakistan' },
  'FIR': { en: 'First Information Report', ur: 'ایف آئی آر', desc: 'Written document prepared by police upon receiving information about a cognizable offense' },
  'Bail': { en: 'Bail / Release', ur: 'ضمانت', desc: 'Provisional release of an accused person awaiting trial, with conditions' },
  'Khula': { en: 'Wife-initiated Divorce', ur: 'خلع', desc: 'Dissolution of marriage at the instance of the wife under Islamic law' },
  'Talaq': { en: 'Divorce', ur: 'طلاق', desc: 'Dissolution of marriage, typically initiated by the husband under Islamic law' },
  'Writ': { en: 'Writ Petition', ur: 'رٹ پٹیشن', desc: 'A formal written order issued by a court commanding someone to do or stop doing something' },
  'Habeas Corpus': { en: 'Produce the Body', ur: 'حاضر کرو', desc: 'A writ requiring a person under arrest to be brought before a judge' },
  'Qisas': { en: 'Retribution', ur: 'قصاص', desc: 'Punishment equal to the offense in Islamic criminal law' },
  'Diyat': { en: 'Blood Money', ur: 'دیت', desc: 'Compensation paid to the victim or heirs of the victim in Islamic law' },
  'Nikah': { en: 'Marriage Contract', ur: 'نکاح', desc: 'Islamic marriage contract between two parties' },
  'Mehr': { en: 'Dower', ur: 'مہر', desc: 'Amount or property paid by the groom to the bride in Islamic marriage' },
  'Iddat': { en: 'Waiting Period', ur: 'عدت', desc: 'Period a woman must observe after divorce or death of husband before remarrying' },
  'Vakalatnama': { en: 'Power of Attorney', ur: 'وکالت نامہ', desc: 'Document authorizing a lawyer to appear and plead on behalf of a party' },
  'Section 302': { en: 'Murder', ur: 'قتل عمد', desc: 'Section 302 PPC: Punishment for murder (Qatl-i-amd) — death or life imprisonment' },
  'Section 376': { en: 'Rape', ur: 'زنا بالجبر', desc: 'Section 376 PPC: Punishment for rape — death or imprisonment 10-25 years' },
  'Section 420': { en: 'Cheating', ur: 'دھوکہ دہی', desc: 'Section 420 PPC: Cheating and dishonestly inducing delivery of property' },
  'PECA': { en: 'Prevention of Electronic Crimes Act', ur: 'الیکٹرانک جرائم ایکٹ', desc: 'Pakistani law addressing cybercrime and electronic offenses (2016)' },
};

interface GlossaryPopoverProps {
  term: string;
  children: React.ReactNode;
}

export function GlossaryPopover({ term, children }: GlossaryPopoverProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const entry = GLOSSARY[term];

  if (!entry) return <>{children}</>;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="cursor-help border-b border-dotted border-brass-400/40 hover:border-brass-400 transition-colors">
        {children}
      </span>
      {show && (
        <div
          ref={ref}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 glass-strong rounded-xl animate-fade-in shadow-verdict"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="font-bold text-brass-300 text-sm">{term}</span>
            <span className="text-xs text-gray-500 font-urdu" dir="rtl">{entry.ur}</span>
          </div>
          <p className="text-xs text-brass-200 font-medium mb-1">{entry.en}</p>
          <p className="text-xs text-gray-400 leading-relaxed">{entry.desc}</p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white/[0.08] rotate-45 border-r border-b border-white/[0.12]" />
        </div>
      )}
    </span>
  );
}

export function LegalGlossaryPanel() {
  const [search, setSearch] = useState('');
  const terms = Object.entries(GLOSSARY).filter(([key, val]) =>
    !search || key.toLowerCase().includes(search.toLowerCase()) || val.en.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-strong p-6 rounded-2xl">
      <h3 className="text-lg font-display font-bold text-brass-300 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        Legal Glossary
      </h3>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search legal terms..."
        className="input-field mb-4 !py-2.5 text-sm"
      />
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {terms.map(([key, val]) => (
          <div key={key} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.04] hover:border-brass-400/20 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-brass-300">{key}</span>
              <span className="text-[10px] text-gray-500 font-urdu" dir="rtl">{val.ur}</span>
            </div>
            <p className="text-xs text-gray-400">{val.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
