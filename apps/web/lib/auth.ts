import { auth, clerkClient } from '@clerk/nextjs/server';

export type AuthedUser = {
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export async function requireUser(): Promise<AuthedUser> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return {
    clerk_id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? '',
    first_name: user.firstName ?? '',
    last_name: user.lastName ?? '',
  };
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
