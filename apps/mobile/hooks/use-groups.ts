import { useCallback, useEffect, useState } from 'react';
import type { Group } from '@deckscores/shared';
import { useApi } from '@/lib/api';

type Response = { groups: Group[] };

export function useGroups() {
  const api = useApi();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { groups: list } = await api.request<Response>('/api/groups');
      setGroups(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { groups, loading, error, refresh };
}
