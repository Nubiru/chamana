// Mock TextEncoder/TextDecoder for Node.js environment
import { TextDecoder, TextEncoder } from 'node:util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library to reduce verbose output
configure({
  getElementError: (message, _container) => {
    // Return a concise error without the full HTML dump
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    return error;
  },
  // Reduce verbosity in error messages
  defaultHidden: true,
  // Suppress verbose HTML output in error messages
  testIdAttribute: 'data-testid',
});

// Mock window.matchMedia (used by some UI libraries)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver (used by some UI libraries)
global.IntersectionObserver = class IntersectionObserver {
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Suppress console errors in tests (optional, can be removed if you want to see errors)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };
