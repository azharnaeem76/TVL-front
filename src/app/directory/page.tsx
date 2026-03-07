'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { getLawyerDirectory } from '@/lib/api';

interface LawyerProfile {
  id: number;
  full_name: string;
  email: string;
  role: string;
  phone: string | null;
  city: string | null;
  specialization: string | null;
  bar_number: string | null;
}

export default function DirectoryPage() {
  const [mounted, setMounted] = useState(false);
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [specialization, setSpecialization] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLawyerDirectory({
        search: search || undefined,
        city: city || undefined,
        specialization: specialization || undefined,
      });
      setLawyers(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, city, specialization]);

  useEffect(() => {
    if (mounted) loadDirectory();
  }, [mounted, loadDirectory]);

  const formatLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'lawyer': return (
        <svg className="w-5 h-5 text-brass-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>
      );
      case 'judge': return (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
      );
      default: return (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
      );
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="px-4 sm:px-6 pt-24 pb-16 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Lawyer Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Find legal professionals across Pakistan</p>
        </div>

        {/* Filters */}
        <div className="court-panel p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="Search by name, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            className="input-field w-full sm:w-40"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
          <input
            className="input-field w-full sm:w-48"
            placeholder="Specialization"
            value={specialization}
            onChange={e => setSpecialization(e.target.value)}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Searching directory...</div>
        ) : lawyers.length === 0 ? (
          <div className="court-panel p-12 text-center">
            <p className="text-gray-500">No legal professionals found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lawyers.map(l => (
              <div key={l.id} className="court-panel p-5 hover:border-brass-400/20 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    {getRoleIcon(l.role)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm truncate">{l.full_name}</h3>
                    <p className="text-brass-400 text-xs">{formatLabel(l.role)}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-400">
                  <p className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    <span className="text-gray-300 truncate">{l.email}</span>
                  </p>
                  {l.phone && (
                    <p className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      <span className="text-gray-300">{l.phone}</span>
                    </p>
                  )}
                  {l.city && (
                    <p className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      <span className="text-gray-300">{l.city}</span>
                    </p>
                  )}
                  {l.specialization && (
                    <p className="mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-brass-400/10 text-brass-400 border border-brass-400/20 text-[10px]">
                        {l.specialization}
                      </span>
                    </p>
                  )}
                  {l.bar_number && (
                    <p className="text-[10px] text-gray-600 mt-1">Bar #{l.bar_number}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
