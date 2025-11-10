# 🎯 CURSOR - Next Actions

**Current Phase**: Phase 2 - Core Domains Implementation
**Priority**: HIGH
**Estimated Time**: 12-15 hours

---

## ✅ What's Done

- ✅ Infrastructure setup complete
- ✅ Product domain fully implemented (DDD pattern)
- ✅ Order domain fully implemented (DDD pattern)
- ✅ Customer domain fully implemented (DDD pattern)
- ✅ Analytics domain fully implemented (DDD pattern)
- ✅ Authentication system (JWT, middleware, signin)
- ✅ Tests at 92.5% passing (197/213)
- ✅ 0 linting errors, 0 TypeScript errors
- ✅ CI/CD pipeline ready

---

## 🚀 YOUR NEXT 3 TASKS

### Task 1: Implement Order Domain (6 hours)

**Pattern**: Copy the Product domain structure EXACTLY

**Steps**:

1. **Create Order Entity** (`src/domains/order-management/entities/Order.ts`)
```typescript
export class Order {
  constructor(
    public readonly id: string,
    public customerId: string,
    public items: OrderItem[],
    public total: number,
    public status: OrderStatus,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  addItem(item: OrderItem): void { /* ... */ }
  removeItem(itemId: string): void { /* ... */ }
  calculateTotal(): void { /* ... */ }
  updateStatus(newStatus: OrderStatus): void { /* ... */ }
}
```

2. **Create OrderRepository interface**
3. **Implement PostgresOrderRepository**
4. **Create use cases**: `CreateOrder`, `ProcessOrder`, `CancelOrder`
5. **Create API routes**: `/api/orders` (POST, GET, PATCH)

**Reference**: Look at `src/domains/product-catalog/` for exact structure

---

### Task 2: Implement Customer Domain (4 hours)

Follow same DDD pattern:

1. **Customer Entity** with validation methods
2. **CustomerRepository** interface
3. **PostgresCustomerRepository** implementation
4. **Use cases**: `RegisterCustomer`, `UpdateProfile`
5. **API routes**: `/api/customers`

---

### Task 3: Add Authentication Middleware (3 hours)

**File**: `src/infrastructure/auth/middleware.ts`

**Requirements**:
- JWT-based authentication
- Role-based access control (admin, customer, guest)
- Protect order and customer routes
- Keep product routes public (read-only)

**Reference**: See `../wiki/Autenticacion.md` for spec

---

## 📋 Checklist

Before moving to next task:

- [ ] All TypeScript types defined
- [ ] Repository follows interface pattern
- [ ] Business logic in Entity, not Repository
- [ ] Use case orchestrates repository calls
- [ ] API route uses use case (not repository directly)
- [ ] Tests written for entity business logic
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript passes (`npm run typecheck`)

---

## 🎯 Success Criteria

After these 3 tasks:
- ✅ 3 domains implemented (Product, Order, Customer)
- ✅ Authentication system working
- ✅ Protected routes functional
- ✅ Tests at 95%+ passing

---

## 💡 Tips

1. **Don't reinvent** - Copy Product domain structure exactly
2. **Test frequently** - Run `npm run typecheck` after each file
3. **One domain at a time** - Complete Order fully before Customer
4. **Ask if stuck** - Reference Product domain or ask Claude

---

## 📚 Resources

- Product Domain Example: `src/domains/product-catalog/`
- API Example: `app/api/products/route.ts`
- Test Example: `__tests__/unit/domains/product-catalog/Product.test.ts`
- Wiki: `../wiki/`

---

**When done with these 3 tasks, notify Claude for next phase planning**
