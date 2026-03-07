'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { generateExamQuestions, evaluateExamAnswer } from '@/lib/api';

const SUBJECTS = [
  'Pakistan Penal Code (PPC)',
  'Code of Criminal Procedure (CrPC)',
  'Code of Civil Procedure (CPC)',
  'Contract Act 1872',
  'Transfer of Property Act',
  'Muslim Family Laws',
  'Constitutional Law',
  'Evidence Law (Qanun-e-Shahadat)',
  'PECA 2016 (Cyber Crime)',
  'Labour Laws',
];

export default function ExamPrepPage() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [numQ, setNumQ] = useState(5);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!subject) return showToast('Select a subject', 'error');
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setResults({});
    setShowAnswers(false);
    try {
      const data = await generateExamQuestions(subject, topic || undefined, numQ);
      setQuestions(data.questions || []);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setShowAnswers(true);
    const newResults: Record<number, any> = {};
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = answers[i] || '';
      try {
        const fb = await evaluateExamAnswer(q.question, ans, subject);
        newResults[i] = fb;
      } catch {
        newResults[i] = { is_correct: false, feedback: 'Could not evaluate', score: 0 };
      }
    }
    setResults(newResults);
  };

  const totalScore = Object.values(results).reduce((s: number, r: any) => s + (r.score || 0), 0);
  const maxScore = questions.length * 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Exam Preparation</h1>
            <p className="text-gray-400 mt-1">LLB/Bar exam practice with AI-generated questions</p>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">Subject</label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map(s => (
                    <button key={s} onClick={() => setSubject(s)}
                      className={`text-left p-3 rounded-lg text-sm transition-colors ${subject === s ? 'bg-brass-400/20 text-brass-300 border border-brass-400/30' : 'bg-white/[0.03] text-gray-400 border border-transparent hover:border-brass-400/10'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-1">Specific topic (optional)</label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="E.g., Bail provisions, Divorce procedures..."
                  className="w-full bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
              </div>
              <div className="mb-6">
                <label className="text-sm text-gray-400 block mb-1">Number of questions</label>
                <select value={numQ} onChange={(e) => setNumQ(parseInt(e.target.value))}
                  className="bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none text-sm">
                  {[3, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button onClick={handleGenerate} disabled={loading || !subject}
                className="w-full py-3 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                {loading ? 'Generating Questions...' : 'Start Practice'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">{subject} - {questions.length} questions</p>
                <button onClick={() => { setQuestions([]); setAnswers({}); setResults({}); setShowAnswers(false); }}
                  className="text-xs text-gray-500 hover:text-gray-300">New Quiz</button>
              </div>

              {questions.map((q, i) => (
                <div key={i} className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-5">
                  <p className="text-white font-medium mb-3">Q{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt: string, j: number) => {
                      const letter = opt.charAt(0);
                      const isSelected = answers[i] === letter;
                      const isCorrect = showAnswers && q.correct_answer === letter;
                      const isWrong = showAnswers && isSelected && q.correct_answer !== letter;
                      return (
                        <button key={j} onClick={() => !showAnswers && setAnswers({ ...answers, [i]: letter })}
                          disabled={showAnswers}
                          className={`w-full text-left p-3 rounded-lg text-sm transition-colors border ${
                            isCorrect ? 'border-green-500/40 bg-green-500/10 text-green-300' :
                            isWrong ? 'border-red-500/40 bg-red-500/10 text-red-300' :
                            isSelected ? 'border-brass-400/30 bg-brass-400/10 text-brass-300' :
                            'border-transparent bg-white/[0.03] text-gray-300 hover:bg-white/[0.06]'
                          }`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showAnswers && results[i] && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${results[i].is_correct ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                      <p className="font-medium">{results[i].is_correct ? 'Correct!' : 'Incorrect'} (Score: {results[i].score}/100)</p>
                      <p className="text-gray-400 mt-1">{results[i].explanation || q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}

              {!showAnswers ? (
                <button onClick={handleSubmit} className="w-full py-3 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors">
                  Submit Answers
                </button>
              ) : Object.keys(results).length > 0 && (
                <div className="bg-brass-400/5 border border-brass-400/20 rounded-xl p-6 text-center">
                  <p className="text-2xl font-bold text-brass-300">{totalScore}/{maxScore}</p>
                  <p className="text-gray-400 mt-1">
                    {totalScore / maxScore >= 0.7 ? 'Great job!' : totalScore / maxScore >= 0.5 ? 'Good effort, keep practicing!' : 'Keep studying and try again!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
