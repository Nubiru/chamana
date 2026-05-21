/**
 * Jest Type Definitions
 *
 * Provides type definitions for Jest globals used in test files.
 */

import '@testing-library/jest-dom';

declare global {
  var jest: typeof import('jest');
}
