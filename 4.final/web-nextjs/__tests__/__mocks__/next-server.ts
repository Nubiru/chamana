/**
 * Next.js Server Components Mock
 *
 * Provides mocks for Next.js server-side components and utilities.
 */

export class NextRequest {
  public url: string;
  public method: string;
  public headers: Headers;
  public nextUrl: URL;
  private _body: string | null;

  constructor(url: string, init?: RequestInit) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this._body = (init?.body as string) || null;
    this.nextUrl = new URL(url);
  }

  async json() {
    if (!this._body) {
      return {};
    }
    try {
      return JSON.parse(this._body);
    } catch (_error) {
      // Throw error to match real NextRequest behavior
      throw new Error('Invalid JSON');
    }
  }

  async text() {
    return this._body || '';
  }

  get body() {
    return this._body;
  }
}

export const NextResponse = {
  json: jest.fn((data: unknown, init?: ResponseInit) => {
    return {
      json: async () => data,
      status: init?.status || 200,
      statusText: init?.statusText || 'OK',
      headers: new Headers(init?.headers),
    };
  }),
  redirect: jest.fn((url: string) => ({
    status: 307,
    headers: { Location: url },
  })),
  next: jest.fn(() => ({
    status: 200,
  })),
};
