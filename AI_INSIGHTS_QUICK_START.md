# 🚀 AI Reputation Insights – Quick Start Guide

**Setup Time:** 5 minutes  
**Testing Time:** 10 minutes

---

## 1️⃣ Backend Setup

### **Step 1: Verify Dependencies**
```bash
cd backend
npm list groq-sdk
# Should show: groq-sdk@0.x.x
```

If missing:
```bash
npm install groq-sdk
```

### **Step 2: Check Environment**
Verify `.env` file has:
```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxx  # Your Groq API key
```

🔗 Get free key: https://console.groq.com/keys

### **Step 3: Verify Server Running**
```bash
npm run dev
# Should see: Server running on port 5000 🚀
```

---

## 2️⃣ Frontend Setup

### **Step 1: Verify Dependencies**
```bash
cd ../frontend
npm list react-icons
# Should show react-icons installed
```

### **Step 2: Start Dev Server**
```bash
npm run dev
# Should show: ➜  Local:   http://localhost:3000
```

---

## 3️⃣ Test the AI Insights Feature

### **Option A: Via Web UI (Recommended)**

1. **Login:**
   - Go to `http://localhost:3000`
   - Login with test account

2. **Navigate to Profile:**
   - Click profile icon → "View Profile"
   - Or go to `/profile`

3. **View Dashboard Tab:**
   - Should see "Dashboard" tab selected
   - Scroll down to find **"AI Reputation Insights"** section
   - Look for 🧠 icon

4. **Explore Insights:**
   - **Tab 1:** "Why You're Here" – See AI explanation
   - **Tab 2:** "How to Improve" – See personalized plan
   - **Tab 3:** "Alerts" – Check for anomalies
   - **Tab 4:** "7-Day Forecast" – See prediction

### **Option B: Via API (Direct Testing)**

```bash
# Get insights for a specific user
curl -X GET http://localhost:5000/api/reputation/USER_ID/insights \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get prediction (7 days ahead)
curl -X GET http://localhost:5000/api/reputation/USER_ID/predict?daysAhead=7 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Replace:
- `USER_ID` with actual MongoDB user ID
- `YOUR_JWT_TOKEN` with valid JWT token

---

## 4️⃣ What You'll See

### **Dashboard with AI Insights:**

```
┌─────────────────────────────────────────┐
│  🧠 AI Reputation Insights             │
│  Personalized analysis of your rep     │
├─────────────────────────────────────────┤
│  [Why You're Here] [How to Improve]    │
│  [Alerts] [7-Day Forecast]             │
├─────────────────────────────────────────┤
│  ✔ AI Analysis                         │
│  "Your score is 68 because you have   │
│   excellent ratings (4.6/5)..."        │
├─────────────────────────────────────────┤
│  📊 Stats:                             │
│  Avg Rating: 4.6/5  Sessions: 12      │
│  Endorsements: 8    Badges: 2         │
└─────────────────────────────────────────┘
```

### **Tabs Content:**

**Tab 1: Why You're Here**
```
🧠 AI Analysis:
Your reputation score of 68...

📋 Score Breakdown:
✔ You received a high rating (4.6/5 average)
✔ You completed sessions reliably
⚠ You have 1 no-show on record
```

**Tab 2: How to Improve**
```
🎯 Next Goal:
Progress to next tier: 2 points needed

🧠 AI-Powered Plan:
1. Complete 2 more sessions on time
2. Focus on improving communication
3. Earn 3 more endorsements in React

💡 Quick Tips:
→ Improve communication score (currently below 4.0)
→ Get more endorsements to boost reputation
```

**Tab 3: Alerts**
```
✅ No anomalies detected. Great standing!
```

**Tab 4: 7-Day Forecast**
```
Current: 68 (Gold) ➜ 72 (Platinum)
📈 Trend: Improving ↑

If you continue current performance,
expected score in 7 days: 72 (Platinum)
```

---

## 5️⃣ Troubleshooting

### **Issue: "No insights generated"**
**Solution:**
1. Check Groq API key in `.env`
2. Verify user has some reputation data (ratings/endorsements)
3. Check browser console for error messages

### **Issue: "Loading... AI analyzing your reputation"**
**Solution:**
- This is normal! First load takes 2-3 seconds while AI generates text
- Wait for it to complete
- Check network tab if stuck

### **Issue: Shows only rule-based suggestions (no AI text)**
**Solution:**
- Groq API may be down or rate-limited
- System correctly falls back to rule-based logic
- All features still work!

### **Issue: "Authorization" error**
**Solution:**
1. Make sure you're logged in
2. Check JWT token is valid
3. Try logging out and back in

### **Issue: CORS error**
**Solution:**
1. Verify backend is running on port 5000
2. Check frontend is on port 3000
3. Restart both servers

---

## 6️⃣ Key Files to Check

**If AI text doesn't generate:**
→ Check `backend/utils/reputationAI.js` at line ~48

**If component doesn't appear:**
→ Check `frontend/src/pages/reputation/UserProfile.jsx` has import

**If endpoints 404:**
→ Check `backend/routes/reputationRoutes.js` has routes

**If styling wrong:**
→ Check `ReputationInsights.jsx` Tailwind classes

---

## 7️⃣ Manual Testing Script

```javascript
// Run in browser console on profile page:

// Test 1: Check if component exists
console.log(document.querySelector('[data-testid="reputation-insights"]'));

// Test 2: Check API response
fetch('/api/reputation/YOUR_USER_ID/insights', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(console.log)

// Test 3: Check prediction
fetch('/api/reputation/YOUR_USER_ID/predict?daysAhead=7', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(console.log)
```

---

## 8️⃣ Performance Notes

**Expected Load Times:**
- Component mount: < 1 second
- AI explanation generation: 2-3 seconds (first time, cached after)
- All features load in parallel (fast!)
- UI updates smoothly

**Optimization Tips:**
- AI responses are generated on-demand (not pre-computed)
- Multiple requests to same endpoint within 1 second are cached by browser
- Groq API is very fast (< 1s per call)

---

## 9️⃣ Features Checklist

- [ ] Component appears in Dashboard
- [ ] 🧠 AI icon visible
- [ ] Tabs switch without errors
- [ ] "Why You're Here" shows explanation
- [ ] "How to Improve" shows suggestions
- [ ] "Alerts" shows any anomalies
- [ ] "7-Day Forecast" shows prediction
- [ ] Stats display correct numbers
- [ ] Responsive on mobile
- [ ] Loading state works
- [ ] Error handling works

---

## 🔟 Success Indicators

✅ You've succeeded when:
- AI Insights card appears in profile dashboard
- You see natural language explanation (not just code)
- Anomaly detection shows warnings if applicable
- Prediction shows realistic score trajectory
- Everything styled consistently with app
- No console errors

---

## 📚 Documentation Links

- Full details: `AI_REPUTATION_INSIGHTS_SUMMARY.md`
- Module 3 overview: `MODULE_3_IMPLEMENTATION_SUMMARY.md`
- Project overview: `COMPLETE_PROJECT_OVERVIEW.md`

---

## 🎯 Next Steps

1. ✅ Start both servers (backend + frontend)
2. ✅ Login to your account
3. ✅ Navigate to profile
4. ✅ Look for AI Insights section
5. ✅ Click through all 4 tabs
6. ✅ Verify AI explanations are showing
7. ✅ Test with different user profiles
8. ✅ Check error handling (clear JWT token, try API directly)

---

**Ready?** 🚀 Start the servers and check it out!

**Questions?** Check the full summary document for detailed explanations.

**Issues?** Follow the troubleshooting section above.

---

**Enjoy your AI-powered reputation insights!** 🧠✨
