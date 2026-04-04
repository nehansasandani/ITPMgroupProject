# Project Overview

This document outlines the structure of the ITPM Group Project and details what has been implemented so far, along with suggestions for next steps.

---

## 🏗️ Repository Structure

The workspace is split into two main directories:

- **backend/** – Express.js server with MongoDB integration
- **frontend/** – React application (Vite-based) with Tailwind CSS

Each side has its own `package.json` and related configuration.

### Backend Directory

```
backend/
  .env
  package.json
  server.js                # Entry point for Express server
  config/                  # (Empty placeholder)
  controllers/             # Contains business logic
    ratingController.js    # Controller for rating-related operations
    skillController.js     # Controller for skill-related operations
  middleware/              # (Empty placeholder)
  models/                  # Mongoose schemas
    Rating.js              # Rating schema
    Skill.js               # Skill schema
  routes/                  # Express routers
    ratingRoutes.js        # API endpoints for ratings
    skillRoutes.js         # API endpoints for skills
  utils/                   # (Empty placeholder)
```

The backend currently:

- Connects to MongoDB using `process.env.MONGO_URI`
- Sets up CORS and JSON parsing middleware
- Exposes `/api/skills` and `/api/ratings` endpoints
- Provides a basic test route at `/`

### Frontend Directory

```
frontend/
  package.json
  vite.config.js
  tailwind.config.js
  eslint.config.js
  index.html
  src/
    main.jsx               # React app bootstrap
    App.jsx                # Top-level component
    routes.jsx             # Client-side routing
    App.css / index.css
    api/                   # Axios wrappers
      axiosInstance.js     # Base Axios setup
      Rating.js            # Rating API calls
      skillApi.js          # Skill API calls
    pages/
      profile/
        SkillsPage.jsx
        SkillsPage.css
      reputation/
        RatingForm.jsx
    utils/
      skillData.js         # Mock or helper data for skills
  public/                  # Static assets
```

The frontend currently:

- Uses Vite for development and build
- Implements pages for viewing skills and submitting ratings
- Calls backend APIs via Axios
- Styles components with Tailwind and custom CSS

---

## ✅ Features Implemented

1. **Backend API**
   - Express server with routing for skills and ratings
   - MongoDB schemas for `Skill` and `Rating`
   - Basic controllers (presumably CRUD operations)
   - Environment configuration via `.env`

2. **Frontend UI**
   - React components and pages for skills listing and rating form
   - API wrappers to communicate with backend
   - Tailwind CSS and custom styling
   - Routing set up with React Router (in `routes.jsx`)

3. **Development Setup**
   - Separate package configurations for frontend and backend
   - Linting via ESLint configuration files
   - Tailwind and Vite integrated for frontend

---

## 📋 Next Steps & Recommendations

- **Backend**
  1. Implement or verify CRUD operations in controllers.
  2. Add authentication/authorization if required.
  3. Add error handling middleware and validation.
  4. Write unit/integration tests (e.g., using Jest/Supertest).
  5. Configure production deployment (e.g., Heroku, Netlify, or Docker).

- **Frontend**
  1. Complete pages with dynamic data from backend.
  2. Add form validation and error handling.
  3. Implement user workflows (login, submit rating, edit skills).
  4. Set up tests (Jest + React Testing Library).
  5. Optimize build and asset management.

- **General**
  1. Add README instructions for running backend and frontend.
  2. Consider shared environment variable management.
  3. Use a monorepo tool (e.g., Lerna, Nx) if the project grows.

---

This overview should help team members understand the current state and plan future work. Feel free to update this file as features evolve.