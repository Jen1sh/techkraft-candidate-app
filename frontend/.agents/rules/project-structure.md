frontend/
├── Dockerfile # Production multi-stage or development container configuration
├── package.json # Dependencies, scripts, and build configurations
├── vite.config.js # Vite compiler and development server setup
├── index.html # Single-page application entry HTML template
├── .env.example # Environment variables template (no hardcoded secrets or credentials)
│
└── src/
├── main.jsx # Application mounting logic and DOM initialization
├── App.jsx # Core orchestrator component wrapping routes and global providers
├── index.css # Global stylesheets, resets, and design system utility directives
│
├── api/ # Networking Layer
│ ├── client.js # Base HTTP client configuration (Axios/Fetch instance with interceptors)
│ └── featureService.js # Domain-specific API endpoint client bindings
│
├── components/ # Reusable UI Component Layer
│ ├── ui/ # Atomic/Design-System components (stateless, generic)
│ │ ├── Button.jsx # Generic buttons supporting loading/disabled variants
│ │ ├── Input.jsx # Standardized form input field wrappers
│ │ └── Spinner.jsx # Reusable activity indicators for loading contexts
│ │
│ └── common/ # Structural, context-aware global layouts
│ ├── Navbar.jsx # Application header presenting user details or navigation links
│ └── Sidebar.jsx # Navigation sidebar container
│
├── context/ # Global State Management
│ └── AuthContext.jsx # Decodes session keys, coordinates roles, manages authenticated state
│
├── hooks/ # Stateful Logic Reuse
│ ├── useAuth.js # Custom hook to interface cleanly with authentication state
│ └── useFetch.js # Abstracted async state tracker for safe loading/error sequences
│
├── pages/ # Routed Views (Feature Orchestrators)
│ ├── LoginPage.jsx # View dedicated to parsing credentials and session creation
│ ├── DashboardPage.jsx # Aggregated data view incorporating lists, filters, and tables
│ └── DetailViewPage.jsx # Singular resource representation housing sub-panels and state blocks
│
├── routes/ # Navigation & Route Guard Layer
│ ├── AppRoutes.jsx # Declares path mappings and lazy-loaded code-splitting boundaries
│ └── ProtectedRoute.jsx # Client-side routing gate handling authentication validation and RBAC
│
└── utils/ # Functional Helpers
├── formatters.js # Global text, date, and currency manipulation schemas
└── tokenStorage.js # Browser storage synchronization protocols (localStorage/sessionStorage)
