'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

interface Payment {
  id: number;
  type: string;
  amount: number;
  status: string;
  date: string;
  method: string;
  reference: string;
}

const MOCK_PAYMENTS: Payment[] = [
  { id: 1, type: 'Consultation Fee', amount: 5000, status: 'completed', date: '2024-03-01', method: 'JazzCash', reference: 'JC-2024-001' },
  { id: 2, type: 'Subscription - Pro Plan', amount: 2000, status: 'completed', date: '2024-02-15', method: 'Easypaisa', reference: 'EP-2024-045' },
  { id: 3, type: 'Document Analysis', amount: 500, status: 'pending', date: '2024-03-05', method: 'Bank Transfer', reference: 'BT-2024-089' },
];

export default function PaymentsPage() {
  const [payments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [showPayForm, setShowPayForm] = useState(false);
  const [method, setMethod] = useState('jazzcash');
  const [amount, setAmount] = useState('');
  const { showToast } = useToast();

  const handlePay = () => {
    showToast('Payment integration will be configured by admin. This is a preview.', 'info');
    setShowPayForm(false);
  };

  const statusColor = (s: string) => {
    if (s === 'completed') return 'bg-green-500/10 text-green-400';
    if (s === 'pending') return 'bg-yellow-500/10 text-yellow-400';
    return 'bg-red-500/10 text-red-400';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Payments</h1>
              <p className="text-gray-400 mt-1">Manage payments via JazzCash, Easypaisa, or bank transfer</p>
            </div>
            <button onClick={() => setShowPayForm(true)} className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm">
              Make Payment
            </button>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { name: 'JazzCash', color: 'from-red-500/20 to-orange-500/20', desc: 'Mobile wallet payments' },
              { name: 'Easypaisa', color: 'from-green-500/20 to-emerald-500/20', desc: 'Mobile money transfers' },
              { name: 'Bank Transfer', color: 'from-blue-500/20 to-indigo-500/20', desc: 'Direct bank payments' },
            ].map(m => (
              <div key={m.name} className={`bg-gradient-to-br ${m.color} border border-white/[0.06] rounded-xl p-5`}>
                <h3 className="text-white font-medium">{m.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{m.desc}</p>
                <p className="text-xs text-brass-400 mt-3">Available</p>
              </div>
            ))}
          </div>

          {/* Payment History */}
          <h2 className="text-lg font-semibold text-white mb-4">Payment History</h2>
          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Type</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Method</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Reference</th>
                  <th className="text-right p-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-center p-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="p-3 text-gray-400">{p.date}</td>
                    <td className="p-3 text-gray-300">{p.type}</td>
                    <td className="p-3 text-gray-400">{p.method}</td>
                    <td className="p-3 text-gray-500 font-mono text-xs">{p.reference}</td>
                    <td className="p-3 text-white text-right font-medium">Rs. {p.amount.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColor(p.status)}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pay Modal */}
          {showPayForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-white mb-4">Make Payment</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Payment Method</label>
                    <select value={method} onChange={(e) => setMethod(e.target.value)}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none text-sm">
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">Easypaisa</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Amount (PKR)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount"
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <p className="text-xs text-gray-500">Payment gateway integration requires admin configuration.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowPayForm(false)} className="flex-1 px-4 py-2.5 border border-brass-400/10 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
                    <button onClick={handlePay} className="flex-1 px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 text-sm">Pay</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
