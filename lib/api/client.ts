const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  page?: number;
  pageSize?: number;
  total?: number;
}

interface PageData<T> {
  page: number;
  pageSize: number;
  total: number;
  list: T[];
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): URL {
    const normalizedBase = this.baseUrl.replace(/\/$/, '');
    const endpoint = `${normalizedBase}${path}`;

    const url = endpoint.startsWith('http')
      ? new URL(endpoint)
      : new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, params);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new ApiError(
        `请求失败: ${res.status} ${res.statusText}` + (errorText ? ` - ${errorText.replace(/\s+/g, ' ').slice(0, 200)}` : ''),
        res.status,
      );
    }

    const json = await res.json() as ApiResponse<T>;

    if (json.code === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new ApiError(json.message || '请先登录', 401);
    }

    if (json.code === 409) {
      throw new ApiError(json.message || '数据冲突', 409);
    }

    if (json.code !== 200) {
      throw new ApiError(json.message || '请求失败', json.code);
    }

    return json.data as T;
  }

  get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  // Backend returns flat format: {code,message,data:[...],page,pageSize,total}
  async getPage<T>(path: string, params?: Record<string, string | number | undefined>): Promise<PageData<T>> {
    const url = this.buildUrl(path, params);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url.toString(), { method: 'GET', headers });
    const json = await res.json();

    if (json.code === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new ApiError(json.message || '请先登录', 401);
    }
    if (json.code !== 200) {
      throw new ApiError(json.message || '请求失败', json.code);
    }

    return {
      page: json.page || 1,
      pageSize: json.pageSize || 10,
      total: json.total || 0,
      list: json.data || [],
    };
  }

  async download(path: string, filename: string, params?: Record<string, string | number | undefined>): Promise<void> {
    const url = this.buildUrl(path, params);

    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) throw new ApiError('下载失败', res.status);

    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }
}

class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

const client = new HttpClient(API_BASE);
export { client, ApiError };
export type { ApiResponse, PageData };
