import Constants from 'expo-constants';

const DEFAULT_DEV_API_URL = 'http://10.0.2.2:3000';
const DEFAULT_PROD_API_URL = 'https://ownstore-api.onrender.com';

type EnvDict = Record<string, string | undefined>;
type ExtraDict = Record<string, unknown>;

const env: EnvDict = (() => {
  const runtimeProcess = (globalThis as any)?.process;
  if (runtimeProcess?.env) {
    return runtimeProcess.env as EnvDict;
  }
  return {};
})();

const expoConfigExtra = (Constants.expoConfig as { extra?: ExtraDict } | undefined)?.extra;
const manifestExtra = (Constants.manifest as { extra?: ExtraDict } | null)?.extra;
const extra: ExtraDict = { ...(manifestExtra ?? {}), ...(expoConfigExtra ?? {}) };

const firstDefined = (...values: Array<string | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

const getExtraString = (key: string): string | undefined => {
  const value = extra?.[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
};

const resolveDevApiUrl = (): string =>
  firstDefined(getExtraString('devApiUrl'), env.EXPO_PUBLIC_DEV_API_URL, env.EXPO_PUBLIC_API_URL, env.API_URL, DEFAULT_DEV_API_URL) as string;

const resolveProdApiUrl = (): string => {
  const explicit = firstDefined(
    getExtraString('prodApiUrl'),
    env.EXPO_PUBLIC_PROD_API_URL,
    env.EXPO_PUBLIC_API_URL,
    env.API_URL
  );

  if (explicit) {
    return explicit;
  }

  const fallback = DEFAULT_PROD_API_URL || resolveDevApiUrl();
  console.warn(
    'Production API URL not configured. Falling back to default production host. Set EXPO_PUBLIC_PROD_API_URL or EXPO_PUBLIC_API_URL to override.'
  );
  return fallback;
};

export const getApiUrl = () => {
  if (__DEV__) {
    return resolveDevApiUrl();
  }
  return resolveProdApiUrl();
};

export const getProductionApiUrl = () => resolveProdApiUrl();
