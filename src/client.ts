/**
 * HTTP client for the Rebillia REST API
 */
export default class RebilliaClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://api.rebillia.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
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

    throw new Error(
      `Rebillia API error (${response.status} ${response.statusText}): ${errorBody}`
    );
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.authenticate(),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * GET request against API root (no /v1). Use for endpoints like /globals/countries.
   */
  async getRoot<T = any>(endpoint: string): Promise<T> {
    const url = `${this.rootBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.authenticate(),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * POST request against API root (no /v1). Use for unversioned/internal endpoints.
   */
  async postRoot<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.rootBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.authenticate(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.authenticate(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: this.authenticate(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.authenticate(),
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    if (response.status === 204) {
      return {} as T;
    }
    return response.json() as Promise<T>;
  }
}
