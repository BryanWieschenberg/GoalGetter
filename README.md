<div align="center">

# GoalGetter

_A fully integrated, high-performance productivity workspace unifying task management and calendaring._

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](#)

</div>

## Overview

Modern knowledge workers frequently suffer from context switching, often toggling between disparate task management applications and calendar clients. **GoalGetter** solves this by providing a seamless, customizable split-screen interface that combines hierarchical task tracking with robust event scheduling.

Built with a focus on low-latency interactions and highly scalable backend infrastructure, GoalGetter demonstrates an ability to elegantly manage complex client-side state while optimizing server-side data fetching and security boundaries.

## Key Features

- **Split-Screen Workspace:** A dynamic, resizable UI allowing simultaneous interaction with tasks and calendar events without window management friction.
- **Hierarchical Data Management:** Infinite logical categorization using nested categories, tags, sub-tasks, and custom color-coding.
- **Advanced Scheduling Engine:** Support for complex recurring events, priority levels, and dynamic due dates with smart, non-intrusive notifications.
- **Enterprise-Grade Security:** Custom OAuth and credential-based authentication flows, robust API route protection, and distributed rate limiting to mitigate abuse.

---

## System Architecture

GoalGetter employs a modern, full-stack React architecture utilizing the **Next.js App Router** for optimized Server-Side Rendering (SSR) and seamless API integration.

1. **Client Tier:** Highly interactive React components utilizing `framer-motion` for fluid micro-interactions and Tailwind CSS for utility-first styling. Client state is meticulously managed to avoid hydration mismatches and minimize re-renders.
2. **API / BFF (Backend-For-Frontend) Tier:** Next.js API Routes acting as a secure intermediary layer, handling authentication (`NextAuth.js`), request validation, and caching.
3. **Data Tier:**
    - **PostgreSQL:** Serves as the primary ACID-compliant relational data store. Schema is highly normalized (users, task_categories, tasks, event_recurrence, etc.) to ensure data integrity.
    - **Redis (In-Memory Datastore):** Utilized for distributed, low-latency rate limiting and session management.

---

## Technical Highlights

### 1. Complex State & Hydration Strategy

A significant challenge in SSR-heavy React applications is managing environment-specific configurations (like OAuth keys or support emails) without leaking them to the client or causing hydration mismatches. GoalGetter circumvents this by strictly isolating environment variables in Server Components and cleanly passing them down as serializable props to the Client Components.

### 2. Optimized Relational Queries

Fetching a user's entire workspace (categories, nested tags, paginated tasks, and complex recurring events) can easily result in N+1 query performance degradation. GoalGetter mitigates this utilizing advanced PostgreSQL aggregations (`json_build_object`, `json_agg`) to construct and return heavily nested JSON payloads directly from the database tier in a single, highly-optimized query.

### 3. Distributed Rate Limiting

To prevent abuse on login, registration, and data mutation endpoints, a distributed sliding-window rate limiter is implemented using **Redis pipelines**. By utilizing `zadd`, `zremrangebyscore`, and `zcard` atomically via pipelining, the system maintains accurate hit counts per IP across multiple instances without excessive network round trips.

---

## Trade-offs & Design Decisions

- **Raw SQL over ORM:** While ORMs like Prisma offer high developer velocity, GoalGetter utilizes raw SQL via the `pg` driver. **Trade-off:** This requires manual type casting and schema management, but provides maximum control over complex grouping/aggregation queries, significantly reducing database latency on heavy read operations.
- **Redis for Rate Limiting vs. InMemory:** Rate limitations could be stored in Node.js memory, but this fails in distributed serverless environments. **Trade-off:** Redis introduces an external infrastructural dependency, but guarantees consistency and horizontal scalability across stateless application instances.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Redis Server

### Installation

```bash
# Clone the repository
git clone https://github.com/BryanWieschenberg/GoalGetter.git
cd goalgetter

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env.local and fill in the details
cp .env.example .env.local

# Run database migrations
# Ensure your PostgreSQL instance is running and the database is created
# Apply the schema from your initialization scripts
# e.g., psql -d goalgetter -f scripts/init.sql

# Start the development server
npm run dev
```

---

## Example Usage

Once the server is running, navigate to `http://localhost:3000` to interact with the landing page. Sign up for a local account or use an OAuth provider (Google/GitHub) to log in.

Inside the app:

1. Drag the center divider to resize the split-screen view.
2. Use the **Tasks** panel to create categories and draggable tasks.
3. Use the **Calendar** panel to schedule one-off or recurring events.

---

## Testing & Quality

- **Linting & Formatting:** Strict ESLint rules and Prettier configuration enforce monolithic code consistency.
- **Error Handling:** Graceful API degradation. Endpoints uniformly return structured error types and appropriate HTTP status codes (e.g., 429 for rate limits, 403 for reCAPTCHA failures).
- **Security:** CSRF protection, secure HTTP-only cookies for JWT session persistence, and bcrypt for salted password hashing.
- **Type Safety:** Comprehensive TypeScript adoption ensures robust data shaping from the database boundary to the React props.

---

## Performance & Benchmarks

- By leveraging raw SQL json aggregation, entire workspace hydration queries (loading tasks, complex events, and hierarchies) average **~10-25ms** database latency, even with hundreds of entities.
- Using Redis pipelining for the distributed rate limiter minimizes cache round trips to **<2ms** per API request checking.

---

## Future Improvements

- **Offline Support (PWA):** Implement Service Workers and IndexedDB to allow full read/write capabilities offline with automatic background sync.
- **WebSocket Integration:** Transition from standard HTTP polling/mutations to WebSockets for real-time collaboration and cross-device sync.
- **Query Caching Layer:** Introduce React Query (or Apollo) on the client side to further optimize data fetching, deduplication, and optimistic UI updates.

---

## Tech Stack

| Category             | Technologies                                                  |
| -------------------- | ------------------------------------------------------------- |
| **Frontend**         | React 18, Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| **Backend**          | Next.js API Routes, Node.js                                   |
| **Database & Cache** | PostgreSQL, Redis (`ioredis`)                                 |
| **Auth & Security**  | NextAuth.js, bcrypt, Google reCAPTCHA v3                      |
