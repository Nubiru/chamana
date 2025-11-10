// CRITICAL: Polyfills MUST be defined BEFORE any Next.js imports
// This file runs in setupFiles (before test environment setup)
// This ensures Request, Response, and Headers are available when Next.js modules load
// Order matters: Headers must be defined before Request/Response

// Polyfill for Headers (must be first, as Request/Response depend on it)
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = {};
      if (init instanceof Headers) {
        init.forEach((value, key) => {
          this._headers[key] = value;
        });
      } else if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers[key] = value;
        });
      }
    }
    get(name) {
      return this._headers[name.toLowerCase()] || null;
    }
    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }
    has(name) {
      return name.toLowerCase() in this._headers;
    }
    forEach(callback) {
      Object.entries(this._headers).forEach(([key, value]) => {
        callback(value, key, this);
      });
    }
  };
}

// Polyfill for Request (depends on Headers)
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init = {}) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body || null;
    }
    async json() {
      return this.body ? JSON.parse(this.body) : {};
    }
    async text() {
      return this.body || '';
    }
  };
}

// Polyfill for Response (depends on Headers)
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Headers(init.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }
  };
}
