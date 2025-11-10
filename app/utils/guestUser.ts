import { getApiUrl, getProductionApiUrl } from './firebaseSupabaseSync';

interface GuestUserRequest {
  currentId?: string | null;
  name?: string | null;
  phone?: string | null;
}

interface GuestUserResponse {
  userId: string;
  created: boolean;
}

const getApiTargets = () => {
  const primary = getApiUrl();
  const fallback = getProductionApiUrl();
  if (primary === fallback) {
    return [primary];
  }
  return [primary, fallback];
};

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

  const targets = getApiTargets();
  let lastNetworkError: Error | null = null;
  let lastFailure: Error | null = null;

  for (let index = 0; index < targets.length; index += 1) {
    const baseUrl = targets[index];
    const isLastAttempt = index === targets.length - 1;

    try {
      const response = await fetch(`${baseUrl}/app/api/register-guest-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof responsePayload?.details === 'string' && responsePayload.details.trim().length > 0
            ? responsePayload.details.trim()
            : undefined;
        const message =
          responsePayload?.error ||
          responsePayload?.message ||
          `Guest user registration failed with status ${response.status}`;

        const serializedPayload =
          responsePayload && typeof responsePayload === 'object' && Object.keys(responsePayload).length > 0
            ? JSON.stringify(responsePayload)
            : undefined;

        if (!isLastAttempt && response.status >= 500) {
          console.warn(`Guest user registration failed at ${baseUrl}: ${message}. Retrying with fallback endpoint.`);
          continue;
        }

        lastFailure = new Error(
          detail ? `${message}: ${detail}` : serializedPayload ? `${message}: ${serializedPayload}` : message
        );
        break;
      }

      const data = responsePayload as GuestUserResponse;
      if (!data?.userId) {
        throw new Error('Guest user response missing userId');
      }

      return data.userId;
    } catch (error: any) {
      const reason = error?.message || 'Unable to create guest user';
      lastNetworkError = new Error(reason);
      console.warn(`Guest user registration network error via ${baseUrl}: ${reason}`);
      if (isLastAttempt) {
        break;
      }
    }
  }

  if (lastFailure) {
    throw lastFailure;
  }

  if (lastNetworkError) {
    throw lastNetworkError;
  }

  throw new Error('Unable to create guest user');
};
