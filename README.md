## Technology Stack

- Frontend Framework: React 19.2.4
- Language: TypeScript 5.9.3
- Build Tool: Vite 8.0.1
- Styling: Tailwind CSS 3.3.3
- Routing: React Router DOM 7.13.2
- Code Quality: ESLint 9.39.4

## Prerequisites

Before running the project, make sure you have installed:

- Node.js (version 18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install all dependencies:

```bash
npm install
```

## Running the Frontend

### Development Mode

Start the development server with hot module reloading:

```bash
npm run dev
```

This will start the Vite development server, typically available at http://localhost:5173

### Production Build

Build the application for production:

## Project Structure

```
frontend/
├── src/
│   ├── components/     - Reusable React components
│   ├── pages/          - Page-level components
│   ├── assets/         - Static assets (images, etc.)
│   ├── App.tsx         - Main application component
│   ├── main.tsx        - Application entry point
│   ├── App.css         - Application styles
│   └── index.css       - Global styles
├── public/             - Static files served directly
├── package.json        - Project dependencies and scripts
├── tsconfig.json       - TypeScript configuration
├── vite.config.ts      - Vite configuration
├── tailwind.config.js  - Tailwind CSS configuration
├── postcss.config.js   - PostCSS configuration
└── eslint.config.js    - ESLint configuration
```

