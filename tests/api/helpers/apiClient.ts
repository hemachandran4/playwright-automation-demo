import { APIRequestContext, expect } from '@playwright/test';

export class APIClient {
  private request: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: Record<string, string> = {};

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  setHeader(key: string, value: string) {
    this.defaultHeaders[key] = value;
  }

  private getFullURL(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
    };
  }

  async get(endpoint: string) {
    const response = await this.request.get(this.getFullURL(endpoint), {
      headers: this.getHeaders(),
    });
    return new APIResponse(response);
  }

  async post(endpoint: string, data?: any) {
    const response = await this.request.post(this.getFullURL(endpoint), {
      data,
      headers: this.getHeaders(),
    });
    return new APIResponse(response);
  }

  async put(endpoint: string, data?: any) {
    const response = await this.request.put(this.getFullURL(endpoint), {
      data,
      headers: this.getHeaders(),
    });
    return new APIResponse(response);
  }

  async delete(endpoint: string) {
    const response = await this.request.delete(this.getFullURL(endpoint), {
      headers: this.getHeaders(),
    });
    return new APIResponse(response);
  }

  async patch(endpoint: string, data?: any) {
    const response = await this.request.patch(this.getFullURL(endpoint), {
      data,
      headers: this.getHeaders(),
    });
    return new APIResponse(response);
  }
}

export class APIResponse {
  private response: any;

  constructor(response: any) {
    this.response = response;
  }

  getStatus(): number {
    return this.response.status();
  }

  async getJSON(): Promise<any> {
    return await this.response.json();
  }

  async getText(): Promise<string> {
    return await this.response.text();
  }

  getHeaders(): Record<string, string> {
    return this.response.headers();
  }

  async expectStatus(statusCode: number) {
    expect(this.getStatus()).toBe(statusCode);
    return this;
  }

  async expectJSONSchema(schema: any) {
    const json = await this.getJSON();
    // Simple schema validation - can be extended with joi, ajv, etc.
    Object.keys(schema).forEach(key => {
      expect(json).toHaveProperty(key);
    });
    return this;
  }
}