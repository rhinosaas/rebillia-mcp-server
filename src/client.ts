/**
 * HTTP client for the Rebillia REST API
 */
export default class RebilliaClient {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(apiKey: string, baseUrl: string = "https://api.rebillia.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeoutMs = Number.parseInt(process.env.REBILLIA_HTTP_TIMEOUT_MS ?? "20000", 10) || 20000;
  }

  /**
   * Root base URL without trailing /v1 (some endpoints like /globals/* are not versioned).
   */
  private rootBaseUrl(): string {
    return this.baseUrl.replace(/\/v1\/?$/, "");
  }

  /**
   * Authenticate API requests with X-AUTH-TOKEN header
   */
  private authenticate(): Record<string, string> {
    return {
      "X-AUTH-TOKEN": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Handle API errors with descriptive messages
   */
  private async handleError(response: Response): Promise<never> {
    let errorBody: string;
    try {
      errorBody = await response.text();
    } catch {
      errorBody = "Unable to read error response";
    }
    const maxErrorChars = 4000;
    const truncatedErrorBody =
      errorBody.length > maxErrorChars ? `${errorBody.slice(0, maxErrorChars)}... (truncated)` : errorBody;

    throw new Error(
      `Rebillia API error (${response.status} ${response.statusText}): ${truncatedErrorBody}`
    );
  }

  private isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
  }

  private async request<T = any>(url: string, init: RequestInit, allowNoContent: boolean = false): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers: this.authenticate(),
        signal: controller.signal,
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      if (allowNoContent && response.status === 204) {
        return {} as T;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (this.isAbortError(error)) {
        throw new Error(`Rebillia API request timed out after ${this.timeoutMs}ms: ${init.method ?? "GET"} ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, { method: "GET" });
  }

  /**
   * GET request against API root (no /v1). Use for endpoints like /globals/countries.
   */
  async getRoot<T = any>(endpoint: string): Promise<T> {
    const url = `${this.rootBaseUrl()}${endpoint}`;
    return this.request<T>(url, { method: "GET" });
  }

  /**
   * POST request against API root (no /v1). Use for unversioned/internal endpoints.
   */
  async postRoot<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.rootBaseUrl()}${endpoint}`;
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(
      url,
      {
      method: "DELETE",
      },
      true
    );
  }
}
