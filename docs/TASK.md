# Project Tasks

## User Stories
*   [ ] As an Admin User, I want to log in securely, so I can access and manage my flowcharts.
*   [ ] As an Admin User, I want to view a list of all my flowcharts on a dashboard, so I can easily find and manage them.
*   [ ] As an Admin User, I want to create a new flowchart from the dashboard, so I can start designing a new diagram.
*   [ ] As an Admin User, I want to edit an existing flowchart, so I can update its content and title.
*   [ ] As an Admin User, I want a live preview of my Mermaid Markdown as I type, so I can see my flowchart taking shape in real-time.
*   [ ] As an Admin User, I want my flowchart changes to be saved automatically or manually, so I don't lose my work.
*   [ ] As an Admin User, I want to publish a flowchart, so it becomes accessible to public viewers via a unique URL.
*   [ ] As an Admin User, I want to delete a flowchart, so I can remove obsolete diagrams.
*   [ ] As an Admin User, I want to log out, so I can end my session securely.
*   [ ] As a Public Viewer, I want to view a published flowchart using its unique URL, so I can see the diagram without needing to log in.
*   [ ] As a Public Viewer, I want to interact with the published flowchart (pan, zoom, fit-to-view), so I can explore it effectively.

## Functional Requirements
*   [ ] Implement Admin User login functionality using email and password.
    *   [ ] Implement `/api/auth/login` endpoint for authenticating admin users.
    *   [ ] Implement session management for authenticated users (e.g., using NextAuth or Iron Session).
    *   [ ] Implement logout functionality, invalidating the user's session.
*   [ ] Develop the Dashboard UI for authenticated users.
    *   [ ] Display a list of all flowcharts including title, last updated time, and status.
    *   [ ] Provide "Edit", "Publish", and "Delete" action buttons for each flowchart.
    *   [ ] Implement "New Flowchart" button to create a new draft flowchart.
*   [ ] Implement Flowchart Editor functionality.
    *   [ ] Create a two-column layout with a Markdown editor on the left and a live preview on the right.
    *   [ ] Integrate a Markdown editor with syntax highlighting for Mermaid syntax.
    *   [ ] Implement real-time rendering of Mermaid Markdown into a visual flowchart preview.
    *   [ ] Display user-friendly error messages for invalid Mermaid syntax.
    *   [ ] Implement a title input field for the flowchart.
    *   [ ] Implement manual "Save" functionality for flowchart content and title.
    *   [ ] Implement auto-save functionality for flowchart content and title with a debounce mechanism.
    *   [ ] Implement a "Publish" button to change a flowchart's status to "published".
    *   [ ] Restrict Mermaid rendering to `flowchart TD` and `flowchart LR` types.
*   [ ] Implement Flowchart Publishing to an SSR-rendered page.
    *   [ ] Generate a unique, public URL for each published flowchart in the format `/p/{flowchartId}`.
    *   [ ] Develop an SSR page (`/p/[flowchartId]`) that fetches flowchart data from the database.
    *   [ ] Implement the conversion pipeline: Mermaid Markdown → Graph AST → React Flow structure.
    *   [ ] Render the converted graph structure using React Flow on the server side.
*   [ ] Develop the Public Published Page UI.
    *   [ ] Display the flowchart using React Flow with a modern visualization style.
    *   [ ] Ensure smooth edges for flowchart connections.
    *   [ ] Implement pan and zoom capabilities for the flowchart canvas.
    *   [ ] Implement a "Fit-to-view" button to adjust the flowchart within the canvas.
    *   [ ] Ensure the published page is read-only.
    *   [ ] Implement responsive design for the published page.
    *   [ ] Dynamically set the HTML `<title>` tag based on the flowchart's title.
    *   [ ] (Optional) Implement Open Graph (OG) preview tags for published flowcharts.

## Non-Functional Requirements (NFRs)
*   [ ] Ensure SSR rendering of the published page completes within 100-300 ms.
    *   [ ] Benchmark and optimize data fetching for published flowcharts.
    *   [ ] Benchmark and optimize Mermaid parsing and React Flow conversion logic.
    *   [ ] Monitor server-side rendering performance for `/p/[flowchartId]` route.
*   [ ] Configure SQLite to run in the same process as the Node.js application.
*   [ ] Implement authentication middleware to protect all internal dashboard and editor routes.
*   [ ] Ensure the published page `/p/{flowchartId}` is publicly accessible without authentication.
*   [ ] Implement input sanitization and output escaping for Mermaid Markdown content to prevent XSS vulnerabilities.
*   [ ] (Optional) Implement a strict Content Security Policy (CSP) for the application.
*   [ ] Ensure the application can be deployed and run directly with `node server.js` or `next start`.
*   [ ] Verify the application requires no external database or other external services.

## Technical Design & Architecture Tasks
*   [ ] Choose and integrate a session-based authentication library (e.g., NextAuth, Iron Session) or design a custom solution.
*   [ ] Design the overall Next.js application structure using the App Router.
*   [ ] Design the data flow and state management strategy for the editor and dashboard.
*   [ ] Plan the Mermaid Markdown parsing and conversion pipeline to React Flow structure.
    *   [ ] Research and select a Mermaid parsing library (e.g., `mermaid.js` itself or a dedicated parser).
    *   [ ] Define the intermediate Graph AST structure to bridge Mermaid parsing and React Flow rendering.
    *   [ ] Map Mermaid nodes and edges to React Flow nodes and edges, including styling attributes.
*   [ ] Select and integrate `shadcn/ui` or a similar modern UI library.
*   [ ] Design the API route structure for CRUD operations on flowcharts and authentication.

## Backend Development Tasks
*   [ ] Set up Next.js API routes for authentication:
    *   [ ] POST `/api/auth/login` for user authentication.
    *   [ ] GET `/api/auth/logout` (or equivalent) for session invalidation.
    *   [ ] GET `/api/auth/session` to retrieve current session status.
*   [ ] Implement secure password hashing (e.g., bcrypt) for admin user passwords.
*   [ ] Implement Next.js middleware to protect `/dashboard` and `/editor` routes based on authentication status.
*   [ ] Develop API routes for flowchart management:
    *   [ ] GET `/api/flowcharts` to retrieve a list of all flowcharts.
    *   [ ] POST `/api/flowcharts` to create a new draft flowchart.
    *   [ ] GET `/api/flowcharts/{id}` to retrieve a single flowchart by ID.
    *   [ ] PUT `/api/flowcharts/{id}` to update a flowchart (title, markdown, status).
    *   [ ] DELETE `/api/flowcharts/{id}` to delete a flowchart.
*   [ ] Implement the Mermaid Markdown to React Flow conversion logic on the server.
    *   [ ] Parse Mermaid markdown using `mermaid.js` or a similar tool.
    *   [ ] Transform the parsed Mermaid graph data into React Flow compatible `nodes` and `edges` arrays.
    *   [ ] Handle potential parsing errors and return structured error information.
*   [ ] Implement server-side logic for dynamic route `/p/[flowchartId]` to fetch published flowchart data.
*   [ ] Implement logic to update `updatedAt` timestamps on flowchart modifications and `publishedAt` on publishing.

## Frontend Development Tasks
*   [ ] Initialize a Next.js project with App Router.
*   [ ] Set up `shadcn/ui` (or chosen UI library) and configure a light theme.
*   [ ] Develop the Login Page UI with email and password input fields.
    *   [ ] Implement client-side validation for login credentials.
*   [ ] Build the Dashboard UI:
    *   [ ] Create a table or card component to display flowcharts.
    *   [ ] Implement interactive buttons for Edit, Publish, Delete actions.
    *   [ ] Implement "New Flowchart" button and its redirection logic.
    *   [ ] Fetch and display flowchart data from `/api/flowcharts`.
*   [ ] Develop the Flowchart Editor UI:
    *   [ ] Create the two-column layout.
    *   [ ] Integrate a Markdown editor component (e.g., Monaco Editor, CodeMirror) for the left panel.
        *   [ ] Configure Markdown editor for Mermaid syntax highlighting.
    *   [ ] Integrate `mermaid.js` or a React Mermaid component for the live preview panel on the right.
    *   [ ] Implement state management to sync Markdown input with the live preview.
    *   [ ] Create title input field and bind it to flowchart state.
    *   [ ] Implement "Save" and "Publish" buttons with associated API calls and loading states.
    *   [ ] Display real-time feedback and error messages from Mermaid parsing.
    *   [ ] Ensure sticky positioning for action buttons.
*   [ ] Develop the Public Published Flowchart Page UI:
    *   [ ] Integrate `react-flow-renderer` for displaying the flowchart.
    *   [ ] Implement custom node and edge styling for a modern appearance.
    *   [ ] Add pan and zoom controls to the React Flow component.
    *   [ ] Create a "Fit-to-view" button and integrate its functionality with React Flow.
    *   [ ] Implement responsiveness for the entire page.
    *   [ ] Set dynamic page title using `next/head` or `generateMetadata`.

## Data & Database Tasks
*   [ ] Set up Drizzle ORM project with SQLite driver.
*   [ ] Define Drizzle schema for the `users` table: `id`, `email`, `passwordHash`, `createdAt`.
*   [ ] Define Drizzle schema for the `flowcharts` table: `id`, `title`, `markdown`, `status`, `publishedAt`, `createdAt`, `updatedAt`.
    *   [ ] Implement `status` as an enum-like field (e.g., `'draft'`, `'published'`).
*   [ ] Implement Drizzle migration script to create initial `users` and `flowcharts` tables.
*   [ ] Create a database seeding script to insert the default admin user on first run (email + hashed password).
*   [ ] Configure SQLite database file path to `data/db.sqlite`.
*   [ ] Implement database queries using Drizzle ORM for all CRUD operations on `users` and `flowcharts`.
*   [ ] Ensure efficient data retrieval for the flowchart list and individual flowchart details.

## DevOps & Infrastructure Tasks
*   [ ] Configure `package.json` scripts for `dev`, `build`, and `start` (e.g., `next dev`, `next build`, `next start`).
*   [ ] Define environment variables required for the application (e.g., `AUTH_SECRET`, `DATABASE_URL` if not hardcoded).
*   [ ] Create a `.env.example` file for necessary environment variables.
*   [ ] Ensure all Node.js dependencies are correctly listed in `package.json`.
*   [ ] Set up a basic logging mechanism for application errors and important events.
*   [ ] Verify the application correctly initializes the SQLite database file at `data/db.sqlite` on first run if it doesn't exist.

## Testing & Quality Assurance Tasks
*   [ ] Define acceptance criteria for all user stories and functional requirements.
*   [ ] Write unit tests for backend API routes (e.g., authentication, CRUD operations).
*   [ ] Write unit tests for the Mermaid to React Flow conversion logic.
*   [ ] Write unit tests for Drizzle ORM database interactions.
*   [ ] Write integration tests for API routes interacting with the database.
*   [ ] Write integration tests for authentication middleware.
*   [ ] Develop end-to-end (E2E) tests for core user journeys:
    *   [ ] Admin login and logout.
    *   [ ] Creating, editing, saving, and publishing a flowchart.
    *   [ ] Deleting a flowchart.
    *   [ ] Viewing a published flowchart as a public viewer.
*   [ ] Perform manual UI/UX testing against all specified requirements (e.g., responsiveness, smooth transitions, error display).
*   [ ] Conduct performance testing for the SSR-rendered published page to meet the 100-300 ms target.
*   [ ] Conduct security testing for XSS vulnerabilities and authentication bypasses.
*   [ ] Conduct cross-browser compatibility testing for the frontend.

## Documentation Tasks
*   [ ] Create API documentation for all public and authenticated endpoints (e.g., using Swagger/OpenAPI or a simple Markdown file).
*   [ ] Document the Mermaid Markdown to React Flow conversion pipeline, including intermediate AST structure.
*   [ ] Document the database schema and Drizzle ORM usage.
*   [ ] Create a technical design document outlining the chosen authentication strategy and its implementation.
*   [ ] Provide clear instructions for local development setup.
*   [ ] Document the steps required for building and running the application in a production environment (e.g., `next build && next start`).
*   [ ] Document the initial admin user seeding process.
