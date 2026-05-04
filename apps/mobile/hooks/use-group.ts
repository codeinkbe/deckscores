import { useCallback, useEffect, useState } from 'react';
import type { Group } from '@deckscores/shared';
import { useApi } from '@/lib/api';

type Response = { group: Group };

export function useGroup(groupId: string | undefined) {
  const api = useApi();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const { group: doc } = await api.request<Response>(`/api/groups/${groupId}`);
      setGroup(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [api, groupId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { group, setGroup, loading, error, refresh };
}
