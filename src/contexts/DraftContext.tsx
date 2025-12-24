import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import { DeviceDraft, Device } from "../types/device";

export const DRAFT_KEY = "device_import_drafts";

interface DraftContextType {
  // State
  drafts: DeviceDraft[];
  draftCount: number;

  // Actions
  addDraft: (device: DeviceDraft | Partial<Device>) => void;
  removeDraft: (maThietBi: string) => void;
  updateDraft: (maThietBi: string, updates: Partial<DeviceDraft>) => void;
  clearAllDrafts: () => void;

  // Queries
  getDraft: (maThietBi: string) => DeviceDraft | undefined;
  hasDraft: (maThietBi: string) => boolean;
}

const DraftContext = createContext<DraftContextType | null>(null);

/**
 * DraftProvider - Manages all draft devices centrally
 * Syncs with localStorage automatically
 */
export function DraftProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<DeviceDraft[]>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return [];

      const parsed = JSON.parse(saved);
      // Ensure all have __draft = true
      return Array.isArray(parsed)
        ? parsed.map(d => ({ ...d, __draft: true }))
        : [];
    } catch (error) {
      console.error("Failed to load drafts from localStorage", error);
      localStorage.removeItem(DRAFT_KEY);
      return [];
    }
  });

  /**
   * Persist drafts to localStorage whenever they change
   */
  useEffect(() => {
    try {
      if (drafts.length === 0) {
        localStorage.removeItem(DRAFT_KEY);
      } else {
        const toSave = drafts.map(d => ({ ...d, __draft: true }));
        localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      }
    } catch (error) {
      console.error("Failed to persist drafts to localStorage", error);
    }
  }, [drafts]);

  /**
   * Add or update draft
   */
  const addDraft = useCallback((device: DeviceDraft | Partial<Device>) => {
    if (!device.maThietBi) {
      console.warn("Cannot add draft without maThietBi", device);
      return;
    }

    setDrafts(prev => {
      // Remove existing draft with same ID
      const filtered = prev.filter(d => d.maThietBi !== device.maThietBi);

      // Add new draft
      return [
        ...filtered,
        {
          ...device,
          __draft: true,
        } as DeviceDraft
      ];
    });
  }, []);

  /**
   * Remove specific draft
   */
  const removeDraft = useCallback((maThietBi: string) => {
    setDrafts(prev => prev.filter(d => d.maThietBi !== maThietBi));
  }, []);

  /**
   * Update specific draft fields
   */
  const updateDraft = useCallback((
    maThietBi: string,
    updates: Partial<DeviceDraft>
  ) => {
    setDrafts(prev =>
      prev.map(d =>
        d.maThietBi === maThietBi
          ? { ...d, ...updates, __draft: true }
          : d
      )
    );
  }, []);

  /**
   * Clear all drafts
   */
  const clearAllDrafts = useCallback(() => {
    setDrafts([]);
  }, []);

  /**
   * Get specific draft
   */
  const getDraft = useCallback((maThietBi: string): DeviceDraft | undefined => {
    return drafts.find(d => d.maThietBi === maThietBi);
  }, [drafts]);

  /**
   * Check if device has draft
   */
  const hasDraft = useCallback((maThietBi: string): boolean => {
    return drafts.some(d => d.maThietBi === maThietBi);
  }, [drafts]);

  const value: DraftContextType = {
    drafts,
    draftCount: drafts.length,
    addDraft,
    removeDraft,
    updateDraft,
    clearAllDrafts,
    getDraft,
    hasDraft,
  };

  return (
    <DraftContext.Provider value={value}>
      {children}
    </DraftContext.Provider>
  );
}

/**
 * Hook to use draft context
 */
export function useDrafts(): DraftContextType {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useDrafts must be used inside DraftProvider");
  }
  return context;
}
