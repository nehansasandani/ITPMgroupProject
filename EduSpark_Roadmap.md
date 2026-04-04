# EduSpark – Full Project Roadmap
> Based on existing project structure (React + Vite + Tailwind / Express.js + MongoDB)

---

## 🗂️ Current State Summary

| Area | Status |
|------|--------|
| Backend Express server | ✅ Running |
| MongoDB connection | ✅ Connected |
| `/api/skills` & `/api/ratings` routes | ✅ Exists |
| `Skill.js` & `Rating.js` schemas | ✅ Exists |
| Frontend Vite + React + Tailwind | ✅ Running |
| `SkillsPage.jsx` & `RatingForm.jsx` | ✅ Exists |
| Axios wrappers (`skillApi.js`, `Rating.js`) | ✅ Exists |
| JWT Authentication | ❌ Not implemented |
| All other modules | ❌ Not started |

---

## 📦 Module 1 – Task Creation & Scope Control

**Owner:** Member 1  
**Depends on:** Module 6 (JWT auth must exist first)

### Backend – Files to Create
```
backend/
  models/
    Task.js                  # Task schema
  controllers/
    taskController.js        # createTask, getTasks, getTaskById, deleteTask
  routes/
    taskRoutes.js            # POST /api/tasks, GET /api/tasks, GET /api/tasks/:id
  middleware/
    authMiddleware.js        # JWT verification (shared with all modules)
    validateTask.js          # Input validation rules
```

### Frontend – Files to Create
```
frontend/src/
  pages/
    tasks/
      CreateTaskPage.jsx     # Task creation form
      TaskListPage.jsx       # Browse open tasks
      TaskDetailPage.jsx     # Single task view
  api/
    taskApi.js               # Axios calls for task endpoints
  components/
    tasks/
      TaskCard.jsx           # Reusable task card UI
      TaskForm.jsx           # Reusable form component
```

### Key Implementation Steps
1. Define `Task.js` schema — fields: `taskId`, `creatorId`, `title`, `description`, `category`, `skillTags`, `preferredMode`, `timeLimit`, `deadline`, `status`, `createdAt`
2. Build `createTask` controller with validation (no empty fields, deadline must be future date)
3. Protect all task routes with `authMiddleware.js`
4. Build task creation form with client-side validation
5. Add dark mode toggle using `localStorage` for preference persistence
6. Feed `taskId` and `creatorId` to Session module (Module 5) on creation

### Integration Touchpoints
- → **Module 2**: Tasks are fetched by the matching engine
- → **Module 5**: `taskId` passed when session is created
- → **Module 6**: JWT token required for all task operations

---

## 📦 Module 2 – Skill Match & Availability Engine

**Owner:** Member 2  
**Depends on:** Module 1 (tasks), Module 3 (reputation scores), Module 6 (user profiles/skills)

### Backend – Files to Create
```
backend/
  models/
    Match.js                 # Match record schema
  controllers/
    matchController.js       # runMatchingEngine, getMatchesForTask, acceptMatch
  routes/
    matchRoutes.js           # POST /api/match/run, GET /api/match/:taskId, POST /api/match/accept
  utils/
    scoringEngine.js         # Core matching algorithm logic (keep isolated for testing)
```

### Frontend – Files to Create
```
frontend/src/
  pages/
    matching/
      MatchResultsPage.jsx   # Show ranked candidates for a task
      MatchAcceptPage.jsx    # Confirm match and trigger session creation
  api/
    matchApi.js
```

### Key Implementation Steps
1. Build `scoringEngine.js` — weighted score formula:
   `score = (0.4 × skillMatch) + (0.3 × reputationScore) + (0.2 × completionRate) + (0.1 × availability)`
2. Skill matching — compare task `skillTags` against user's profile `skills` array
3. Availability check — compare task `timeLimit` window against user's available hours
4. Rank and return top 3 candidates
5. On match accepted → call Session module to create session record
6. Document weight choices in your report (this is your academic depth)

### Integration Touchpoints
- ← **Module 1**: Reads task details and skill tags
- ← **Module 3**: Reads `reputationScore` and skill-level scores per user
- → **Module 5**: Triggers session creation when match is accepted
- ← **Module 6**: Reads user skills and availability from profile

---

## 📦 Module 3 – Trust, Reputation & Gamification

**Owner:** Member 3  
**Depends on:** Module 5 (session completion events), Module 6 (profile updates)

### Backend – Files to Create
```
backend/
  models/
    Rating.js                # ✅ Already exists – verify fields: clarity, effort, timeliness
    Badge.js                 # Badge definitions (name, condition_type, threshold)
    UserReputation.js        # Per-user reputation snapshot + tier + points + streak
    ReputationLog.js         # Audit log: every score change with reason and delta
    Endorsement.js           # Peer skill endorsements after sessions
    Notification.js          # Reputation/badge/tier change notifications
  controllers/
    ratingController.js      # ✅ Already exists – extend with reputation recalc trigger
    reputationController.js  # getReputation, recalculate, getHistory, freezeScore
    badgeController.js       # evaluateBadges, getUserBadges
    leaderboardController.js # getLeaderboard (weekly/monthly/alltime/bySkill)
    endorsementController.js # submitEndorsement, getEndorsements
    notificationController.js# getNotifications, markRead
  routes/
    ratingRoutes.js          # ✅ Already exists – add POST /api/ratings/submit
    reputationRoutes.js      # GET /api/reputation/:userId, GET /api/reputation/:userId/history
    badgeRoutes.js           # GET /api/badges/:userId
    leaderboardRoutes.js     # GET /api/leaderboard?scope=weekly&skill=python
    endorsementRoutes.js     # POST /api/endorsements, GET /api/endorsements/:userId
    notificationRoutes.js    # GET /api/notifications, PATCH /api/notifications/:id/read
  utils/
    reputationEngine.js      # Core formula — isolated, fully testable
    badgeEngine.js           # Condition-driven badge evaluator
    tierEngine.js            # Maps score → tier (Bronze/Silver/Gold/Platinum/Elite)
```

### Frontend – Files to Create
```
frontend/src/
  pages/
    reputation/
      RatingForm.jsx         # ✅ Already exists – connect to real API
      ReputationPage.jsx     # Score, tier badge, history timeline
      LeaderboardPage.jsx    # Filterable leaderboard
      BadgesPage.jsx         # All earned + locked badges
  components/
    reputation/
      TierBadge.jsx          # Visual tier display component
      ReputationTimeline.jsx # Audit log as a vertical timeline
      BadgeCard.jsx          # Individual badge with unlock condition
      LeaderboardTable.jsx   # Sortable leaderboard table
      EndorsementPanel.jsx   # Show/give endorsements
      NotificationBell.jsx   # Bell icon with unread count
  api/
    reputationApi.js
    badgeApi.js
    leaderboardApi.js
    endorsementApi.js
    notificationApi.js
```

### Key Implementation Steps
1. Extend `Rating.js` schema — confirm fields: `sessionId`, `raterId`, `rateeId`, `clarity`, `effort`, `timeliness`, `createdAt`
2. Build `reputationEngine.js` — formula:
   `score = (0.4 × avgRating) + (0.3 × completionRate) + (0.2 × recencyFactor) − (0.1 × penaltyScore)`
3. Build `tierEngine.js` — thresholds: Bronze 0–29, Silver 30–49, Gold 50–69, Platinum 70–89, Elite 90+
4. Build `badgeEngine.js` — condition-driven evaluator, NOT hardcoded if/else
5. Track skill-specific reputation separately (e.g. `{ python: 82, math: 45 }`) for Module 2
6. Build `ReputationLog.js` — every score change writes a log entry with `reason` and `delta`
7. Implement streak logic — consecutive weeks with at least one completed session
8. Reputation freeze — when dispute opened (from Module 4), set `isFrozen: true` on `UserReputation`
9. Leaderboard — support filters: `weekly`, `monthly`, `alltime`, `bySkill`, `byDepartment`
10. Add score visibility setting — user can hide exact score, show tier only
11. Wire `session:completed` event listener → triggers recalculation pipeline
12. Write Jest unit tests for `reputationEngine.js` and `badgeEngine.js`

### Integration Touchpoints
- ← **Module 5**: Listens to `session:completed` and `session:noshow` events
- → **Module 2**: Exposes `reputationScore` and skill-level scores for matching
- ← **Module 4**: Receives `dispute:opened` → freeze score; `dispute:resolved` → unfreeze + apply penalty
- → **Module 6**: Updates `points`, `badges`, `tier` on user profile

---

## 📦 Module 4 – Dispute Resolution, Admin & Oversight

**Owner:** Member 4  
**Depends on:** Module 5 (session logs), Module 3 (reputation updates), Module 6 (JWT admin role)

### Backend – Files to Create
```
backend/
  models/
    Dispute.js               # Dispute schema: sessionId, reporterId, reason, status, adminNote
    PenaltyLog.js            # Record of penalties applied per user
  controllers/
    disputeController.js     # createDispute, getDisputes, resolveDispute
    adminController.js       # suspendUser, restoreUser, getDashboardStats
    penaltyController.js     # applyPenalty, getPenaltyHistory
  routes/
    disputeRoutes.js         # POST /api/disputes, GET /api/disputes/:id, PATCH /api/disputes/:id
    adminRoutes.js           # GET /api/admin/dashboard, PATCH /api/admin/users/:id/suspend
  middleware/
    adminAuthMiddleware.js   # JWT check + role === 'admin' guard
```

### Frontend – Files to Create
```
frontend/src/
  pages/
    admin/
      AdminDashboard.jsx     # Overview stats, active disputes list
      DisputeDetailPage.jsx  # Review session logs + make decision
      UserManagementPage.jsx # Suspend/restore users
    disputes/
      ReportDisputePage.jsx  # User-facing dispute submission form
```

### Key Implementation Steps
1. `Dispute.js` — link `sessionId`, auto-populate session logs as evidence
2. Auto-penalty logic — first offence: 24h cooldown; second: 72h; third: admin review flag
3. Admin dashboard — read-only first, then add action buttons
4. On dispute opened → emit event to Module 3 to freeze reputation score
5. On dispute resolved → emit result to Module 3 (apply penalty or clear freeze)
6. Protect all admin routes with `adminAuthMiddleware.js`

### Integration Touchpoints
- ← **Module 5**: Reads session logs as dispute evidence
- → **Module 3**: Sends freeze/unfreeze and penalty signals
- ← **Module 6**: Validates admin JWT role before any admin action

---

## 📦 Module 5 – Session Management

**Owner:** Member 5  
**Depends on:** Module 1 (task), Module 2 (match result), Module 6 (JWT)

### Backend – Files to Create
```
backend/
  models/
    Session.js               # Schema: taskId, helperId, requesterId, status, startTime, endTime, joinLog
  controllers/
    sessionController.js     # createSession, startSession, endSession, getSessionById, getSessionLogs
  routes/
    sessionRoutes.js         # POST /api/sessions, PATCH /api/sessions/:id/start, PATCH /api/sessions/:id/end
  utils/
    sessionTimer.js          # Auto-expiry and no-show detection logic
    eventBus.js              # Node.js EventEmitter — shared event bus for all modules
```

### Frontend – Files to Create
```
frontend/src/
  pages/
    sessions/
      SessionPage.jsx        # Active session view with countdown timer
      SessionHistoryPage.jsx # Past sessions list
  api/
    sessionApi.js
```

### Key Implementation Steps
1. `Session.js` — status enum: `scheduled → active → completed / noshow / disputed`
2. On session end → emit `session:completed` or `session:noshow` via `eventBus.js`
3. Auto-expiry — if session not started within 15 mins of scheduled time → auto mark `noshow`
4. `joinLog` array — record each user's join timestamp for attendance evidence
5. Expose session logs endpoint for Module 4 disputes

### Integration Touchpoints
- ← **Module 2**: Receives match result to create session record
- → **Module 3**: Emits `session:completed` / `session:noshow`
- → **Module 4**: Session logs available as dispute evidence
- → **Module 3**: Endorsement UI shown after session ends

---

## 📦 Module 6 – User Profile & Authentication

**Owner:** Member 6  
**Must be completed first — all other modules depend on this**

### Backend – Files to Create
```
backend/
  models/
    User.js                  # Schema: name, email, passwordHash, role, skills, availability, department, reputationRef
  controllers/
    authController.js        # register, login, refreshToken
    profileController.js     # getProfile, updateProfile, addSkill, removeSkill
  routes/
    authRoutes.js            # POST /api/auth/register, POST /api/auth/login
    profileRoutes.js         # GET /api/profile/:id, PATCH /api/profile/:id
  middleware/
    authMiddleware.js        # Verify JWT — used by ALL other modules
  utils/
    jwtUtils.js              # Sign and verify JWT tokens
```

### Frontend – Files to Create
```
frontend/src/
  pages/
    auth/
      RegisterPage.jsx
      LoginPage.jsx
    profile/
      ProfilePage.jsx        # View reputation, badges, skills, completed sessions
      EditProfilePage.jsx
  api/
    authApi.js
  context/
    AuthContext.jsx          # Global auth state — JWT token stored in memory/httpOnly cookie
```

### Key Implementation Steps
1. `User.js` — include `skills[]`, `availability[]`, `department`, `role` (student/mentor/admin)
2. Passwords hashed with `bcrypt` — never stored plain
3. JWT signed on login, verified in `authMiddleware.js` shared across all modules
4. Profile page aggregates data from Module 3 (reputation, badges, points)
5. Skills on profile feed directly into Module 2 matching engine

### Integration Touchpoints
- → **All modules**: `authMiddleware.js` is used everywhere
- → **Module 2**: User skills and availability read from profile
- → **Module 3**: Profile displays reputation, badges, tier, points
- → **Module 4**: Admin role enforced via JWT role field

---

## 🔌 Shared Utilities (All Members)

Create these once and share across modules:

```
backend/
  utils/
    eventBus.js              # Node EventEmitter singleton — modules emit and listen here
    apiResponse.js           # Standardised { success, data, error } response wrapper
  middleware/
    authMiddleware.js        # JWT verification — Module 6 creates, all others import
    errorHandler.js          # Global Express error handler
```

---

## 🧪 Testing Plan (Per Module)

| Module | What to Test |
|--------|-------------|
| 1 | Task validation rules, deadline enforcement |
| 2 | Scoring formula with known inputs, ranking order |
| 3 | Reputation formula, badge conditions, leaderboard order |
| 4 | Penalty escalation logic, admin auth guard |
| 5 | Status transitions, auto-expiry timer |
| 6 | JWT generation/verification, password hashing, profile CRUD |

Use **Jest** for unit tests and **Supertest** for API integration tests.

---

## 📅 Suggested Build Order

```
Week 1    Module 6 → Register, Login, JWT
Week 1    Module 1 → Task creation + validation
Week 2    Module 5 → Session lifecycle + eventBus
Week 2    Module 2 → Matching algorithm + scoring
Week 3    Module 3 → Reputation engine + badges + leaderboard
Week 3    Module 4 → Dispute reporting + admin dashboard
Week 4    All      → Cross-module integration testing
Week 4    All      → UI polish, edge case handling, Jest tests
```

---

## 🤝 API Contract Summary (Cross-Module Agreements)

| From | To | What |
|------|----|------|
| Module 6 | All | `authMiddleware.js` — import and use in every protected route |
| Module 1 | Module 2 | `GET /api/tasks` — returns `{ taskId, skillTags, timeLimit }` |
| Module 2 | Module 5 | `POST /api/sessions` — called on match accept with `{ taskId, helperId, requesterId }` |
| Module 5 | Module 3 | `eventBus.emit('session:completed', { sessionId, helperId, requesterId })` |
| Module 5 | Module 4 | `GET /api/sessions/:id/logs` — returns join log as dispute evidence |
| Module 3 | Module 2 | `GET /api/reputation/:userId` — returns `{ globalScore, skillScores: { python: 82 } }` |
| Module 4 | Module 3 | `eventBus.emit('dispute:opened', { userId })` / `eventBus.emit('dispute:resolved', { userId, penalty })` |
| Module 3 | Module 6 | `PATCH /api/profile/:id` — update `points`, `badges`, `tier` after recalculation |
