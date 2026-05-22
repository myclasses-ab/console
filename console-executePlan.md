# Institute Console App — Build Prompt

## Goal
Build a separate **Institute Console / Admin Dashboard** app where coaching institutes can log in and manage everything related to their institute profile, branches, courses, faculty, results, reviews, inquiries, media, and more.

This is a **standalone Vite + React 19 + TypeScript** app. It lives in its own directory, separate from the existing Next.js frontend.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build Tool | Vite 6 |
| Framework | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (or Radix UI primitives) |
| Icons | lucide-react |
| State Management | Zustand |
| HTTP Client | Axios |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| Charts | Recharts (for analytics) |
| Toast Notifications | sonner |
| Tables | TanStack Table (for lists) |

---

## Backend Context (CRITICAL — Read Before Building)

The backend is a **Spring Boot 4.0.5** app at `http://localhost:8080/api`.

### Authentication Status
**THERE IS NO AUTH SYSTEM YET.** The backend has:
- NO Spring Security
- NO JWT
- NO login/register endpoints
- NO password encryption
- NO role-based access control

**YOU MUST BUILD THE BACKEND AUTH FIRST.** Before writing any frontend code:

1. Add Spring Security + JWT dependencies to `Backend/pom.xml`
2. Create `AuthController` with `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/refresh` endpoints
3. Create JWT filter and security config
4. Add `password` field to `User` entity (plain text for now, or BCrypt if easy)
5. Seed at least one `INSTITUTE_ADMIN` user in the DB
6. The existing `UserInstituteAssociation` entity links users to institutes with roles (`OWNER`, `ADMIN`, `STAFF`). Use this to determine which institute(s) the logged-in user can manage.

### Existing API Patterns
Every controller follows this exact pattern:
- `POST /` — Create
- `POST /bulk` — Bulk create
- `GET /{identifier}` — Get by ID
- `GET /` — Get ALL
- `DELETE /{identifier}` — Delete

**NO PUT/UPDATE ENDPOINTS EXIST.** You must add `PUT /{identifier}` endpoints to EVERY controller that the console needs to update. The console is primarily an UPDATE tool.

### Axios Setup
The console app uses a shared axios instance pointing to `http://localhost:8080/api` with:
- `Authorization: Bearer <token>` header from `localStorage.getItem('authToken')`
- 401 handler that redirects to `/login`

---

## Console App Feature Breakdown

### Phase 1: Foundation (Auth + Layout)

**Login Page**
- Clean, centered login form
- Email + password fields
- "Remember me" checkbox (stores token in localStorage)
- Link to "Forgot password" (placeholder)
- Beautiful gradient background, subtle animations

**App Shell / Layout**
- Collapsible sidebar navigation on desktop
- Bottom tab bar on mobile
- Top header with:
  - Institute name + logo
  - Notification bell with badge
  - User avatar dropdown (profile, logout)
- Breadcrumb navigation
- Page transition animations (Framer Motion)

**Sidebar Navigation Items:**
1. Dashboard (home icon)
2. Institute Profile (building icon)
3. Branches (map-pin icon)
4. Courses (book-open icon)
5. Batches (calendar icon)
6. Faculty (users icon)
7. Results & Awards (trophy icon)
9. Reviews & Responses (message-square icon)
10. Inquiries / Leads (mail icon)
11. Media Gallery (image icon)
12. FAQs (help-circle icon)
13. Facilities (shield icon)
14. Subscription (credit-card icon)
15. Settings (settings icon)

---

### Phase 2: Dashboard

- **Stats Cards** (top row): Total Courses, Active Batches, Total Faculty, Total Students, Pending Inquiries, Average Rating, Total Reviews
- **Recent Inquiries** table (last 5)
- **Recent Reviews** list with rating
- **Quick Actions** buttons: Add Course Offering, Add Batch, Add Faculty, Upload Media
- **Subscription Status** card with expiry date and upgrade CTA
- Use Recharts for a simple line chart of inquiries over last 30 days

---

### Phase 3: Institute Profile

A beautiful form to edit ALL Institute fields:
- **Basic Info**: Name, Tagline, Short Description, Description, Founded Year
- **Contact**: Email, Phone Primary, Phone Secondary, WhatsApp
- **Type**: Institute Type (Offline/Online/Hybrid dropdown), Ownership Type
- **Social Links**: Facebook, Instagram, YouTube, Twitter, LinkedIn
- **Branding**: Logo URL, Banner URL, Website URL
- **SEO**: Meta Title, Meta Description
- **Stats**: Years of Experience, Total Students Enrolled (these are self-reported)
- Save with loading state and toast notification

---

### Phase 4: Branches Management

- **List View**: Table with Name, City, Address, Is Main Branch, Status, Actions
- **Add Branch**: Modal form with all Branch fields
  - Name, Address Line 1/2, Landmark
  - City selector (fetch from `/api/cities`)
  - State, Pincode
  - Latitude/Longitude (optional, with "Get from address" button)
  - Google Maps URL
  - Phone, Email
  - Operating Hours (time pickers), Operating Days (checkboxes: Mon-Sun)
  - Total Area, Total Classrooms, Seating Capacity
  - Is Main Branch toggle, Is Online Only toggle
- **Edit Branch**: Same form pre-filled
- **Delete Branch**: Confirmation modal

---

### Phase 5: Courses Management

**Important**: The console manages `InstituteCourse` (the junction entity), not `Course` (the template).

- **List View**: Table with Custom Name, Branch, Fee Range, Admission Open, Active
- **Add Institute Course**:
  - Select Branch (dropdown from institute's branches)
  - Custom Name (override)
  - Fee Min / Fee Max (₹ inputs)
  - Fee Description (rich text or textarea)
  - Scholarship toggle + details
  - Duration (months), Batch Size Max
  - Toggles: Study Material Included, Test Series Included, Online Classes Available, Recorded Lectures Available
  - Admission Open toggle
  - Next Batch Start Date (date picker)
- **Edit / Delete** same patterns

---

### Phase 6: Batches Management

- **List View**: Table with Name, Course, Mode, Timing, Start Date, Seats, Status
- **Add Batch**:
  - Select Institute Course (dropdown)
  - Select Branch (dropdown)
  - Name
  - Standard (dropdown: 10, 11, 12, Dropper, etc.)
  - Mode (Offline/Online/Hybrid)
  - Timing (Morning/Afternoon/Evening/Weekend/Flexible)
  - Start Time / End Time (time pickers)
  - Days of Week (checkboxes)
  - Start Date / End Date (date pickers)
  - Fee (₹ input)
  - Total Seats / Available Seats
  - Language of Instruction
  - Description
  - Toggles: Is Ongoing, Admission Open, Is Active
- **Edit / Delete**

---

### Phase 7: Faculty Management

- **List View**: Table with Photo, Name, Designation, Experience, Rating, Active
- **Add Faculty**:
  - Name, Photo URL, Designation
  - Qualification, Experience Years
  - Bio (textarea), Specialization (textarea)
  - Achievements, Former Institutes
  - Toggles: IIT/IIM Background, NIT Background
  - Student Rating
  - Display Order (number)
  - Subjects taught (multi-select from `/api/subjects`)
  - Exam Types (multi-select from `/api/exam-types`)
- **Edit / Delete**

---

### Phase 8: Results & Awards

**Results Tab:**
- List of student results with student name, exam, year, rank/score
- Add Result form with all Result fields
- Mark as Featured / Verified toggles

**Awards Tab:**
- List of awards with title, issuing body, year
- Add Award form with all AwardAndRecognition fields
- Upload certificate URL

---

### Phase 9: Reviews & Responses

- **Reviews List**: Table with reviewer, rating, text, status, date
- Filter by status: All / Pending / Approved / Rejected
- Click a review to see full details with all 7 rating dimensions
- **Respond to Review**: Textarea to write an official institute response
- View existing responses

---

### Phase 11: Inquiries / Leads

- **List View**: Table with Name, Email, Phone, Course, Status, Date
- Filters: Status (NEW, CONTACTED, FOLLOW_UP, ENROLLED, NOT_INTERESTED, DROPPED)
- **Lead Detail**: Side panel or modal showing full inquiry details
- **Update Status**: Dropdown to change status
- **Add Notes**: Textarea for institute notes
- **Assign**: Dropdown to assign to staff member

---

### Phase 12: Media Gallery

- **Grid View**: Image/video cards with caption, entity type
- **Upload**: Modal with URL input or drag-drop (if file upload backend exists, else URL only)
- Fields: URL, Thumbnail URL, Caption, Alt Text, Entity Type, Is Featured, Display Order
- **Edit / Delete**

---

### Phase 13: FAQs

- **List View**: Accordion-style list of Q&A
- **Add FAQ**: Question + Answer textareas, Display Order, Is Active toggle
- **Edit / Delete / Reorder**

---

### Phase 14: Facilities

- **Form View**: All 18 boolean facility toggles as clean switch/checkbox grid
  - Library, Hostel, Canteen, Transport, AC Classrooms, Digital Boards, Laboratory, Study Room, WiFi, CCTV, Online Portal, Doubt Sessions, Mock Test Series, Study Material, Crash Courses, Scholarship Program, Free Demo Class, Parent Teacher Meetings, Performance Tracking
- Student-to-Teacher Ratio input
- Notes textarea

---

### Phase 15: Subscription

- **Current Plan Card**: Plan name, price, features, expiry date
- **Feature Limits**: Branches used / max, Courses used / max, Faculty used / max, Media used / max
- **Upgrade CTA**: Link to subscription plans (read-only for now)

---

### Phase 16: Settings

- **Profile**: Edit logged-in user's name, email, phone, avatar
- **Change Password**: Current + New + Confirm
- **Institute Association**: View role (OWNER/ADMIN/STAFF)
- **Notifications**: Toggle email/push preferences (placeholder)

---

## Design Guidelines (TOP PRIORITY)

1. **Beautiful but Simple**: Clean whites, subtle grays, one accent color (the primary `#4f46e5`). No gradients in the dashboard itself (save those for marketing pages).
2. **Card-based UI**: Every section uses rounded-2xl white cards with subtle borders and soft shadows.
3. **Consistent spacing**: Use a strict 4px/8px/16px/24px/32px spacing scale.
4. **Form fields**: Floating labels or clean bordered inputs. Every form has clear labels, helper text, and validation errors.
5. **Loading states**: Skeleton loaders for tables, spinners for buttons, shimmer for cards.
6. **Empty states**: Beautiful illustrations (or icon + text) when no data exists, with a clear CTA to add.
7. **Toast notifications**: Success/error toasts for every CRUD operation using `sonner`.
8. **Modals**: For add/edit operations. Full-screen drawer on mobile.
9. **Tables**: Sortable columns, search filter, pagination (client-side for now).
10. **Responsive**: Sidebar collapses to hamburger on tablet, bottom nav on mobile. All forms work on mobile.
11. **Dark mode**: Not required for v1.
12. **Animations**: Framer Motion for page transitions, modal open/close, list item entrance.

---

## Data Architecture

### Types
Copy ALL types from `frontend/types/` in the main app. They map 1:1 to backend entities. No need to recreate — copy the entire `types/` folder into the new console app.

### APIs
Copy ALL API modules from `frontend/api/` in the main app. They already point to the correct backend. Add `update` methods to every API module:

```typescript
update: async (identifier: string, data: Partial<Entity>): Promise<Entity> => {
  const response = await axios.put<Entity>(`/endpoint/${identifier}`, data);
  return response.data;
},
```

You will need to add corresponding `PUT` endpoints in the Spring Boot controllers.

### Auth Context
Create a React Context (`AuthContext`) that:
- Stores `user`, `token`, `isLoading` state
- Provides `login(email, password)`, `logout()`, `isAuthenticated`
- On mount, checks `localStorage` for token and calls `/api/auth/me` to restore session
- Exposes `user.institutes` (from `UserInstituteAssociation` lookup)

### Institute Context
Create an `InstituteContext` that:
- Holds the currently selected institute (for users with multiple)
- Fetches full institute data on selection
- Provides `refreshInstitute()` to reload data after updates

---

## Backend Changes Required

### 1. Authentication Module (NEW)
- `pom.xml`: Add `spring-boot-starter-security`, `jjwt-api`, `jjwt-impl`, `jjwt-jackson`
- `config/SecurityConfig.java`: Permit all OPTIONS, permit `/api/auth/**`, require auth for everything else
- `Controller/auth/AuthController.java`:
  - `POST /api/auth/login` → returns `{ token, user }`
  - `POST /api/auth/register` → creates user with `INSTITUTE_ADMIN` role
  - `GET /api/auth/me` → returns current user from JWT
- `Service/auth/JwtService.java`: Generate/validate JWT tokens
- `filter/JwtAuthFilter.java`: Extract token, validate, set SecurityContext

### 2. Add PUT Endpoints to ALL Controllers
Every controller needs:
```java
@PutMapping("/{identifier}")
public ResponseEntity<?> update(@PathVariable String identifier, @RequestBody Entity entity) {
    // Load existing, merge fields, save
}
```
Add to: Institute, Branch, InstituteFacility, InstituteCourse, Batch, Faculty, Result, AwardAndRecognition, Review, InstituteResponse, Media, Faq, Notification, SubscriptionPlan, InstituteSubscription, Inquiry, User, UserInstituteAssociation, Bookmark.

### 3. Add Login Fields to User Entity
Add `password` field (String, 500 chars) to `User` entity. Consider BCrypt encoding in the service layer.

---

## File Structure (Console App)

```
institute-console/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                    # Tailwind + custom properties
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components (Button, Card, Input, Dialog, etc.)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopHeader.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── AppShell.tsx
│   │   ├── forms/
│   │   │   ├── InstituteForm.tsx
│   │   │   ├── BranchForm.tsx
│   │   │   ├── CourseForm.tsx
│   │   │   ├── BatchForm.tsx
│   │   │   ├── FacultyForm.tsx
│   │   │   ├── ResultForm.tsx
│   │   │   ├── AwardForm.tsx
│   │   │   ├── MediaForm.tsx
│   │   │   ├── FaqForm.tsx
│   │   │   ├── ResponseForm.tsx
│   │   │   └── FacilityForm.tsx
│   │   ├── data-table/
│   │   │   └── DataTable.tsx        # Reusable TanStack Table wrapper
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── StatCard.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── InstituteProfilePage.tsx
│   │   ├── BranchesPage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── BatchesPage.tsx
│   │   ├── FacultyPage.tsx
│   │   ├── ResultsPage.tsx
│   │   ├── ReviewsPage.tsx
│   │   ├── InquiriesPage.tsx
│   │   ├── MediaPage.tsx
│   │   ├── FaqsPage.tsx
│   │   ├── FacilitiesPage.tsx
│   │   ├── SubscriptionPage.tsx
│   │   └── SettingsPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useInstitute.ts
│   │   ├── useBranches.ts
│   │   ├── useCourses.ts
│   │   ├── useBatches.ts
│   │   ├── useFaculty.ts
│   │   ├── useResults.ts
│   │   ├── useReviews.ts
│   │   ├── useInquiries.ts
│   │   ├── useMedia.ts
│   │   ├── useFaqs.ts
│   │   └── useFacilities.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── InstituteContext.tsx
│   ├── api/
│   │   ├── axios-helper.ts
│   │   ├── auth.ts                  # NEW: login, register, me
│   │   ├── index.ts
│   │   ├── institute/
│   │   ├── course/
│   │   ├── faculty/
│   │   ├── ... (copy from main frontend)
│   │   └── master/
│   ├── types/                       # COPY from main frontend/types/
│   ├── store/
│   │   └── uiStore.ts               # Sidebar state, theme, etc.
│   └── lib/
│       └── utils.ts                 # cn() helper, formatters
├── index.html
├── vite.config.ts
├── tailwind.config.ts (or CSS-based config for v4)
├── tsconfig.json
├── package.json
└── README.md
```

---

## Implementation Order

1. **Bootstrap the Vite app** with React + TS + Tailwind
2. **Backend: Add Spring Security + JWT** (AuthController, filters, JWT service)
3. **Backend: Add `password` to User entity** and seed an admin user
4. **Backend: Add PUT endpoints** to all controllers the console needs
5. **Console: Copy types + APIs** from main frontend, add `update` methods
6. **Console: Build AuthContext + LoginPage**
7. **Console: Build AppShell** (sidebar, header, routing)
8. **Console: Build Dashboard** (stats, quick actions)
9. **Console: Build Institute Profile** (full edit form)
10. **Console: Build Branches, Courses, Batches** (the core operational data)
11. **Console: Build Faculty, Results**
12. **Console: Build Reviews, Inquiries** (engagement features)
13. **Console: Build Media, FAQs, Facilities**
14. **Console: Build Subscription, Settings**
15. **Polish**: Animations, loading states, empty states, responsive, error handling

---

## Key UX Decisions

- **Single institute view**: The console shows ONE institute at a time. If the user manages multiple institutes, add a dropdown in the header to switch.
- **Auto-save vs manual**: Use manual save with a prominent "Save Changes" button. Show unsaved changes indicator.
- **Delete confirmations**: Always use a modal with the item name displayed. "Are you sure you want to delete 'JEE Advanced Batch 2026'? This action cannot be undone."
- **Success feedback**: Toast on every successful save/create/delete.
- **Error handling**: Form-level validation (Zod) + API error display inline + fallback toast for unexpected errors.
- **Permission awareness**: OWNER sees everything. ADMIN sees everything except "Delete Institute" and "Manage Staff". STAFF sees limited sections (hide Settings, Subscription, Staff management).

---

## Environment Variables

```env
VITE_API_URL=http://localhost:8080/api
```

---

## Notes

- The existing `frontend/` app is the PUBLIC-FACING student discovery app. This console is a SEPARATE app for INSTITUTE OWNERS/STAFF.
- Both apps share the SAME backend. The backend must serve both.
- CORS is already configured in the backend to allow `localhost:3000` and `localhost:5173`.
- For media uploads: The backend currently only accepts URLs, not file uploads. If you want real uploads, add a file storage service (AWS S3, Cloudinary, or local storage). For v1, URL input is fine.
- The `averageRating`, `totalReviews` fields on Institute are computed by the backend from Review data. Do not let the console edit these directly.
- The `isVerified` and `isFeatured` flags on Institute are admin-controlled (super admin). The console should show them as read-only badges.
