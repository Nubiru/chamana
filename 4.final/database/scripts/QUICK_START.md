# Quick Start - Run Database Migration Scripts

## 🚀 Fast Track (5 minutes)

### Step 1: Install Dependencies

```bash
cd 4.final/database/scripts
npm install
```

### Step 2: Run All Scripts

```bash
npm run migrate
```

That's it! All 5 scripts will run in order.

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot find module 'bcrypt'"

**Solution**:
```bash
npm install
```

### ❌ Error: "authentication failed for user postgres"

**Solution**: Update password in `00_db.js` (line 25):

```javascript
fase3: {
  password: 'root',  // ← Change this to YOUR PostgreSQL password
}
```

### ❌ Error: "connection refused"

**Solution**: Start PostgreSQL:
```bash
net start postgresql-x64-17
```

### ❌ Error: "relation already exists"

**This is OK** - it means the script already ran successfully. You can:
- Ignore it (safe)
- OR re-run with DROP statements first

---

## ✅ Verification

After scripts complete, verify in psql:

```sql
-- Connect to database
psql -U postgres -d chamana_db_fase3

-- Check everything was created
SELECT
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as indexes,
  (SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'public') as mat_views,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'usuarios') as auth_tables,
  (SELECT COUNT(*) FROM information_schema.views WHERE table_name LIKE 'vista_%') as views;
```

**Expected**:
- indexes: 23+
- mat_views: 4
- auth_tables: 1 (usuarios exists)
- views: 10+

---

## 📋 What Was Created

- ✅ **23 indexes** for performance
- ✅ **5 optimized views** (better JOINs)
- ✅ **4 materialized views** (pre-calculated)
- ✅ **5 auth tables** (usuarios, roles, permisos, etc.)
- ✅ **5 new BI views** (category, season, trends, etc.)

**Total**: 37 database objects added to Phase 3 database.

---

## 🎯 Next Steps

After migration complete:

1. ✅ Database migration done
2. ⏭️ Go to `4.final/web-nextjs/` folder
3. ⏭️ Run `npm install chart.js react-chartjs-2 react-csv`
4. ⏭️ Run `npm run dev`
5. ⏭️ Follow [DEVELOPMENT_CHECKLIST.md](../DEVELOPMENT_CHECKLIST.md)

---

**All set!** Your database is now optimized for Phase 4.
