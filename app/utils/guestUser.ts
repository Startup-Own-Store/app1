import { getApiUrl } from './firebaseSupabaseSync';

interface GuestUserRequest {
  currentId?: string | null;
  name?: string | null;
  phone?: string | null;
}

interface GuestUserResponse {
  userId: string;
  created: boolean;
}

const API_URL = getApiUrl();

const sanitize = (value?: string | null) => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const getOrCreateGuestUserId = async ({
  currentId,
  name,
  phone,
}: GuestUserRequest): Promise<string> => {
  const payload = {
    existingUserId: sanitize(currentId) ?? undefined,
    name: sanitize(name),
    phone: sanitize(phone),
  };

  try {
    const response = await fetch(`${API_URL}/app/api/register-guest-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message =
        errorPayload?.error ||
        errorPayload?.message ||
        `Guest user registration failed with status ${response.status}`;
      throw new Error(message);
    }

    const data = (await response.json()) as GuestUserResponse;
    if (!data?.userId) {
      throw new Error('Guest user response missing userId');
    }

    return data.userId;
  } catch (error: any) {
    const reason = error?.message || 'Unable to create guest user';
    throw new Error(reason);
  }
};
