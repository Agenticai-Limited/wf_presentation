# **PRD — Mermaid-to-ReactFlow Flowchart Platform (SQLite Edition)**

## **1. Overview**

A lightweight internal platform allowing authenticated users to:

1. Create flowcharts using **Markdown + Mermaid** syntax
2. Save & manage multiple diagrams
3. Publish any diagram to a **shareable SSR-rendered React Flow page**
4. Store everything in a **single local SQLite database**—no external DB required

The system must be simple to deploy and run entirely on an EC2 instance with only Node.js.

---

## **2. Personas**

### **Admin User**

* Only one default user account exists
* No self-registration, no password reset flow
* Auth required for all internal routes (dashboard/editor)

### **Public Viewer**

* Anyone with the published URL can view the SSR-rendered graph
* No login required

---

## **3. System Architecture**

### **3.1 Stack**

* **Frontend:** React + Next.js (recommended: App Router)
* **Backend:** Next.js API routes (Node runtime)
* **Database:** SQLite (`data/db.sqlite`)
* **ORM:** Drizzle ORM (SQLite driver) or direct SQL

### **3.2 Key Capabilities**

* SSR rendering for published flowcharts
* Conversion pipeline: **Mermaid Markdown → Graph AST → React Flow**
* Clean, modern UI built with a UI library (shadcn/ui preferred)

---

## **4. Authentication**

### **4.1 Requirements**

* Login with email + password
* Only one admin user (seeded in DB on first run)
* Session-based auth (NextAuth, Iron Session, or custom)
* Logout supported
* No registration endpoint

---

## **5. Database Schema (SQLite)**

Database file:

```
/data/db.sqlite
```

### **5.1 `users` table**

| Field        | Type                | Notes       |
| ------------ | ------------------- | ----------- |
| id           | INTEGER PRIMARY KEY |             |
| email        | TEXT UNIQUE         | admin email |
| passwordHash | TEXT                | bcrypt hash |
| createdAt    | DATETIME            |             |

### **5.2 `flowcharts` table**

| Field       | Type                | Notes                    |
| ----------- | ------------------- | ------------------------ |
| id          | INTEGER PRIMARY KEY |                          |
| title       | TEXT                | flowchart title          |
| markdown    | TEXT                | mermaid markdown content |
| status      | TEXT                | "draft" or "published"   |
| publishedAt | DATETIME NULLABLE   |                          |
| createdAt   | DATETIME            |                          |
| updatedAt   | DATETIME            |                          |

*No versioning needed in MVP.*

---

## **6. Dashboard**

Authenticated UI showing all flowcharts.

### **6.1 Flowchart List**

* Title
* Last Updated Time
* Status (Draft / Published)
* Actions:

  * Edit
  * Publish
  * Delete

### **6.2 Create New Flowchart**

* Button: “New Flowchart”
* Creates a draft and opens editor

---

## **7. Flowchart Editor**

### **7.1 Layout**

Two-column layout:

**Left:** Markdown editor
**Right:** Live Mermaid preview

### **7.2 Functionality**

* Markdown input with syntax highlighting
* Real-time Mermaid rendering
* Error-friendly parsing (show warnings inline)
* Title input
* Manual **Save** + Auto-save
* Publish button

### **7.3 Text Format Support**

* Mermaid `flowchart TD`
* Mermaid `flowchart LR`
* Other Mermaid types are out of scope for MVP

---

## **8. Publishing Flowcharts (SSR)**

When user clicks “Publish”:

### **8.1 A public URL is generated:**

```
/p/{flowchartId}
```

### **8.2 SSR Requirements**

* Server fetches data from SQLite
* Convert Mermaid → Graph structure
* Render using **React Flow**
* Must be fully server-rendered
* Public, no auth required

### **8.3 Published Page UI**

* Modern flowchart visualization
* Smooth edges
* Pan / Zoom
* Fit-to-view button
* Read-only
* Responsive

### **8.4 SEO Metadata**

* `<title>{flowchart.title}</title>`
* OG preview tags (optional)

---

## **9. Non-Functional Requirements**

### **9.1 Performance**

* Entire publish page must SSR render within 100–300 ms
* SQLite must run in same process (no external services)

### **9.2 Security**

* Protect dashboard & editor using auth middleware
* Published page is public
* Escape Markdown input where necessary to avoid XSS
* Strict Content Security Policy (optional)

### **9.3 Deployment**

Deployment is *not included in PRD* (user handles EC2).
The system must run via:

```
node server.js
```

or:

```
next start
```

No external DB or services required.

---

## **10. User Journeys**

### **10.1 Create a Flowchart**

1. Login
2. Dashboard → “New Flowchart”
3. Write Mermaid Markdown
4. Save
5. Publish
6. Copy public URL

### **10.2 Update a Flowchart**

1. Dashboard → Select
2. Edit contents
3. Save
4. Publish → replaces previous published version

### **10.3 View Public Flowchart**

1. Visit `/p/{id}`
2. See SSR-rendered React Flow diagram

---

## **11. UI / UX Requirements**

### **11.1 General**

* Clean, minimal UI
* Light theme preferred
* Use shadcn/ui or similar modern library
* Smooth transitions

### **11.2 Editor**

* Large editor area
* Live preview panel
* Error messages for invalid Mermaid
* Sticky actions (Save / Publish)

### **11.3 Dashboard**

* Table or card layout
* Title, timestamps, status
* Clear CTAs

### **11.4 Published Page**

* Full-screen ReactFlow canvas
* Stylish node appearance
* Hover highlights
* Fit-to-screen button
* Pan / zoom
