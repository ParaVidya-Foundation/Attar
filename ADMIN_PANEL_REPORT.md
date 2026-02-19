# Admin Panel — Enterprise Rebuild Report

## 1. Created Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with 6 stat cards (products, orders, customers, revenue, orders today, revenue today) |
| `/admin/products` | Products table with search, pagination, toggle active, delete |
| `/admin/products/new` | Create new product form |
| `/admin/products/[id]` | Edit product form |
| `/admin/orders` | Orders table with status dropdown, Razorpay ID, pagination |
| `/admin/customers` | Customers table (email, total orders, total spent) grouped by email |
| `/admin/analytics` | Recharts bar charts: orders last 7 days, revenue last 7 days, top products |

---

## 2. Created Components

| Component | Path | Purpose |
|-----------|------|---------|
| Sidebar | `components/admin/Sidebar.tsx` | Collapsible nav: Dashboard, Products, Orders, Customers, Analytics |
| Header | `components/admin/Header.tsx` | Page title, admin email, Logout |
| DashboardStats | `components/admin/DashboardStats.tsx` | 6 stat cards using shadcn Card |
| ProductTable | `components/admin/ProductTable.tsx` | Products table with toggle, delete, edit |
| OrderTable | `components/admin/OrderTable.tsx` | Orders table with status select |
| CustomerTable | `components/admin/CustomerTable.tsx` | Customers by email with orders/spent |
| EmptyState | `components/admin/EmptyState.tsx` | Empty state for all pages |
| ProductForm | `components/admin/ProductForm.tsx` | Create/edit product form |
| AnalyticsCharts | `components/admin/AnalyticsCharts.tsx` | Recharts bar charts (client) |

### UI (shadcn-style)

| Component | Path |
|-----------|------|
| Card | `components/ui/card.tsx` |
| Badge | `components/ui/badge.tsx` |
| Skeleton | `components/ui/skeleton.tsx` |

---

## 3. Queries Implemented

**`lib/admin/queries.ts`** (uses `createAdminClient` — service role):

| Function | Purpose |
|----------|---------|
| `getDashboardStats()` | Total products, orders, customers, revenue, orders today, revenue today |
| `getProducts(page, search)` | Paginated products with optional name search |
| `getOrders(page)` | Paginated orders with user email from profiles |
| `getCustomers()` | Aggregated by email: total orders, total spent |
| `getSalesAnalytics()` | Orders/revenue last 7 days, top 10 products |
| `getCategories()` | All categories for product form |

**`lib/admin/productQueries.ts`**:

| Function | Purpose |
|----------|---------|
| `getProductById(id)` | Single product for edit form |

---

## 4. Server Actions

**`lib/admin/actions.ts`**:

| Action | Purpose |
|--------|---------|
| `createProduct(data)` | Insert product |
| `updateProduct(id, data)` | Update product |
| `toggleProductActive(id, isActive)` | Toggle product active flag |
| `deleteProduct(id)` | Soft delete (deleted_at) |
| `updateOrderStatus(orderId, status)` | Update order status |

---

## 5. Required DB Fields

From migrations `004_admin_extras.sql` and `005_admin_indexes.sql`:

**Products:** `category_id`, `is_active`, `original_price`, `stock`, `image_url`, `short_description`

**Orders:** Status enum includes `shipped`, `delivered`

**Profiles:** `email` (for customer list), `role` (user/admin)

**Indexes:** `idx_products_name`, `idx_orders_created_at_desc`

---

## 6. Middleware Status

**`middleware.ts`** — Active and working:
- Matches `/admin/:path*`
- Gets Supabase session
- Fetches profile `role`
- If not logged in or `role !== 'admin'` → redirect to `/`

---

## 7. Errors Fixed

- Replaced broken `adminFetchers.ts` / `adminActions.ts` with `queries.ts` / `actions.ts`
- Fixed Recharts Tooltip formatter type (`value: number | undefined`)
- Customers query: join orders + profiles to get email, aggregate by email
- Dashboard stats: added `ordersToday` and `revenueToday` (status='paid')

---

## 8. Pages That Fetch Real Data Successfully

| Page | Data Source | Status |
|------|-------------|--------|
| `/admin` | `getDashboardStats()` | ✓ |
| `/admin/products` | `getProducts()`, `getCategories()` | ✓ |
| `/admin/orders` | `getOrders()` | ✓ |
| `/admin/customers` | `getCustomers()` | ✓ |
| `/admin/analytics` | `getSalesAnalytics()` | ✓ |
| `/admin/products/new` | `getCategories()` | ✓ |
| `/admin/products/[id]` | `getProductById()`, `getCategories()` | ✓ |

---

## Environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for admin queries/actions)

## Make User Admin

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
```
