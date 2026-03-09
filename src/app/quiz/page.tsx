'use client';

import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { GavelSVG } from '@/components/CourtElements';
import { getStudyQuestions } from '@/lib/api';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QUESTIONS: Question[] = [
  // Constitutional
  { id: 1, question: 'Under which Article of the Constitution of Pakistan can a citizen file a Writ Petition in the High Court?', options: ['Article 184', 'Article 199', 'Article 185', 'Article 203'], correct: 1, explanation: 'Article 199 grants High Courts the power to issue writs including mandamus, certiorari, prohibition, quo warranto, and habeas corpus.', category: 'Constitutional', difficulty: 'easy' },
  { id: 2, question: 'Which Article of the Constitution guarantees the right to fair trial and due process?', options: ['Article 9', 'Article 10', 'Article 10A', 'Article 14'], correct: 2, explanation: 'Article 10A was inserted by the 18th Amendment and provides: "For the determination of his civil rights and obligations or in any criminal charge against him a person shall be entitled to a fair trial and due process."', category: 'Constitutional', difficulty: 'easy' },
  { id: 3, question: 'What is the minimum age requirement for the office of President of Pakistan?', options: ['35 years', '40 years', '45 years', '50 years'], correct: 2, explanation: 'Under Article 41(2) of the Constitution, a person is not qualified for election as President unless he is a Muslim of not less than forty-five years of age.', category: 'Constitutional', difficulty: 'medium' },
  { id: 4, question: 'Which Schedule of the Constitution deals with the Federal Legislative List?', options: ['Third Schedule', 'Fourth Schedule', 'Fifth Schedule', 'Sixth Schedule'], correct: 1, explanation: 'The Fourth Schedule contains the Federal Legislative List (Part I and Part II). After the 18th Amendment, the Concurrent Legislative List was abolished.', category: 'Constitutional', difficulty: 'hard' },

  // Criminal
  { id: 5, question: 'Under which Section of PPC is the punishment for murder (Qatl-e-Amd) defined?', options: ['Section 299', 'Section 300', 'Section 302', 'Section 304'], correct: 2, explanation: 'Section 302 PPC provides punishment for Qatl-e-Amd (intentional murder) which is death, life imprisonment, or imprisonment up to 25 years as Tazir.', category: 'Criminal', difficulty: 'easy' },
  { id: 6, question: 'What does Section 497 CrPC deal with?', options: ['Arrest without warrant', 'Bail in non-bailable offences', 'Search and seizure', 'Examination of witnesses'], correct: 1, explanation: 'Section 497 CrPC provides for bail in cases involving non-bailable offences. It gives the court discretion to grant bail if the accused is not guilty of an offence punishable with death or imprisonment for life.', category: 'Criminal', difficulty: 'easy' },
  { id: 7, question: 'Which Section of CrPC deals with Pre-Arrest Bail?', options: ['Section 496', 'Section 497', 'Section 498', 'Section 499'], correct: 2, explanation: 'Section 498 CrPC empowers the High Court and Sessions Court to grant bail to any person apprehending arrest (pre-arrest/anticipatory bail).', category: 'Criminal', difficulty: 'medium' },
  { id: 8, question: 'Section 489-F PPC deals with which offence?', options: ['Forgery', 'Cheque dishonour', 'Breach of trust', 'Criminal misappropriation'], correct: 1, explanation: 'Section 489-F PPC criminalizes dishonestly issuing a cheque which is subsequently dishonoured. It carries punishment of up to 3 years imprisonment, or fine, or both.', category: 'Criminal', difficulty: 'medium' },

  // Family
  { id: 9, question: 'Which law governs the dissolution of Muslim marriages in Pakistan?', options: ['Muslim Family Laws Ordinance, 1961', 'Dissolution of Muslim Marriages Act, 1939', 'Family Courts Act, 1964', 'Guardians and Wards Act, 1890'], correct: 1, explanation: 'The Dissolution of Muslim Marriages Act, 1939 provides grounds on which a Muslim wife can obtain dissolution of marriage (Khula or judicial divorce).', category: 'Family', difficulty: 'easy' },
  { id: 10, question: 'Under Muslim Personal Law, up to what age does the mother have the right of custody (Hizanat) of a male child?', options: ['5 years', '7 years', '9 years', '12 years'], correct: 1, explanation: 'Under Hanafi law followed in Pakistan, the mother has the right of custody of a male child up to 7 years of age and a female child until puberty (approximately 12-14 years).', category: 'Family', difficulty: 'medium' },
  { id: 11, question: 'What is the maximum period of Iddat after divorce?', options: ['30 days', '60 days', '90 days', '120 days'], correct: 2, explanation: 'The Iddat period after divorce is three menstrual cycles, or if the woman is not menstruating, 90 days (three lunar months) as prescribed under Muslim law.', category: 'Family', difficulty: 'medium' },

  // Civil
  { id: 12, question: 'What is the limitation period for filing a civil suit for recovery of money in Pakistan?', options: ['1 year', '3 years', '6 years', '12 years'], correct: 1, explanation: 'Under the Limitation Act, 1908 (First Schedule, Article 56), the limitation period for a suit for recovery of money lent is 3 years from the date when the money is payable.', category: 'Civil', difficulty: 'medium' },
  { id: 13, question: 'Under Section 80 CPC, how many days notice must be given before suing a government entity?', options: ['30 days', '60 days', '90 days', '120 days'], correct: 1, explanation: 'Section 80 CPC requires a two-month (60 days) notice to be served upon the Government or a public officer before instituting a suit against them.', category: 'Civil', difficulty: 'hard' },

  // Property
  { id: 14, question: 'Which document is required for transfer of immovable property in Pakistan?', options: ['Agreement to Sell', 'Registered Sale Deed', 'Power of Attorney', 'Affidavit'], correct: 1, explanation: 'Under Section 54 of the Transfer of Property Act, 1882, transfer of immovable property worth more than Rs. 100 must be through a registered instrument (Sale Deed / Bay Nama).', category: 'Property', difficulty: 'easy' },
  { id: 15, question: 'What is the Urdu term for "mutation" in land records?', options: ['Patwari', 'Intiqal', 'Khasra', 'Fard'], correct: 1, explanation: 'Intiqal (انتقال) refers to the mutation or transfer of land ownership in revenue records. It is done through the Revenue Department.', category: 'Property', difficulty: 'easy' },

  // Procedure
  { id: 16, question: 'What is the maximum time limit for police to complete investigation and submit Challan under Section 173 CrPC?', options: ['7 days', '14 days', '21 days', '30 days'], correct: 1, explanation: 'Under Section 173 CrPC, every investigation shall be completed within 14 days. If not completed, the investigating officer shall submit an interim report (challan) or request an extension.', category: 'Criminal', difficulty: 'hard' },
  { id: 17, question: 'Which court has original jurisdiction in cases involving Fundamental Rights?', options: ['District Court', 'Sessions Court', 'High Court', 'Supreme Court'], correct: 2, explanation: 'Under Article 199 of the Constitution, High Courts have original jurisdiction to enforce Fundamental Rights through writs. The Supreme Court can also exercise this jurisdiction under Article 184(3) in matters of public importance.', category: 'Constitutional', difficulty: 'medium' },

  // Islamic Law
  { id: 18, question: 'What is the minimum amount of Haq Mehr prescribed in Pakistani law?', options: ['No minimum prescribed', 'Rs. 10,000', 'Rs. 30,000', 'Rs. 50,000'], correct: 0, explanation: 'There is no minimum amount of Haq Mehr (dower) prescribed by law. It is a matter of agreement between the parties, though it should be reasonable and not token.', category: 'Family', difficulty: 'hard' },

  // Cyber
  { id: 19, question: 'The Prevention of Electronic Crimes Act (PECA) was enacted in which year?', options: ['2014', '2016', '2018', '2020'], correct: 1, explanation: 'PECA 2016 is Pakistan\'s primary cybercrime legislation. It criminalizes unauthorized access, data damage, electronic fraud, cyber stalking, and other electronic crimes.', category: 'Criminal', difficulty: 'medium' },

  // Evidence
  { id: 20, question: 'Under the Qanun-e-Shahadat Order 1984, who has the burden of proof?', options: ['The Court', 'The person who asserts a fact', 'The prosecution only', 'Both parties equally'], correct: 1, explanation: 'Article 117 of the Qanun-e-Shahadat Order, 1984 states that the burden of proof lies on the person who asserts a fact (he who asserts must prove). This is based on the maxim "ei incumbit probatio qui dicit, non qui negat."', category: 'Civil', difficulty: 'medium' },
];

const QUIZ_CATEGORIES = ['All', 'Constitutional', 'Criminal', 'Family', 'Civil', 'Property'];
const DIFFICULTY_LABELS = { easy: 'Beginner', medium: 'Intermediate', hard: 'Advanced' };
const DIFFICULTY_COLORS = { easy: 'text-emerald-300 bg-emerald-500/10', medium: 'text-amber-300 bg-amber-500/10', hard: 'text-red-300 bg-red-500/10' };

export default function QuizPage() {
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [finished, setFinished] = useState(false);
  const [adminQuestions, setAdminQuestions] = useState<Question[]>([]);

  // Fetch admin-created questions on mount
  useEffect(() => {
    getStudyQuestions({ limit: 100 }).then((data: any[]) => {
      const mapped: Question[] = data.map((q: any, i: number) => ({
        id: 1000 + i,
        question: q.question || '',
        options: q.options || [],
        correct: q.correct ?? 0,
        explanation: q.explanation || '',
        category: q.category || 'General',
        difficulty: q.difficulty || 'medium',
      }));
      setAdminQuestions(mapped);
    }).catch(() => {});
  }, []);

  const allQuestions = [...QUESTIONS, ...adminQuestions];

  const startQuiz = useCallback(() => {
    let filtered = allQuestions;
    if (category !== 'All') filtered = filtered.filter(q => q.category === category);
    if (difficulty !== 'all') filtered = filtered.filter(q => q.difficulty === difficulty);
    // Shuffle
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10);
    if (shuffled.length === 0) return;
    setQuizQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswered(0);
    setFinished(false);
    setQuizStarted(true);
  }, [category, difficulty, allQuestions]);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setAnswered(a => a + 1);
    if (idx === quizQuestions[currentIndex].correct) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const currentQ = quizQuestions[currentIndex];

  // Results screen
  if (finished) {
    const pct = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-navy-950 noise">
        <Navbar />
        <main className="w-full px-4 pt-24 pb-16">
          <div className="court-panel p-10 text-center">
            <div className="w-24 h-24 rounded-full bg-brass-400/10 border-2 border-brass-400/30 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-display font-black text-brass-300">{pct}%</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Quiz Complete!</h2>
            <p className="text-gray-400 mb-6">
              You scored <span className="text-brass-300 font-semibold">{score}</span> out of <span className="text-white font-semibold">{quizQuestions.length}</span> questions
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {pct >= 80 ? 'Excellent! You have a strong grasp of Pakistani law.' :
               pct >= 50 ? 'Good effort! Keep studying to improve.' :
               'Keep learning! Review the explanations to strengthen your knowledge.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={startQuiz} className="btn-gavel">Try Again</button>
              <button onClick={() => { setQuizStarted(false); setFinished(false); }} className="btn-outline">Change Topic</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz in progress
  if (quizStarted && currentQ) {
    return (
      <div className="min-h-screen bg-navy-950 noise">
        <Navbar />
        <main className="w-full px-4 pt-24 pb-16">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setQuizStarted(false)} className="text-sm text-gray-500 hover:text-brass-300 transition-colors">Exit Quiz</button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                <span className="text-white font-semibold">{currentIndex + 1}</span>/{quizQuestions.length}
              </span>
              <span className="text-sm text-emerald-300 font-mono">{score} correct</span>
            </div>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-brass-400 rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }} />
          </div>

          <div className="court-panel p-4 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${DIFFICULTY_COLORS[currentQ.difficulty]}`}>
                {DIFFICULTY_LABELS[currentQ.difficulty]}
              </span>
              <span className="text-xs text-gray-500">{currentQ.category}</span>
            </div>

            <h2 className="text-lg font-display font-semibold text-white mb-6 leading-relaxed">{currentQ.question}</h2>

            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                let cls = 'bg-white/[0.03] border-white/[0.06] text-gray-300 hover:border-brass-400/30 hover:bg-brass-400/5';
                if (selectedAnswer !== null) {
                  if (idx === currentQ.correct) cls = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
                  else if (idx === selectedAnswer) cls = 'bg-red-500/10 border-red-500/30 text-red-300';
                  else cls = 'bg-white/[0.02] border-white/[0.04] text-gray-500';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${cls}`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {selectedAnswer !== null && idx === currentQ.correct && (
                      <svg className="w-5 h-5 ml-auto text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                    {selectedAnswer === idx && idx !== currentQ.correct && (
                      <svg className="w-5 h-5 ml-auto text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-6 p-4 bg-brass-400/5 border border-brass-400/15 rounded-xl animate-fade-in">
                <h4 className="text-sm font-semibold text-brass-300 mb-2">Explanation</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {selectedAnswer !== null && (
              <button onClick={nextQuestion} className="btn-gavel mt-6 w-full">
                {currentIndex + 1 >= quizQuestions.length ? 'See Results' : 'Next Question'}
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Start screen
  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="text-center mb-10">
          <GavelSVG size={50} className="mx-auto mb-4 opacity-30" />
          <h1 className="text-3xl font-display font-bold text-white mb-2">Legal Quiz</h1>
          <p className="text-gray-400">Test your knowledge of Pakistani law</p>
        </div>

        <div className="court-panel p-4 sm:p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-brass-400/60 mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {QUIZ_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                    category === c
                      ? 'bg-brass-400/15 border-brass-400/30 text-brass-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white hover:border-brass-400/20'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-brass-400/60 mb-3">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Levels' },
                { value: 'easy', label: 'Beginner' },
                { value: 'medium', label: 'Intermediate' },
                { value: 'hard', label: 'Advanced' },
              ].map(d => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value as typeof difficulty)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                    difficulty === d.value
                      ? 'bg-brass-400/15 border-brass-400/30 text-brass-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white hover:border-brass-400/20'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              {(() => {
                let count = allQuestions.length;
                if (category !== 'All') count = allQuestions.filter(q => q.category === category).length;
                if (difficulty !== 'all') count = allQuestions.filter(q => (category === 'All' || q.category === category) && q.difficulty === difficulty).length;
                return `${count} questions available (max 10 per quiz)`;
              })()}
            </p>
            <button onClick={startQuiz} className="btn-gavel !py-3 !px-10 text-lg">
              Start Quiz
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
