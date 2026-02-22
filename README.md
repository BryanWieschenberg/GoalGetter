<div align="center">

# GoalGetter

_The secure, high-performance productivity platform unifying task and calendar management._

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](#)

</div>

## Overview

Most productivity apps focus exclusively on tasks or calendars, but GoalGetter provides a seamless, customizable split-screen interface that combines task tracking with event scheduling, allowing them to work together to create one space for everything. Its focus on low-latency interactions, thoughtful security, and a highly scalable backend infrastructure make it the perfect life management workspace.

## Key Features

- **Everything in One Place:** A dynamic, resizable UI allowing simultaneous interaction with tasks and calendar events without tab management friction.
- **Infinite Customization:** Create unlimited categories and separate tasks by tags. There is also support for custom colors, due dates, priority levels, and seamless event recurrence. We also included sorting, filtering, and search capabilities.
- **Never Miss a Deadline:** Visual indicators appear over your tasks and calendar to give you an instant overview of when things are due. The alerts are specially designed to be smart, yet non-intrusive.
- **Enterprise-Grade Security:** Rock-solid security is our top priority, made possible by Auth.js, OAuth 2.0, reCAPTCHA, hashed credentials, tokenized email verification, input sanitization, and Redis rate limiting.

## Example Usage

Sign up for a local account or use an OAuth provider (Google/GitHub) to log in.

Inside the app:

1. Drag the center divider to resize the split-screen view.
2. Use the **Tasks** panel to create tasks, tags, and categories, which can be dragged around, sorted, filtered, and searched through.
3. Use the **Calendar** panel to schedule events, with optional recurrence capabilities that support an RRULE-like standard.
4. Use the **Settings** page to edit your account, customize your visual theme (system, light, dark), or calendar week start day.

## System Architecture

GoalGetter employs a modern architecture utilizing Next.js for optimized server-side rendering and seamless API integration.

![GoalGetter Architecture](./docs/architecture.png)

1. **Client:** Utilizes the `Next.js App Router`, along with highly interactive React components, `Tailwind CSS` for rapid-iteration styling, and `framer-motion` for fluid animations and micro-interactions. Client state is meticulously managed to avoid hydration mismatches and minimize re-renders.
2. **Backend/API:** Hosted on `AWS EC2` for reliable compute, and uses `Next.js API Routes` to receive HTTPS/REST requests. To manage authentication state, `NextAuth.js` is used.
3. **Data:** `PostgreSQL` serves as the primary ACID-compliant relational database. The schema is highly normalized to ensure data integrity. `Redis` is also used for rate-limiting and caching to ensure low-latency.
4. **External Services:** Our `OAuth 2.0 Providers` allows secure, frictionless social login through Google and GitHub. The email service, `Resend`, handles reliable, secure transactional email delivery. The bot protection service, `reCAPTCHA v3`, defends the sign-up and sign-in endpoints via invisible background challenges.

## Trade-offs & Design Decisions

- **Next.js API Routes over standalone backend:** GoalGetter implements its backend directly within the Next.js /api directory rather than maintaining a decoupled backend service. **Trade-off:** A dedicated backend service offers more granular scaling and language flexibility. However, Next.js allows for a single-repo architecture where the frontend and backend are tightly coupled and deploy together seamlessly. This reduces deployment complexity and massively increases feature velocity, making it a perfect fit for this solo project.
- **Raw SQL over ORM:** While ORMs like Drizzle or Prisma offer high developer velocity and type safety, GoalGetter utilizes raw SQL via the pg driver. **Trade-off:** This requires manual type casting and schema management, but provides maximum control over complex grouping/aggregation queries, significantly reducing database latency on heavy read operations.
- **Redis for Rate Limiting vs. InMemory:** Rate limits could be stored in Node.js memory, but I wanted to design this app to be horizontally scalable, so I chose Redis because it better fits that philosophy. **Trade-off:** Redis introduces an external infrastructural dependency, but guarantees consistency and horizontal scalability.
- **REST vs. GraphQL:** We leverage standard RESTful Next.js API Routes rather than introducing a GraphQL layer. **Trade-off:** While REST requires creating bespoke endpoints, it eliminates the heavy overhead of a GraphQL engine and keeps the architecture lean and performant.
- **Workspace Client-Side Rendering:** The main application workspace relies heavily on client-side-rendered components rather than full server-side rendering. **Trade-off:** While SSR improves initial load experience and SEO, the highly interactive nature of the split-screen interface demands immediate state reflexes that CSR excels at. SEO is not required nor necessary for an authenticated, private user dashboard like the GoalGetter workspace.
- **Micro-Optimization via Ref-based Caching:** For calendar pagination, GoalGetter caches previously fetched weeks directly in React's useRef rather than using a complex global state manager like Redux. **Trade-off:** This tightly couples caching to the component lifecycle, but eliminates boilerplate and keeps performance extremely fast for the user.

## Testing & Quality

- **Linting & Formatting:** Follows strict ESLint and Prettier rules to enforce code consistency.
- **Error Handling:** Graceful API degradation. Endpoints uniformly return structured error types and appropriate HTTP status codes.
- **Security by Default:** Implements robust protection mechanisms, such as CSRF protection, security headers, and HTTP-only cookies for JWT session persistence. User passwords are backed by strict strength enforcement, and bcrypt salting and hashing. Verification tokens are hashed by SHA-256. API responses are sanitized to prevent user enumeration vulnerabilities.
- **Type Safety:** End-to-end TypeScript adoption enables robust data shaping and schema enforcement, catching mismatched contracts at compile time rather than runtime.
- **Input Sanitization/Payload Validation:** Every incoming API request is rigorously validated using custom server-side validation logic before hitting the database, rejecting malformed, excessively long, or malicious payloads to guarantee strict data integrity and mitigate SQL injection vectors.

## Performance & Benchmarks

- **Sub-50ms API Latency:** By utilizing strategic database indexing on common read operations, and choosing highly optimized raw SQL over ORMs, the application maintains 20-40ms request latency, even when workspaces contain hundreds of tasks or complex, recurring events.
- **Smart Calendar Prefetching:** The calendar implements strict date-range filtering, drastically reducing payload sizes. It seamlessly pre-fetches adjacent weeks in the background and stores them in a localized React cache, rendering calendar navigation completely instantaneous to the user.
- **Aggressive Pagination:** Task rendering is heavily performant by implementing chunked pagination. The UI initially hydrates a strict subset of exactly 50 tasks, allowing users to load subsequent chunks only as needed, preventing performance drops on heavy workspaces.
- **Debounced Interactions:** The high-frequency input vector used, task searching, is wrapped in a debounced timeout. This eliminates UI stutter and prevents the system from being overwhelmed by per-keystroke queries.

## Tech Stack

| Category              | Technologies                                                          |
| --------------------- | --------------------------------------------------------------------- |
| **Frontend**          | Next.js App Router, TypeScript, Tailwind CSS, Framer Motion           |
| **Backend/API**       | Next.js API Routes, TypeScript, NextAuth.js, bcrypt, SHA-256, Node.js |
| **Data**              | PostgreSQL, Redis                                                     |
| **External Services** | OAuth 2.0 Providers (Google, GitHub), Resend, reCAPTCHA               |

## Images

#### In the Workspace:

![In the Workspace](./public/welcome1-using.png)

#### Creating an Event:

![Creating an Event](./public/welcome2-creating.png)

#### Deadline Indicators:

![Deadline Indicators](./public/welcome3-alarm.png)

## Help

- **Terms of Service:** Our comprehensive usage guidelines are available at [goalgetter.dev/terms](https://goalgetter.dev/terms).
- **Privacy Policy:** We take data security seriously. Review our privacy commitments at [goalgetter.dev/privacy](https://goalgetter.dev/privacy).
- **Support & Inquiries:** For technical assistance or general inquiries, please reach out at [support@goalgetter.dev](mailto:support@goalgetter.dev).

## Local Development

Although this app available publicly, you are free to run it locally as well, given you have the correct dependencies and environment variables.

1. Clone the repository with `git clone https://github.com/BryanWieschenberg/GoalGetter`, enter the directory with `cd GoalGetter`, and install dependencies with `npm install`
2. Install PostgreSQL with `sudo apt install postgresql postgresql-contrib -y` and start the service with `sudo systemctl start postgresql`. Optionally enable it to run on boot with `sudo systemctl enable postgresql`.
3. Install Redis with `sudo apt install redis-server -y` and start the service with `sudo systemctl start redis-server`. Optionally enable it to run on boot with `sudo systemctl enable redis-server`.
4. Set up your local `.env` file with the following keys using your own credentials:

```
# Configuration
ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DB_SSL_REJECT_UNAUTHORIZED=false

# PostgreSQL (Database)
PGUSER=<user>
PGHOST=localhost
PGNAME=<database_name>
PGPASSWORD=<user_password>
PGPORT=5432

# Cache / Rate Limiting (Redis)
REDIS_URL=redis://localhost:6379

# Authentication (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random_secure_string>

# OAuth Providers (Google & GitHub)
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
GITHUB_CLIENT_ID=<github_client_id>
GITHUB_CLIENT_SECRET=<github_client_secret>

# External Services (Resend, reCAPTCHA)
RESEND_API_KEY=<resend_api_key>
EMAIL_FROM="onboarding@resend.dev"
SUPPORT_EMAIL=<fake_support_email>
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<recaptcha_site_key>
RECAPTCHA_SECRET_KEY=<recaptcha_secret_key>
```

5. Run the development server with `npm run dev`, visit `http://localhost:3000`, and you're ready to go!
