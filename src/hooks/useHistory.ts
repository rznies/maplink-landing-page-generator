import { useState, useEffect } from 'react';
import type { GeneratedSiteData } from '../types';

const HISTORY_KEY = 'maplink_history';
const MAX_HISTORY_ITEMS = 10;

export function useHistory() {
  const [history, setHistory] = useState<GeneratedSiteData[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
    }
  }, []);

  const saveToHistory = (newSite: GeneratedSiteData) => {
    setHistory(prev => {
      // Remove if it already exists to put it at the top
      const filtered = prev.filter(s => s.placeId !== newSite.placeId);
      const updated = [newSite, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history to localStorage:', e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history from localStorage:', e);
    }
    setHistory([]);
  };

  return { history, saveToHistory, clearHistory };
}
