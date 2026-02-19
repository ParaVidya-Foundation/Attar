# Account Section — Full Report

## Overview

The **Account** area is the customer account dashboard where logged-in users can manage their profile, view orders, and access support. It uses a two-column layout: a sidebar for navigation and a main area for content.

---

## Routes

| Route | Status | Purpose |
|-------|--------|---------|
| `/account` | ✓ Exists | Main account page — profile form |
| `/account/orders` | ✓ Exists | Orders page — placeholder only |
| `/account/address` | ✗ Not built | Linked in sidebar; no page yet |
| `/account/change-password` | ✗ Not built | Linked in profile form; no page yet |

---

## Pages

### 1. `/account` (Main Page)

**Purpose:** Customer profile and settings.

**Components:**
- **AccountSidebar** — Left navigation
- **AccountMain** — Right content (profile form)

**Behavior:**
- Renders a form with profile fields
- Uses `pageMetadata` for SEO (title, description)

---

### 2. `/account/orders`

**Purpose:** Order history.

**Current state:** Placeholder only — shows a single div with the text `OrdersPage`.

**Planned:** List and manage customer orders.

---

## Components

### AccountSidebar

**Role:** Account navigation and quick links.

**Content:**
- **Navigation links**
  - My account → `/account`
  - My orders → `/account/orders`
  - My address → `/account/address`
- **Active state** — Highlights the current page
- **Log out** — Link to `/logout`
- **Help block**
  - Support hours (Mon–Fri, 10am–6pm GMT)
  - Links to FAQs and Contact

**Behavior:**
- Uses `usePathname` for active link styling
- Responsive layout (sidebar on desktop, stacked on mobile)

---

### AccountMain

**Role:** Profile form and settings.

**Form fields:**
- **Title** — Select: Mr., Mrs., Ms., Mx., Dr.
- **First name**
- **Last name**
- **Phone**
  - Country code (+91, +44, +1)
  - Phone number
- **Birthday** — Date input
- **Email** — Read-only
- **Password** — With link to change password

**Behavior:**
- Local state only; no server integration yet
- Submit handler has a TODO for an API call; currently simulates a 600ms delay
- “Save updates” button with loading state
- Link to Privacy Policy and Terms & Conditions
- Link to `/account/change-password`

**UI:** Form styling matches the site theme.

---

### AccountHelp

**Role:** Customer support block.

**Content:**
- “A helping hand?” section
- Support hours
- Links to FAQs and Contact

**Status:** Defined but not used on the current account pages.

---

## Functionality Summary

| Feature | Implemented | Notes |
|---------|-------------|--------|
| Profile form UI | ✓ | Local state only; no save API |
| Orders list | ✗ | Placeholder only |
| Address management | ✗ | Only in navigation |
| Change password | ✗ | Only as link |
| Log out | Partial | Sidebar links to `/logout` (route not implemented) |
| Help / FAQs / Contact | ✓ | Links only |
| Auth protection | ✗ | Account pages not checked for login |

---

## Gaps

1. **No auth** — Anyone can open `/account`; no redirect to login.
2. **Profile not saved** — Form does not read from or write to Supabase.
3. **Orders page** — No order data or UI.
4. **Address page** — Not implemented.
5. **Change password** — Route/page missing.
6. **Logout** — `/logout` route not implemented; logout is handled via `UserMenu`.
7. **Contact** — `/contact` route not implemented.

---

## Data Model (Implicit)

Profile fields suggest expected data like:

- Title, first name, last name (from `profiles.full_name`)
- Phone
- Birthday (not in current `profiles` schema)
- Email (from auth)
- Password (handled via Supabase Auth)

---

## Entry Points

- **Header** — User icon / `UserMenu` → Account link
- **Footer** — Account link
- Direct URL — `/account`
