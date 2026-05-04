import { useAuth, useUser } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import type { Profile } from '@deckscores/shared';
import { useApi } from '@/lib/api';

type ProfileResponse = { profile: Profile | null };

export type ProfileFormInput = {
  first_name: string;
  last_name: string;
  email: string;
};

export function useProfile() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const api = useApi();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { profile: existing } = await api.request<ProfileResponse>('/api/profiles/me');
      setProfile(existing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  }, [api, isSignedIn]);

  useEffect(() => {
    if (isLoaded) void refresh();
  }, [isLoaded, refresh]);

  const save = useCallback(
    async (input: ProfileFormInput) => {
      const { profile: saved } = await api.request<ProfileResponse>('/api/profiles/me', {
        method: 'POST',
        body: input,
      });
      setProfile(saved);
      return saved;
    },
    [api],
  );

  const defaults: ProfileFormInput = {
    first_name: profile?.first_name ?? user?.firstName ?? '',
    last_name: profile?.last_name ?? user?.lastName ?? '',
    email: profile?.email ?? user?.primaryEmailAddress?.emailAddress ?? '',
  };

  return { profile, loading, error, refresh, save, defaults, isComplete: Boolean(profile) };
}
