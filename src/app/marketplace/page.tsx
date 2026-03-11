'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { isLoggedIn, getCurrentUser } from '@/lib/api';

const API_BASE = '/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tvl_token');
}

async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LawyerCard {
  id: number;
  full_name: string;
  email: string;
  city: string | null;
  specialization: string | null;
  bio: string | null;
  bar_number: string | null;
  profile_picture: string | null;
  avg_rating: number;
  review_count: number;
  hourly_rate: number | null;
  fixed_fee: number | null;
  availability: string;
  years_experience: number;
  cases_won: number;
  services: {
    id: number;
    title: string;
    category: string;
    hourly_rate: number | null;
    fixed_fee: number | null;
  }[];
}

interface LawyerDetail extends LawyerCard {
  reviews: Review[];
  services: ServiceDetail[];
}

interface ServiceDetail {
  id: number;
  title: string;
  description: string | null;
  category: string;
  hourly_rate: number | null;
  fixed_fee: number | null;
  availability: string;
  areas_of_expertise: string | null;
  created_at: string;
}

interface Review {
  id: number;
  client_id: number;
  client_name: string;
  rating: number;
  review_text: string | null;
  case_type: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPECIALIZATIONS = [
  'Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law', 'Property Law',
  'Tax Law', 'Immigration', 'Labor Law', 'Constitutional Law', 'Banking Law',
  'Cyber Law', 'Intellectual Property',
];

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Hyderabad',
];

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-emerald-400' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
];

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sz} ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function InteractiveStarRating({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onRate(star)}
        >
          <svg
            className={`w-7 h-7 transition-colors ${
              star <= (hover || rating) ? 'text-amber-400' : 'text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function Avatar({ name, picture, size = 'md' }: { name: string; picture?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'md' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        className={`${dims} rounded-full object-cover border-2 border-emerald-500/30`}
      />
    );
  }

  return (
    <div
      className={`${dims} rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center font-bold text-white border-2 border-emerald-500/30`}
    >
      {initials}
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }) {
  const colors = {
    default: 'bg-gray-800 text-gray-300 border-gray-700',
    success: 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50',
    warning: 'bg-amber-900/50 text-amber-400 border-amber-700/50',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant]}`}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null);
  const [lawyers, setLawyers] = useState<LawyerCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(0);
  const perPage = 12;

  // Modals
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerDetail | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireLawyerId, setHireLawyerId] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLawyerId, setReviewLawyerId] = useState<number | null>(null);

  // Hire form
  const [hireDesc, setHireDesc] = useState('');
  const [hireBudget, setHireBudget] = useState('');
  const [hireUrgency, setHireUrgency] = useState('medium');
  const [hireSubmitting, setHireSubmitting] = useState(false);
  const [hireSuccess, setHireSuccess] = useState('');

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewCaseType, setReviewCaseType] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Filter sidebar mobile toggle
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      if (specialization) params.set('specialization', specialization);
      if (maxRate) params.set('max_hourly_rate', maxRate);
      if (minRating) params.set('min_rating', minRating);
      params.set('sort_by', sortBy);
      params.set('skip', String(page * perPage));
      params.set('limit', String(perPage));
      const data = await api(`/marketplace/lawyers?${params}`);
      setLawyers(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, city, specialization, maxRate, minRating, sortBy, page]);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  const openProfile = async (lawyerId: number) => {
    try {
      const data = await api(`/marketplace/lawyers/${lawyerId}`);
      setSelectedLawyer(data);
      setShowProfile(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openHireModal = (lawyerId: number) => {
    if (!isLoggedIn()) {
      window.location.href = '/login';
      return;
    }
    setHireLawyerId(lawyerId);
    setHireDesc('');
    setHireBudget('');
    setHireUrgency('medium');
    setHireSuccess('');
    setShowHireModal(true);
  };

  const submitHire = async () => {
    if (!hireLawyerId || !hireDesc.trim()) return;
    setHireSubmitting(true);
    try {
      await api('/marketplace/hire', {
        method: 'POST',
        body: JSON.stringify({
          lawyer_id: hireLawyerId,
          case_description: hireDesc,
          budget: hireBudget ? parseFloat(hireBudget) : null,
          urgency: hireUrgency,
        }),
      });
      setHireSuccess('Hire request sent successfully! The lawyer will review your request.');
      setTimeout(() => setShowHireModal(false), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setHireSubmitting(false);
    }
  };

  const openReviewModal = (lawyerId: number) => {
    if (!isLoggedIn()) {
      window.location.href = '/login';
      return;
    }
    setReviewLawyerId(lawyerId);
    setReviewRating(0);
    setReviewText('');
    setReviewCaseType('');
    setReviewSuccess('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewLawyerId || reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      await api('/marketplace/reviews', {
        method: 'POST',
        body: JSON.stringify({
          lawyer_id: reviewLawyerId,
          rating: reviewRating,
          review_text: reviewText || null,
          case_type: reviewCaseType || null,
        }),
      });
      setReviewSuccess('Review submitted successfully!');
      fetchLawyers();
      setTimeout(() => setShowReviewModal(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCity('');
    setSpecialization('');
    setMaxRate('');
    setMinRating('');
    setSortBy('rating');
    setPage(0);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400 bg-clip-text text-transparent">
            Lawyer Marketplace
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Find and hire the best legal professionals across Pakistan. Compare ratings, pricing, and expertise to make the right choice.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg shadow-emerald-900/10 focus-within:border-emerald-600/50 transition-colors">
              <svg className="w-5 h-5 text-gray-500 ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, specialization, or city..."
                className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="mr-3 text-gray-500 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Criminal Law', 'Family Law', 'Corporate Law', 'Property Law', 'Civil Law'].map((spec) => (
              <button
                key={spec}
                onClick={() => { setSpecialization(specialization === spec ? '' : spec); setPage(0); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  specialization === spec
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-emerald-600/40 hover:text-emerald-400'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-emerald-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-20 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Filters</h3>
                <button onClick={resetFilters} className="text-xs text-emerald-400 hover:text-emerald-300">
                  Reset All
                </button>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">City</label>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setPage(0); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">All Cities</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Specialization Filter */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => { setSpecialization(e.target.value); setPage(0); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">All Specializations</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Max Hourly Rate */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Max Hourly Rate (PKR)</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={maxRate}
                  onChange={(e) => { setMaxRate(e.target.value); setPage(0); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => { setMinRating(e.target.value); setPage(0); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price">Lowest Price</option>
                  <option value="experience">Most Experienced</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${total} lawyer${total !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
                {error}
                <button onClick={() => setError('')} className="ml-2 text-red-300 underline">Dismiss</button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 bg-gray-800 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-800 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : lawyers.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No lawyers found</h3>
                <p className="text-gray-600 text-sm">Try adjusting your filters or search terms</p>
                <button onClick={resetFilters} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {lawyers.map((lawyer) => (
                    <div
                      key={lawyer.id}
                      className="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-600/40 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar name={lawyer.full_name} picture={lawyer.profile_picture} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {lawyer.full_name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{lawyer.specialization || 'General Practice'}</p>
                          {lawyer.city && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {lawyer.city}
                            </p>
                          )}
                        </div>
                        {/* Availability dot */}
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          lawyer.availability === 'available' ? 'bg-emerald-400' :
                          lawyer.availability === 'busy' ? 'bg-amber-400' : 'bg-gray-600'
                        }`} title={lawyer.availability} />
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={lawyer.avg_rating} />
                        <span className="text-sm font-medium text-amber-400">{lawyer.avg_rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-600">({lawyer.review_count} review{lawyer.review_count !== 1 ? 's' : ''})</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                        {lawyer.cases_won > 0 && (
                          <Badge variant="success">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {lawyer.cases_won} cases
                          </Badge>
                        )}
                        <Badge>
                          {lawyer.years_experience} yr{lawyer.years_experience !== 1 ? 's' : ''} exp
                        </Badge>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-800">
                        {lawyer.hourly_rate && (
                          <div>
                            <span className="text-xs text-gray-600">Hourly</span>
                            <p className="text-sm font-semibold text-emerald-400">{formatCurrency(lawyer.hourly_rate)}</p>
                          </div>
                        )}
                        {lawyer.fixed_fee && (
                          <div>
                            <span className="text-xs text-gray-600">Fixed Fee</span>
                            <p className="text-sm font-semibold text-emerald-400">{formatCurrency(lawyer.fixed_fee)}</p>
                          </div>
                        )}
                        {!lawyer.hourly_rate && !lawyer.fixed_fee && (
                          <p className="text-xs text-gray-600 italic">Contact for pricing</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openProfile(lawyer.id)}
                          className="flex-1 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => openHireModal(lawyer.id)}
                          className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
                        >
                          Hire
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {total > perPage && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500 px-3">
                      Page {page + 1} of {Math.ceil(total / perPage)}
                    </span>
                    <button
                      disabled={(page + 1) * perPage >= total}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Lawyer Profile Modal */}
      {/* ================================================================= */}
      {showProfile && selectedLawyer && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/70 backdrop-blur-sm" onClick={() => setShowProfile(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Profile Header */}
            <div className="relative p-6 pb-4 border-b border-gray-800">
              <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-start gap-4">
                <Avatar name={selectedLawyer.full_name} picture={selectedLawyer.profile_picture} size="lg" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{selectedLawyer.full_name}</h2>
                  <p className="text-emerald-400 font-medium">{selectedLawyer.specialization || 'General Practice'}</p>
                  {selectedLawyer.city && (
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {selectedLawyer.city}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={selectedLawyer.avg_rating} size="lg" />
                      <span className="text-amber-400 font-bold">{selectedLawyer.avg_rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({selectedLawyer.review_count})</span>
                    </div>
                    <Badge variant="success">{selectedLawyer.cases_won} cases completed</Badge>
                    <Badge>{selectedLawyer.years_experience} yrs experience</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedLawyer.bio && (
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedLawyer.bio}</p>
              </div>
            )}

            {/* Services */}
            {selectedLawyer.services.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Services & Pricing</h3>
                <div className="space-y-3">
                  {selectedLawyer.services.map((svc) => (
                    <div key={svc.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{svc.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{svc.category.replace('_', ' ')}</p>
                        {svc.description && <p className="text-xs text-gray-400 mt-1">{svc.description}</p>}
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        {svc.hourly_rate && <p className="text-emerald-400 text-sm font-semibold">{formatCurrency(svc.hourly_rate)}/hr</p>}
                        {svc.fixed_fee && <p className="text-emerald-400 text-xs">{formatCurrency(svc.fixed_fee)} fixed</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reviews</h3>
                {isLoggedIn() && user?.role !== 'lawyer' && (
                  <button
                    onClick={() => { setShowProfile(false); openReviewModal(selectedLawyer.id); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {selectedLawyer.reviews.length === 0 ? (
                <p className="text-gray-600 text-sm italic py-4">No reviews yet</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {selectedLawyer.reviews.map((rev) => (
                    <div key={rev.id} className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar name={rev.client_name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-white">{rev.client_name}</p>
                            {rev.case_type && <p className="text-xs text-gray-500">{rev.case_type}</p>}
                          </div>
                        </div>
                        <StarRating rating={rev.rating} />
                      </div>
                      {rev.review_text && <p className="text-sm text-gray-400 mt-2">{rev.review_text}</p>}
                      <p className="text-xs text-gray-600 mt-1">{new Date(rev.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => { setShowProfile(false); openHireModal(selectedLawyer.id); }}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
              >
                Hire This Lawyer
              </button>
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Hire Request Modal */}
      {/* ================================================================= */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowHireModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Send Hire Request</h2>
              <p className="text-gray-500 text-sm mt-1">Describe your case and the lawyer will review your request</p>
            </div>

            <div className="p-6 space-y-4">
              {hireSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-emerald-900/40 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-emerald-400 font-medium">{hireSuccess}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Case Description *</label>
                    <textarea
                      rows={4}
                      placeholder="Describe your legal issue in detail..."
                      value={hireDesc}
                      onChange={(e) => setHireDesc(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Budget (PKR)</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={hireBudget}
                        onChange={(e) => setHireBudget(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Urgency</label>
                      <select
                        value={hireUrgency}
                        onChange={(e) => setHireUrgency(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600"
                      >
                        {URGENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!hireSuccess && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={submitHire}
                  disabled={hireSubmitting || !hireDesc.trim()}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {hireSubmitting ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  onClick={() => setShowHireModal(false)}
                  className="px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Review Modal */}
      {/* ================================================================= */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Write a Review</h2>
              <p className="text-gray-500 text-sm mt-1">Share your experience with this lawyer</p>
            </div>

            <div className="p-6 space-y-4">
              {reviewSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-emerald-900/40 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-emerald-400 font-medium">{reviewSuccess}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Rating *</label>
                    <InteractiveStarRating rating={reviewRating} onRate={setReviewRating} />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Case Type</label>
                    <select
                      value={reviewCaseType}
                      onChange={(e) => setReviewCaseType(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="">Select case type (optional)</option>
                      {SPECIALIZATIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Review</label>
                    <textarea
                      rows={3}
                      placeholder="Share your experience... (optional)"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-600 resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            {!reviewSuccess && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={submitReview}
                  disabled={reviewSubmitting || reviewRating === 0}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
