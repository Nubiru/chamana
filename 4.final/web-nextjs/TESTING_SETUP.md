# Testing Setup Guide - Phase 4

**Status**: ✅ Test Suite Created  
**Coverage Target**: 80%+  
**Framework**: Jest + React Testing Library  

---

## Installation

**IMPORTANT**: You need to install testing dependencies manually:

```bash
cd 4.final/web-nextjs
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest \
  ts-jest
```

---

## Test Structure

```
__tests__/
├── __mocks__/              # Shared mocks
│   ├── db.ts              # Database pool mock
│   ├── fetch.ts           # Fetch API mock
│   └── next-server.ts    # Next.js server mocks
├── __helpers__/
│   └── test-utils.tsx     # Reusable test utilities
├── unit/                  # Fast unit tests
│   ├── lib/db/
│   │   ├── index.test.ts
│   │   └── views.test.ts
│   └── components/charts/
│       ├── LineChart.test.tsx
│       └── BarChart.test.tsx
└── integration/           # Integration tests
    ├── api/
    │   ├── test-db.test.ts
    │   ├── views.test.ts
    │   └── procedures/
    │       ├── procesar-pedido.test.ts
    │       ├── reabastecer-inventario.test.ts
    │       └── calcular-comision.test.ts
    └── pages/
        ├── dashboard.test.tsx
        ├── reportes.test.tsx
        └── procesos.test.tsx
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Tests in CI Mode
```bash
npm run test:ci
```

---

## Test Coverage

**Current Status**: Tests created, ready to run after dependency installation

**Coverage Targets**:
- Overall: 80%+
- API routes: 100%
- Database layer: 90%+
- Components: 80%+
- Pages: 70%+

---

## Test Files Created

### ✅ Infrastructure
- `jest.config.js` - Jest configuration with Next.js integration
- `jest.setup.js` - Test setup with global mocks
- `.jestignore` - Files to exclude from testing

### ✅ Mocks
- `__tests__/__mocks__/db.ts` - Database pool mock
- `__tests__/__mocks__/fetch.ts` - Fetch API mock
- `__tests__/__mocks__/next-server.ts` - Next.js server mocks
- `__tests__/__helpers__/test-utils.tsx` - Test utilities

### ✅ Unit Tests
- `__tests__/unit/lib/db/index.test.ts` - Database connection tests
- `__tests__/unit/lib/db/views.test.ts` - Database views tests
- `__tests__/unit/components/charts/LineChart.test.tsx` - LineChart component
- `__tests__/unit/components/charts/BarChart.test.tsx` - BarChart component

### ✅ Integration Tests
- `__tests__/integration/api/test-db.test.ts` - Database test API
- `__tests__/integration/api/views.test.ts` - Views API routes
- `__tests__/integration/api/procedures/procesar-pedido.test.ts` - Order processing
- `__tests__/integration/api/procedures/reabastecer-inventario.test.ts` - Inventory restocking
- `__tests__/integration/api/procedures/calcular-comision.test.ts` - Commission calculation
- `__tests__/integration/pages/dashboard.test.tsx` - Dashboard page
- `__tests__/integration/pages/reportes.test.tsx` - Reports page
- `__tests__/integration/pages/procesos.test.tsx` - Processes page

---

## Next Steps

1. **Install dependencies** (see Installation section above)
2. **Run tests**: `npm test`
3. **Check coverage**: `npm run test:coverage`
4. **Review coverage report**: Open `coverage/lcov-report/index.html`
5. **Add missing tests** if coverage is below 80%

---

## Troubleshooting

### Error: "Cannot find module 'jest'"
**Solution**: Install dependencies: `npm install --save-dev jest @testing-library/react ...`

### Error: "Cannot find module '@/lib/db'"
**Solution**: Ensure `jest.config.js` has correct `moduleNameMapper` (already configured)

### Error: "TextEncoder is not defined"
**Solution**: Already handled in `jest.setup.js`

### Tests fail with database connection errors
**Solution**: Database tests use real connections. Ensure PostgreSQL is running and `.env.local` is configured.

---

**Last Updated**: 2025-11-12  
**Status**: ✅ Test Suite Complete, Ready for Execution

