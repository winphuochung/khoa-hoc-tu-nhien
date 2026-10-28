import { handleLocalApiRequest, buildLocalCsvForExam } from './localFallbackEngine';

const TOKEN_STORAGE_KEY = 'khtn9_auth_token';

let useLocalEngineOnly = false;

export function getStoredToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

  if (isFileProtocol || useLocalEngineOnly) {
    // If opened directly via file:// in Edge/Chrome, try localhost:3000 briefly first unless already in local mode
    if (!useLocalEngineOnly) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 800);
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`http://localhost:3000${path}`, {
          ...options,
          headers,
          signal: controller.signal,
        });
        clearTimeout(timer);
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || `Lỗi máy chủ (${response.status})`);
        }
        return json.data as T;
      } catch (err: any) {
        // If it's a real application error from the server (not network failure), throw it
        if (err?.message && !err.message.includes('Failed to fetch') && err.name !== 'AbortError') {
          throw err;
        }
        useLocalEngineOnly = true;
      }
    }
    return handleLocalApiRequest<T>(path, options, token);
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(path, {
      ...options,
      headers,
    });

    const json = await response.json().catch(() => null);
    if (!json) {
      // Fallback to local engine if static server doesn't have /api
      useLocalEngineOnly = true;
      return handleLocalApiRequest<T>(path, options, token);
    }

    if (!response.ok || !json.success) {
      throw new Error(json.error || `Lỗi máy chủ (${response.status})`);
    }

    return json.data as T;
  } catch (err: any) {
    if (err?.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      useLocalEngineOnly = true;
      return handleLocalApiRequest<T>(path, options, token);
    }
    throw err;
  }
}

export function getCsvDownloadUrl(examId: string): string {
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
  if (isFileProtocol || useLocalEngineOnly) {
    const csvContent = buildLocalCsvForExam(examId);
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  }
  const token = getStoredToken();
  return `/api/exams/${encodeURIComponent(examId)}/export-csv?token=${encodeURIComponent(token)}`;
}
