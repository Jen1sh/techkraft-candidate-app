# React + Vite Production Coding Conventions

To build scalable, robust, and maintainable web applications, this guide establishes clear coding standards and architectural rules for a **React + Vite** frontend. The goal is to enforce modularity, ensure predictable data flow, and prevent common pitfalls like layout freezes or fragile role management.

---

## 1. Project Organization & Directory Hygiene

Maintain a strict separation of concerns across directories to isolate atomic styling from business rules and data models.

- **File and Folder Casing:**
- **PascalCase:** Used exclusively for component files, component directories, and context providers (e.g., `Button.jsx`, `DashboardPage.jsx`, `AuthContext.jsx`).
- **camelCase:** Used for everything else, including hooks, utility functions, API services, and assets (e.g., `useFetch.js`, `formatters.js`, `client.js`).

- **Path Aliasing:**
- Never use deeply nested relative paths (e.g., `../../../../components/ui/Button`).
- Configure path aliases inside `vite.config.js` and `jsconfig.json` (or `tsconfig.json`) to use the `@` prefix pointing to the `src/` directory:

```javascript
import { @/components/ui/Button } from '@/components/ui/Button';

```

---

## 2. Component Architecture & Design Principles

### Single Responsibility & Component Sizes

- Keep components small and focused. If a component exceeds **150–200 lines of markup and logic**, it is a strong candidate for refactoring.
- Extract nested functional elements out of the parent render tree into dedicated sub-components or distinct files to maintain structural visibility.

### Separation of Presentation and Context

To protect the design system from application scope modifications, categorize user interface files into distinct layers:

1. **Atomic UI Elements (`src/components/ui/`):** \* Must remain **stateless and pure**.

- They consume data exclusively through explicit React `props` and should never bind to a global state provider or trigger direct API fetches.

2. **Smart/Context Views (`src/components/common/` or Feature-Specific Layouts):**

- Context-aware items that can securely look up permissions, parse incoming credentials, and change visual representations conditionally (e.g., hiding action buttons or table items based on a user's role parameters).

3. **Feature Orchestrators (`src/pages/`):**

- Page components that act as controllers. They bind route params, trigger state workflows, pass data downward, and serve as the root boundary for layout assemblies.

---

## 3. State Management & Data Flow

### Follow the Rule of Proximity

- **Local State First:** Keep tracking metrics as close to where they are modified as possible. For instance, form inputs and hover indicators belong inside localized component state (`useState`).
- **Lift Appropriately:** Lift state up only when two or more distinct sibling nodes require synchronous access to the exact same information tree.
- **Global Context Limitation:** Use React Context sparingly. Reserve context scopes for application-wide metrics that change infrequently but are ubiquitously needed (e.g., authentication states, localized translation matrices, active user roles).

### Encapsulate Stateful Business Logic

- Keep your view templates clear of complex calculations, direct array manipulations, and complex side effects.
- Abstract intricate state transitions or custom side-effect configurations into reusable custom hooks (`src/hooks/`). This decouples UI design layers from structural data lifecycles.

---

## 4. API Integration & Network Interceptors

- **Zero Network Footprints in Views:** Never execute raw `fetch()` strings or instantiate direct un-abstracted API calls inside a component's lifecycle or a raw `useEffect` hook.
- **Centralize the Network Layer (`src/api/`):** Isolate server integration routines inside standalone configuration clients and domain-specific services.
- **Automate Pipeline Intercepts:** Rely on client interceptors (such as Axios interceptors) to safely mutate outgoing transactions. This is the designated boundary to automatically inject global credentials like `Authorization: Bearer <token>` without repeating token management code across individual app panels.

```javascript
// Example of decoupled network instantiation: src/api/client.js
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 5. Deterministic Asynchronous UX Handling

To prevent application white-screens, layout breakages, or silent transaction failures during slow connections or long-running background tasks (e.g., analytical calculations or external microservice calls), always explicitly manage structural transitions.

- **The Three-State Constraint:** Every asynchronous operation must expose three distinct deterministic tracking hooks: `isLoading`, `error`, and `data` (or `success`).
- **Visual Continuity:** While `isLoading` evaluates to `true`, components must proactively swap default render trees out for visual loading states (such as skeleton screens or activity bars). Never allow interactive pages to remain un-updated while async events resolve.
- **Defensive Error Margins:** Trap rejection responses gracefully. Bind visual fallback elements to your UI layout when error states arise to guide users back to an operational state safely.

```jsx
// Standard Deterministic Handling Pattern inside a Page Component
function AssetDisplayPage() {
  const { data, isLoading, error } = useFeatureFetch("/resource-endpoint");

  if (isLoading) return <AssetLoadingSkeleton />;
  if (error) return <ErrorMessagePanel message={error.message} />;
  if (!data) return <EmptyStateView />;

  return <ActualDataLayout presentationPayload={data} />;
}
```

---

## 6. Access Controls and Security Routing

- **Guard at the Route Boundary:** Enforce user credentials, session verification, and Role-Based Access Control (RBAC) definitions directly inside the client navigation router using specialized layout containers (e.g., `<ProtectedRoute />`).
- **Virtual DOM Scrubbing:** Do not rely on CSS tricks (like `display: none` or hiding visibility classes) to secure protected views or administrative panels from unprivileged accounts. If a user fails to meet authentication or authorization conditions, completely omit the sensitive subroutines or elements from the Virtual DOM:

```jsx
// Secure component-level execution guard
{
  user.role === "admin" && <AdministrativeActionPanel />;
}
```

---

## 7. Performance & Code Quality Cleanliness

- **Incorporate Environmental Defenses:** Always ship code with a complete configuration template file (`.env.example`) present in the root folder. Never push active deployment keys, local database paths, or production credentials directly into git management pipelines.
- **Avoid Primitive Dependency Pitfalls:** When initializing `useEffect`, `useMemo`, or `useCallback` tracking criteria, be mindful of complex object references. Pass deterministic primitive values (strings, integers, booleans) into array dependencies to prevent accidental evaluation loops.
- **Utilize Clean Declarative Syntax:** Write clean, declarative JavaScript/JSX. Leverage modern features like optional chaining (`?.`) and nullish coalescing (`??`) to evaluate missing data points safely without cluttering templates with extensive ternary operations.
