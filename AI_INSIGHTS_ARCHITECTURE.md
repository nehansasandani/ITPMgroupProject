# 🧠 AI Reputation Insights – Visual Architecture

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  UserProfile.jsx (Dashboard Tab)                           │
│  ├─ ReputationInsights.jsx (NEW!)                         │
│  │  ├─ Tab 1: AI Explanation + Score Breakdown           │
│  │  ├─ Tab 2: AI Plan + Suggestions + Progress           │
│  │  ├─ Tab 3: Anomalies + Severity                       │
│  │  └─ Tab 4: Score Prediction + Trend                   │
│  │                                                         │
│  │  API Calls:                                            │
│  │  ├─ getReputationInsights(userId)                     │
│  │  └─ predictReputationScore(userId)                    │
│  │                                                         │
│  └─ UI: Tailwind CSS + react-icons (FiBrain icon ✨)    │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
            HTTP API (axios)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Routes: reputationRoutes.js (NEW!)                        │
│  ├─ GET /api/reputation/:userId/insights   ────┐          │
│  └─ GET /api/reputation/:userId/predict    ────┼─┐        │
│                                                  │ │        │
│  Controllers: reputationController.js (NEW!)    │ │        │
│  ├─ getReputationInsightsHandler() ◄────────────┤ │        │
│  └─ predictReputationScore()        ◄────────────┼─┤       │
│                                                  │ │        │
│  Utils: reputationAI.js (NEW!)                  │ │        │
│  ├─ getReputationStats()              ◄─────────┤ │        │
│  ├─ generateAIExplanation()             │         │ │        │
│  ├─ generateAIImprovementPlan()         │         │ │        │
│  ├─ generateScoreExplanation()          │         │ │        │
│  ├─ generateSuggestions()               │         │ │        │
│  ├─ detectAnomalies()                   │         │ │        │
│  └─ predictFutureScore()     ◄──────────┘         │ │        │
│                                                   │ │        │
└────────────────┬───────────────────┬─────────────┬─┴────────┘
                 │                   │             │
        ┌────────▼─────┐    ┌────────▼──────┐   ┌─▼─────────┐
        │   MongoDB    │    │  Groq API    │   │ Analysis  │
        │              │    │   (Groq SDK) │   │ Logic     │
        │ Collections: │    │              │   │           │
        │ ├─ Users     │    │ Generates AI │   │ Rule-     │
        │ ├─ Ratings   │    │ explanations │   │ based     │
        │ ├─ Endorse-  │    │ & plans      │   │ fallback  │
        │ │  ments     │    │ (natural     │   │           │
        │ ├─ Reputation│    │  language)   │   │           │
        │ └─ Reputation│    │              │   │           │
        │    Log       │    └──────────────┘   └───────────┘
        └──────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│ Opens       │
│ Profile    │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ ReputationInsights   │
│ Component Mounts     │
└──────┬───────────────┘
       │
       ├─ Request 1: /insights
       │  
       ├─ Request 2: /predict
       │
       ▼
┌──────────────────────────────┐
│ Backend: getReputationStats  │
│ ├─ Get Reputation doc        │
│ ├─ Get Ratings (calc avg)   │
│ ├─ Get Endorsements         │
│ └─ Get ReputationLog (10)   │
└──────┬───────────────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌────────────┐   ┌────────────┐   ┌────────────────┐
│ Generate   │   │ Generate   │   │ Detect         │
│ AI Explana-│   │ AI Improve │   │ Anomalies +    │
│ tion       │   │ Plan       │   │ Predict Score  │
│ (Groq API) │   │ (Groq API) │   │ (Rule-based)   │
└────┬───────┘   └────┬───────┘   └────┬───────────┘
     │                │                 │
     └────────┬───────┴─────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Build Response JSON │
    │ ├─ aiExplanation    │
    │ ├─ aiPlan           │
    │ ├─ suggestions      │
    │ ├─ anomalies        │
    │ └─ stats            │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Return to Frontend  │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Display in UI Tabs  │
    │ ├─ Tab 1: Why      │
    │ ├─ Tab 2: How      │
    │ ├─ Tab 3: Alerts   │
    │ └─ Tab 4: Forecast │
    └─────────────────────┘
```

---

## Component Tree

```
UserProfile.jsx (Dashboard Tab)
│
├─ CircularScoreGauge
├─ ReputationTimeline
├─ ScoreVisibilitySettings
│
└─ ReputationInsights.jsx (NEW!) ⭐
   │
   ├─ Header with 🧠 Icon
   │
   ├─ Tabs Navigation
   │  ├─ "Why You're Here"
   │  ├─ "How to Improve"
   │  ├─ "Alerts"
   │  └─ "7-Day Forecast"
   │
   ├─ Tab Content
   │  ├─ AI Analysis Card
   │  ├─ Score Breakdown
   │  ├─ Improvement Plan
   │  ├─ Quick Tips
   │  ├─ Anomaly List
   │  └─ Prediction Display
   │
   └─ Stats Summary Grid
      ├─ Avg Rating
      ├─ Sessions Count
      ├─ Endorsements Count
      └─ Badges Count
```

---

## API Request/Response Flow

```
REQUEST:
┌────────────────────────────────────────┐
│ GET /api/reputation/:userId/insights   │
│ Headers:                               │
│   Authorization: Bearer JWT_TOKEN      │
└────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ Backend Processing:                    │
│ 1. Verify user exists                 │
│ 2. Calculate stats                    │
│ 3. Call Groq AI (parallel)            │
│ 4. Detect anomalies                   │
│ 5. Build response                     │
└────────────────────────────────────────┘
                │
                ▼
RESPONSE:
┌────────────────────────────────────────┐
│ 200 OK                                 │
│ {                                      │
│   "success": true,                     │
│   "data": {                            │
│     "score": 68,                       │
│     "tier": "Gold",                    │
│     "aiExplanation": "...",            │
│     "aiImprovementPlan": "...",        │
│     "scoreExplanation": [...],         │
│     "suggestions": [...],              │
│     "anomalies": [...],                │
│     "stats": {...}                     │
│   }                                    │
│ }                                      │
└────────────────────────────────────────┘
```

---

## State Management Flow

```
ReputationInsights Component State:

┌─────────────────────────────────────┐
│  useState(insights, null)           │
│  useState(prediction, null)         │
│  useState(loading, true)            │
│  useState(error, '')                │
│  useState(activeTab, 'explanation') │
└─────────────────────────────────────┘
         │
         │ useEffect on mount
         │
         ▼
┌─────────────────────────────────────┐
│  Fetch both APIs in parallel        │
│  await Promise.all([...])           │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Update state:                      │
│  ├─ setInsights(data)              │
│  ├─ setPrediction(data)            │
│  ├─ setLoading(false)              │
│  └─ setError('')                   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Component Re-renders               │
│  ├─ Show loading state if loading   │
│  ├─ Show error if failed            │
│  ├─ Show tabs if success            │
│  └─ Tab content based on activeTab  │
└─────────────────────────────────────┘
```

---

## AI Processing Pipeline

```
INPUT DATA:
┌──────────────────────────────┐
│ score: 68                    │
│ avgRating: 4.6               │
│ totalRatings: 12             │
│ endorsementCount: 8          │
│ noShowCount: 1               │
│ badges: ["Reliable", ...]    │
│ recentActivity: [...]        │
└──────────────────────────────┘
        │
        ├──────────────────────┬─────────────────┐
        │                      │                 │
        ▼                      ▼                 ▼
    ┌────────────┐      ┌────────────┐    ┌─────────┐
    │ Groq API   │      │ Groq API   │    │ Rule-   │
    │            │      │            │    │ based   │
    │ Explain:   │      │ Suggest:   │    │         │
    │ "Your      │      │ "Complete  │    │ Anomaly │
    │ score is   │      │  2 more    │    │ Detect  │
    │ 68 because │      │ sessions"  │    │ "Endor  │
    │ ..."       │      │            │    │ spike"  │
    └────┬───────┘      └────┬───────┘    └────┬────┘
         │                   │                 │
         └───────────────────┴─────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ OUTPUT RESPONSE JSON   │
         │ with all 4 insights    │
         └────────────────────────┘
```

---

## Error Handling Flow

```
Request Sent
    │
    ├─ API Error?
    │  ├─ 404: User not found
    │  ├─ 500: Server error
    │  └─ Network error
    │
    ▼
Try/Catch Block
    │
    ├─ Catch Error
    │  ├─ Log to console
    │  ├─ Set error state
    │  └─ Show error message
    │
    ▼
Frontend Displays:
    ├─ Loading state timeout → error
    ├─ API error → error message
    ├─ Parse error → fallback
    └─ Success → display insights
```

---

## Performance Characteristics

```
Load Time Breakdown:

0ms    ├─ Component mounts
       │
50ms   ├─ API requests sent (parallel)
       │
200ms  ├─ Backend calculates stats
       │
400ms  ├─ Groq AI starts responding
       │
2500ms ├─ AI completes both calls
       │
2600ms ├─ Frontend receives response
       │
2700ms ├─ Component re-renders
       │
3000ms └─ User sees all insights

Total: ~3 seconds for full load
(First request slower, cached after)
```

---

## Interaction Sequence Diagram

```
User                Component            Backend          Groq API
  │                    │                   │                 │
  │ Open Profile       │                   │                 │
  ├───────────────────►│                   │                 │
  │                    │ useEffect         │                 │
  │                    │ mount             │                 │
  │                    │                   │                 │
  │                    │ Fetch /insights   │                 │
  │                    ├──────────────────►│                 │
  │                    │ Fetch /predict    │                 │
  │                    ├──────────────────►│                 │
  │                    │                   │                 │
  │                    │                   │ Calculate stats │
  │                    │                   │                 │
  │                    │                   │ Generate AI     │
  │                    │                   ├────────────────►│
  │                    │                   │ Generate AI     │
  │                    │                   ├────────────────►│
  │                    │                   │                 │
  │                    │                   │ Response 1      │
  │                    │◄──────────────────┤                 │
  │                    │ Response 2        │                 │
  │                    │◄──────────────────┤                 │
  │                    │                   │◄────────────────┤
  │                    │ AI Response       │                 │
  │                    │                   │◄────────────────┤
  │                    │ Combined Response │                 │
  │                    │                   │                 │
  │◄───────────────────┤ Update State      │                 │
  │                    │ Re-render         │                 │
  │ See Insights       │                   │                 │
  │                    │                   │                 │
  │ Click Tab          │                   │                 │
  ├───────────────────►│                   │                 │
  │                    │ Switch Tab        │                 │
  │ View Content       │ (no new API call) │                 │
  │◄───────────────────┤                   │                 │
```

---

## Module Integration Points

```
Module 3 Components:
├─ Endorsements ────────────────┐
├─ Reputation ──────────────────┼─ Ratings Input
├─ ReputationLog ───────────────┤
└─ ScoreVisibility ─────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │ ReputationAI.js  │ (NEW!)
         │                  │
         │ Analyzes all ────┼─ AI Insights (NEW!)
         │ Module 3 data    │
         │                  │
         └──────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │ ReputationInsights
         │ React Component │ (NEW!)
         └──────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │ UserProfile.jsx  │
         │ Dashboard Tab    │
         └──────────────────┘
```

---

## File Structure Visualization

```
PROJECT/
├── backend/
│   ├── utils/
│   │   ├── reputationAI.js ⭐ (NEW! 450 lines)
│   │   └── gemini.js (existing)
│   │
│   ├── controllers/
│   │   └── reputationController.js ✏️ (updated +50 lines)
│   │
│   └── routes/
│       └── reputationRoutes.js ✏️ (updated +2 routes)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── reputation/
│   │   │       └── ReputationInsights.jsx ⭐ (NEW! 300 lines)
│   │   │
│   │   ├── api/
│   │   │   └── Reputation.js ✏️ (updated +2 functions)
│   │   │
│   │   └── pages/
│   │       └── reputation/
│   │           └── UserProfile.jsx ✏️ (updated +1 import, +1 component)
│   │
│   └── ...
│
└── docs/
    ├── AI_REPUTATION_INSIGHTS_SUMMARY.md ⭐ (NEW!)
    ├── AI_INSIGHTS_QUICK_START.md ⭐ (NEW!)
    └── MODULE_3_IMPLEMENTATION_SUMMARY.md (existing)

Legend:
⭐ = New file created
✏️ = Existing file modified
```

---

## Key Statistics

```
Code Added:
├─ Backend: ~500 lines (reputationAI.js)
├─ Backend: ~50 lines (controller/route updates)
├─ Frontend: ~300 lines (ReputationInsights.jsx)
├─ Frontend: ~20 lines (API wrapper/imports)
└─ Total: ~870 lines of new/updated code

API Endpoints:
├─ GET /api/reputation/:userId/insights
└─ GET /api/reputation/:userId/predict

React Components:
├─ ReputationInsights.jsx (new)
├─ With 4 tabs for different insights
└─ Full error handling + loading states

AI Features:
├─ Groq AI integration (2 calls per user)
├─ Rule-based analysis (fallback + anomalies)
├─ Prediction engine
├─ Anomaly detection
└─ Natural language explanations

Files Modified:
├─ 5 files total
├─ 2 new files
└─ 3 existing files
```

---

This visual architecture shows how all components work together to deliver AI-powered reputation insights! 🧠✨
