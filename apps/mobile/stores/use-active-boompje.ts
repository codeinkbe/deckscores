import type { Boompje } from '@deckscores/shared';
import { create } from 'zustand';

type State = {
  boompje: Boompje | null;
  loading: boolean;
  error: string | null;
};

type Actions = {
  setBoompje: (boompje: Boompje) => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useActiveBoompje = create<State & Actions>((set) => ({
  boompje: null,
  loading: false,
  error: null,
  setBoompje: (boompje) => set({ boompje, error: null }),
  clear: () => set({ boompje: null, error: null, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
