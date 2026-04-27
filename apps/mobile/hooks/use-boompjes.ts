import { useCallback, useEffect, useState } from 'react';
import type { Boompje, BoompjeStatus } from '@cardapp/shared';
import { useApi } from '@/lib/api';

type Response = { boompjes: Boompje[] };

export function useBoompjes(status?: BoompjeStatus) {
  const api = useApi();
  const [boompjes, setBoompjes] = useState<Boompje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { boompjes: list } = await api.request<Response>('/api/boompjes', {
        searchParams: { status },
      });
      setBoompjes(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [api, status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { boompjes, loading, error, refresh };
}
