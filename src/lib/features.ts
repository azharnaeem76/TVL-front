'use client';

import { useState, useEffect } from 'react';
import { getEnabledFeatures } from '@/lib/api';

let cachedFeatures: string[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 60000; // 1 minute

export function useFeatureFlags() {
  const [features, setFeatures] = useState<string[]>(cachedFeatures || []);
  const [loaded, setLoaded] = useState(!!cachedFeatures);

  useEffect(() => {
    const now = Date.now();
    if (cachedFeatures && now - lastFetch < CACHE_TTL) {
      setFeatures(cachedFeatures);
      setLoaded(true);
      return;
    }

    getEnabledFeatures()
      .then(data => {
        cachedFeatures = data.enabled;
        lastFetch = Date.now();
        setFeatures(data.enabled);
      })
      .catch(() => {
        // If fetch fails, show all features
        setFeatures([]);
      })
      .finally(() => setLoaded(true));
  }, []);

  const isEnabled = (key: string) => {
    // If features haven't loaded yet, show everything
    if (!loaded || features.length === 0) return true;
    return features.includes(key);
  };

  return { features, isEnabled, loaded };
}

// Map sidebar href to feature flag key
export const ROUTE_FEATURE_MAP: Record<string, string> = {
  '/search': 'search',
  '/case-laws': 'case_laws',
  '/statutes': 'statutes',
  '/chat': 'chat',
  '/drafting': 'drafting',
  '/calendar': 'calendar',
  '/news': 'news',
  '/case-tracker': 'case_tracker',
  '/clients': 'client_crm',
  '/directory': 'lawyer_directory',
  '/quiz': 'quiz',
  '/learn': 'learn',
  '/notifications': 'email_notifications',
};
