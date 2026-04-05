/**
 * seed.js â€” Populate the database with demo data for the viva.
 *
 * Usage:  node seed.js          (seeds fresh data)
 *         node seed.js --reset  (drops ALL existing data first)
 *
 * â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
 * â•‘  All accounts use password:  Demo@1234                      â•‘
 * â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
 * â•‘  Name              â”‚ Email              â”‚ Student ID        â•‘
 * â•‘â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â•‘
 * â•‘  Alice Fernando    â”‚ alice@demo.com     â”‚ IT20230001        â•‘
 * â•‘  Bob Perera        â”‚ bob@demo.com       â”‚ IT20230002        â•‘
 * â•‘  Charlie Silva     â”‚ charlie@demo.com   â”‚ IT20230003        â•‘
 * â•‘  Diana Jayasinghe  â”‚ diana@demo.com     â”‚ IT20230004        â•‘
 * â•‘  Eve Ratnayake     â”‚ eve@demo.com       â”‚ IT20230005        â•‘
 * â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Covers:
 *   âœ… Skills Page       â€” all 5 users have rich skill profiles
 *   âœ… Browse Tasks      â€” 8 OPEN tasks from various users (venue pills, urgency)
 *   âœ… My Tasks          â€” Alice has OPEN, MATCHED, COMPLETED tasks
 *   âœ… Accepted By Me    â€” Bob + Charlie + Diana each have accepted tasks
 *   âœ… Sessions List     â€” 3 ACTIVE + 2 COMPLETED sessions across users
 *   âœ… Session / Chat    â€” multi-message conversations in each active session
 *   âœ… Top Helper        â€” ranked matches pre-loaded for Task 1
 *   âœ… Match Page        â€” pending match requests visible for helpers
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";

import User from "./models/User.js";
import Skill from "./models/Skill.js";
import Task from "./models/Task.js";
import Match from "./models/Match.js";
import Session from "./models/Session.js";
import Message from "./models/Message.js";

const DEMO_PASSWORD = "Demo@1234";
const MIN = 60 * 1000;
const HR  = 60 * MIN;
const DAY = 24 * HR;

async function seed() {
  await connectDB();

  if (process.argv.includes("--reset")) {
    console.log("ðŸ—‘  Dropping existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Skill.deleteMany({}),
      Task.deleteMany({}),
      Match.deleteMany({}),
      Session.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log("   Done.\n");
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 1. USERS
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log("ðŸ‘¤ Creating users...");
  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const [alice, bob, charlie, diana, eve] = await User.insertMany([
    { fullName: "Alice Fernando",   email: "alice@demo.com",   studentId: "IT20230001", passwordHash: hash, reputation: 4, completedTasksCount: 5,  lastActive: new Date() },
    { fullName: "Bob Perera",       email: "bob@demo.com",     studentId: "IT20230002", passwordHash: hash, reputation: 5, completedTasksCount: 12, lastActive: new Date() },
    { fullName: "Charlie Silva",    email: "charlie@demo.com", studentId: "IT20230003", passwordHash: hash, reputation: 3, completedTasksCount: 7,  lastActive: new Date() },
    { fullName: "Diana Jayasinghe", email: "diana@demo.com",   studentId: "IT20230004", passwordHash: hash, reputation: 4, completedTasksCount: 3,  lastActive: new Date(Date.now() - 3 * DAY) },
    { fullName: "Eve Ratnayake",    email: "eve@demo.com",     studentId: "IT20230005", passwordHash: hash, reputation: 2, completedTasksCount: 1,  lastActive: new Date() },
  ]);
  console.log("   Created 5 users.\n");

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 2. SKILLS  (Skills Page demo)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log("ðŸŽ¯ Adding skills...");
  await Skill.insertMany([
    // â”€â”€ Bob: Expert coder
    { userId: bob._id, category: "Coding", subCategory: "Python",          skill: "Debugging",       level: "Expert" },
    { userId: bob._id, category: "Coding", subCategory: "Python",          skill: "OOP",             level: "Expert" },
    { userId: bob._id, category: "Coding", subCategory: "Python",          skill: "Data Structures", level: "Intermediate" },
    { userId: bob._id, category: "Coding", subCategory: "Web Development", skill: "React",           level: "Intermediate" },
    { userId: bob._id, category: "Coding", subCategory: "Web Development", skill: "Node.js",         level: "Expert" },
    { userId: bob._id, category: "Coding", subCategory: "Web Development", skill: "REST APIs",       level: "Expert" },

    // â”€â”€ Charlie: Java / UI specialist
    { userId: charlie._id, category: "Coding",  subCategory: "Python",       skill: "Debugging",    level: "Intermediate" },
    { userId: charlie._id, category: "Coding",  subCategory: "Java",         skill: "OOP",          level: "Expert" },
    { userId: charlie._id, category: "Coding",  subCategory: "Java",         skill: "Spring Boot",  level: "Expert" },
    { userId: charlie._id, category: "Coding",  subCategory: "Java",         skill: "Collections",  level: "Intermediate" },
    { userId: charlie._id, category: "UI/UX",   subCategory: "Design Tools", skill: "Figma",        level: "Expert" },
    { userId: charlie._id, category: "UI/UX",   subCategory: "UI Work",      skill: "Wireframing",  level: "Intermediate" },
    { userId: charlie._id, category: "UI/UX",   subCategory: "UI Work",      skill: "Prototyping",  level: "Beginner" },

    // â”€â”€ Diana: Writer + some coding
    { userId: diana._id, category: "Writing", subCategory: "Academic",      skill: "Report Formatting", level: "Expert" },
    { userId: diana._id, category: "Writing", subCategory: "Academic",      skill: "Documentation",     level: "Expert" },
    { userId: diana._id, category: "Writing", subCategory: "Academic",      skill: "Research Writing",  level: "Intermediate" },
    { userId: diana._id, category: "Writing", subCategory: "Presentation",  skill: "Slide Design",      level: "Intermediate" },
    { userId: diana._id, category: "Coding",  subCategory: "Python",        skill: "Debugging",         level: "Beginner" },

    // â”€â”€ Eve: Beginner / learner
    { userId: eve._id, category: "Coding", subCategory: "Web Development", skill: "React",    level: "Beginner" },
    { userId: eve._id, category: "Coding", subCategory: "Web Development", skill: "Express",  level: "Beginner" },
    { userId: eve._id, category: "UI/UX",  subCategory: "Design Tools",    skill: "Canva",    level: "Intermediate" },
    { userId: eve._id, category: "UI/UX",  subCategory: "Design Tools",    skill: "Figma",    level: "Beginner" },

    // â”€â”€ Alice: Intermediate across fields
    { userId: alice._id, category: "Coding",  subCategory: "Web Development", skill: "React",          level: "Intermediate" },
    { userId: alice._id, category: "Coding",  subCategory: "Web Development", skill: "MongoDB",        level: "Beginner" },
    { userId: alice._id, category: "Writing", subCategory: "Presentation",    skill: "Slide Design",   level: "Expert" },
    { userId: alice._id, category: "Writing", subCategory: "Presentation",    skill: "Pitch Deck Writing", level: "Intermediate" },
  ]);
  console.log(`   Created 26 skills.\n`);

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 3. TASKS
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log("ðŸ“‹ Creating tasks...");

  // â”€â”€ OPEN tasks (visible in Browse Tasks for everyone else) â”€

  // alice posts â€” URGENT + Meet + venue â†’ top for ranking demo
  const task1 = await Task.create({
    title: "Debug my Python linked-list assignment",
    description: "I have a Python assignment with several bugs in the linked-list implementation. Need someone experienced with OOP and data structures to walk through the code with me and explain where I went wrong.",
    expectedOutcome: "All unit tests passing and a clean, commented code structure.",
    category: "CODING", urgency: "URGENT", skillRequired: "Debugging",
    duration: 45, mode: "Meet", venue: "Library Study Room 3B",
    createdBy: alice._id, status: "OPEN",
    deadlineDays: 3, expireAt: new Date(Date.now() + 3 * DAY),
  });

  // alice posts â€” normal, Online
  const task2 = await Task.create({
    title: "Review my React component structure",
    description: "I built a dashboard with multiple React components but I'm not sure about the state management approach. Need guidance on lifting state and using context properly across sibling components.",
    expectedOutcome: "Cleaner component architecture with proper state flow documented.",
    category: "CODING", urgency: "NORMAL", skillRequired: "React",
    duration: 30, mode: "Online",
    createdBy: alice._id, status: "OPEN",
    deadlineDays: 2, expireAt: new Date(Date.now() + 2 * DAY),
  });

  // eve posts â€” Figma, Chat mode
  const task3 = await Task.create({
    title: "Help improve my Figma mobile prototype",
    description: "Working on a mobile app prototype in Figma for my HCI module. Need someone with auto-layout experience to review my component variants and improve the design system consistency.",
    expectedOutcome: "Polished Figma prototype with reusable, well-named components.",
    category: "UI", urgency: "NORMAL", skillRequired: "Figma",
    duration: 60, mode: "Chat",
    createdBy: eve._id, status: "OPEN",
    deadlineDays: 3, expireAt: new Date(Date.now() + 3 * DAY),
  });

  // charlie posts â€” Spring Boot, Meet + venue, URGENT
  const task6 = await Task.create({
    title: "Spring Boot REST controller setup help",
    description: "Setting up a Spring Boot project for my enterprise systems assignment. Need help configuring REST controllers, the service layer, and the JPA repository connecting to MySQL.",
    expectedOutcome: "Working CRUD endpoints tested in Postman with database persistence.",
    category: "CODING", urgency: "URGENT", skillRequired: "Spring Boot",
    duration: 60, mode: "Meet", venue: "CS Department Room 105",
    createdBy: charlie._id, status: "OPEN",
    deadlineDays: 2, expireAt: new Date(Date.now() + 2 * DAY),
  });

  // bob posts â€” Documentation, Chat mode â€” Alice or Diana could help
  const task7 = await Task.create({
    title: "Help document my Node.js API project",
    description: "I have a working REST API but need help writing proper documentation including endpoint descriptions, request/response examples, and a README. Looking for someone with technical writing skills.",
    expectedOutcome: "Complete README and API documentation with examples.",
    category: "WRITING", urgency: "NORMAL", skillRequired: "Documentation",
    duration: 45, mode: "Chat",
    createdBy: bob._id, status: "OPEN",
    deadlineDays: 3, expireAt: new Date(Date.now() + 3 * DAY),
  });

  // diana posts â€” Slide Design, Online
  const task8 = await Task.create({
    title: "Polish my project presentation slides",
    description: "I have a final year project presentation coming up and my slides look very plain. Need someone who is good at visual design and storytelling to help me make them professional.",
    expectedOutcome: "Visually polished 15-slide deck ready for presentation.",
    category: "WRITING", urgency: "NORMAL", skillRequired: "Slide Design",
    duration: 30, mode: "Online",
    createdBy: diana._id, status: "OPEN",
    deadlineDays: 2, expireAt: new Date(Date.now() + 2 * DAY),
  });

  // eve posts â€” Wireframing, Meet + venue
  const task9 = await Task.create({
    title: "Review wireframes for my e-commerce app",
    description: "I drew wireframes for an e-commerce app and want feedback on the UX flow before I move to high-fidelity mockups. Need someone to check navigation logic and user flow consistency.",
    expectedOutcome: "Annotated wireframe feedback and suggested improvements.",
    category: "UI", urgency: "NORMAL", skillRequired: "Wireframing",
    duration: 30, mode: "Meet", venue: "Design Studio Floor 3",
    createdBy: eve._id, status: "OPEN",
    deadlineDays: 2, expireAt: new Date(Date.now() + 2 * DAY),
  });

  // alice posts â€” MongoDB, Chat, Beginner-level question  
  const task10 = await Task.create({
    title: "Explain MongoDB aggregation pipelines",
    description: "I keep getting confused by MongoDB aggregation syntax. I need someone to walk me through $match, $group, $lookup and $project with real working examples from my project data.",
    expectedOutcome: "Working aggregation queries in my project + clear understanding.",
    category: "CODING", urgency: "NORMAL", skillRequired: "MongoDB",
    duration: 30, mode: "Online",
    createdBy: alice._id, status: "OPEN",
    deadlineDays: 3, expireAt: new Date(Date.now() + 3 * DAY),
  });

  // â”€â”€ MATCHED tasks (have active sessions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // alice posted â†’ bob accepted (active session with chat)
  const task4 = await Task.create({
    title: "Explain Node.js REST API patterns",
    description: "I need help understanding middleware patterns, error handling and route organisation in Express. Would appreciate a hands-on code walkthrough.",
    expectedOutcome: "Clear understanding of Express API architecture with working examples.",
    category: "CODING", urgency: "NORMAL", skillRequired: "Node.js",
    duration: 45, mode: "Meet", venue: "Engineering Lab Room 2A",
    createdBy: alice._id, acceptedBy: bob._id, status: "MATCHED",
    deadlineDays: 2, expireAt: new Date(Date.now() + 2 * DAY),
  });

  // bob posted â†’ diana accepted (active session â€” writing task)
  const task11 = await Task.create({
    title: "Write README for my Flask API project",
    description: "My Flask project is ready but it has no documentation. Need help writing a proper README with setup instructions, endpoint docs, and environment variable descriptions.",
    expectedOutcome: "Complete, professional README.md committed to the project.",
    category: "WRITING", urgency: "NORMAL", skillRequired: "Documentation",
    duration: 30, mode: "Online",
    createdBy: bob._id, acceptedBy: diana._id, status: "MATCHED",
    deadlineDays: 2, expireAt: new Date(Date.now() + 2 * DAY),
  });

  // charlie posted â†’ alice accepted (active session â€” Figma review)
  const task12 = await Task.create({
    title: "Review my Figma component library",
    description: "I built a Figma component library for a university project but I think there are inconsistencies. Needs a fresh pair of eyes to check spacing, naming and variant logic.",
    expectedOutcome: "Component library updated to be consistent and presentation-ready.",
    category: "UI", urgency: "NORMAL", skillRequired: "Figma",
    duration: 30, mode: "Chat",
    createdBy: charlie._id, acceptedBy: alice._id, status: "MATCHED",
    deadlineDays: 2, expireAt: new Date(Date.now() + 2 * DAY),
  });

  // â”€â”€ COMPLETED tasks (past sessions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // alice posted â†’ diana helped (completed yesterday)
  const task5 = await Task.create({
    title: "Format research report IEEE template",
    description: "Rough draft needs formatting to IEEE conference paper standard with proper citations.",
    expectedOutcome: "Properly formatted IEEE-style research paper.",
    category: "WRITING", urgency: "NORMAL", skillRequired: "Report Formatting",
    duration: 30, mode: "Online",
    createdBy: alice._id, acceptedBy: diana._id, status: "COMPLETED",
    deadlineDays: 2, expireAt: new Date(Date.now() - DAY),
  });

  // eve posted â†’ charlie helped (completed 2 days ago)
  const task13 = await Task.create({
    title: "Fix Java Collections bug in my assignment",
    description: "My Java assignment has a bug in a HashMap iteration that causes ConcurrentModificationException. Needed someone to explain and fix it.",
    expectedOutcome: "Bug fixed and understood by the student.",
    category: "CODING", urgency: "URGENT", skillRequired: "Collections",
    duration: 30, mode: "Online",
    createdBy: eve._id, acceptedBy: charlie._id, status: "COMPLETED",
    deadlineDays: 2, expireAt: new Date(Date.now() - 2 * DAY),
  });

  console.log("   Created 13 tasks.\n");

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 4. SESSIONS + MATCHES
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log("ðŸ¤ Creating sessions and matches...\n");

  const now = Date.now();

  // â”€â”€ Session A: Alice â†” Bob  (ACTIVE, started 10 min ago) â”€â”€â”€
  const sessionA = await Session.create({
    task: task4._id, poster: alice._id, helper: bob._id,
    mode: "Meet", status: "ACTIVE", venue: "Engineering Lab Room 2A",
    startedAt: new Date(now - 10 * MIN),
  });
  await Match.create({
    task: task4._id, helper: bob._id, requestedBy: alice._id,
    score: 86, status: "Accepted", session: sessionA._id,
    requestTime: new Date(now - 15 * MIN),
  });

  // â”€â”€ Session B: Bob â†” Diana  (ACTIVE, started 20 min ago) â”€â”€
  const sessionB = await Session.create({
    task: task11._id, poster: bob._id, helper: diana._id,
    mode: "Online", status: "ACTIVE",
    startedAt: new Date(now - 20 * MIN),
  });
  await Match.create({
    task: task11._id, helper: diana._id, requestedBy: bob._id,
    score: 74, status: "Accepted", session: sessionB._id,
    requestTime: new Date(now - 25 * MIN),
  });

  // â”€â”€ Session C: Charlie â†” Alice  (ACTIVE, started 5 min ago)
  const sessionC = await Session.create({
    task: task12._id, poster: charlie._id, helper: alice._id,
    mode: "Chat", status: "ACTIVE",
    startedAt: new Date(now - 5 * MIN),
  });
  await Match.create({
    task: task12._id, helper: alice._id, requestedBy: charlie._id,
    score: 60, status: "Accepted", session: sessionC._id,
    requestTime: new Date(now - 8 * MIN),
  });

  // â”€â”€ Session D: Alice â†” Diana  (COMPLETED, yesterday) â”€â”€â”€â”€â”€â”€
  const sessionD = await Session.create({
    task: task5._id, poster: alice._id, helper: diana._id,
    mode: "Online", status: "COMPLETED",
    startedAt: new Date(now - 2 * DAY),
    endedAt:   new Date(now - 2 * DAY + 30 * MIN),
  });
  await Match.create({
    task: task5._id, helper: diana._id, requestedBy: alice._id,
    score: 72, status: "Accepted", session: sessionD._id,
    requestTime: new Date(now - 2 * DAY - 5 * MIN),
  });

  // â”€â”€ Session E: Eve â†” Charlie  (COMPLETED, 2 days ago) â”€â”€â”€â”€â”€
  const sessionE = await Session.create({
    task: task13._id, poster: eve._id, helper: charlie._id,
    mode: "Online", status: "COMPLETED",
    startedAt: new Date(now - 3 * DAY),
    endedAt:   new Date(now - 3 * DAY + 30 * MIN),
  });
  await Match.create({
    task: task13._id, helper: charlie._id, requestedBy: eve._id,
    score: 65, status: "Accepted", session: sessionE._id,
    requestTime: new Date(now - 3 * DAY - 5 * MIN),
  });

  console.log("   Created 5 sessions + 5 accepted matches.\n");

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 5. CHAT MESSAGES  (Chat Box demo)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log("ðŸ’¬ Adding chat messages...");

  // Session A â€” Alice â†” Bob (Node.js session, 8 messages)
  await Message.insertMany([
    { session: sessionA._id, sender: alice._id, content: "Hi Bob! Thanks for accepting. Are you at the lab yet?", createdAt: new Date(now - 9 * MIN) },
    { session: sessionA._id, sender: bob._id,   content: "Hey Alice! Heading over now â€” 5 minutes.",              createdAt: new Date(now - 8 * MIN) },
    { session: sessionA._id, sender: alice._id, content: "Great. My laptop is set up with the Express project open.", createdAt: new Date(now - 7 * MIN) },
    { session: sessionA._id, sender: bob._id,   content: "Perfect. Let's start with the middleware chain â€” it's the foundation of every Express app.",  createdAt: new Date(now - 6 * MIN) },
    { session: sessionA._id, sender: alice._id, content: "Okay I can see app.use() calls. What exactly happens when a request comes in?", createdAt: new Date(now - 5 * MIN) },
    { session: sessionA._id, sender: bob._id,   content: "Middleware runs in order. Each function gets (req, res, next) â€” call next() to pass to the next handler.",  createdAt: new Date(now - 4 * MIN) },
    { session: sessionA._id, sender: alice._id, content: "Ohh that makes so much more sense now! So my auth middleware should be before the route handlers?", createdAt: new Date(now - 3 * MIN) },
    { session: sessionA._id, sender: bob._id,   content: "Exactly. And if auth fails, just return res.status(401) without calling next().",  createdAt: new Date(now - 2 * MIN) },
  ]);

  // Session B â€” Bob â†” Diana (README writing, 6 messages)
  await Message.insertMany([
    { session: sessionB._id, sender: bob._id,   content: "Hi Diana! Thanks for jumping on this. Here's the GitHub link to the Flask project.", createdAt: new Date(now - 18 * MIN) },
    { session: sessionB._id, sender: diana._id, content: "Got it, reading through the code now. Give me a minute.",                              createdAt: new Date(now - 17 * MIN) },
    { session: sessionB._id, sender: diana._id, content: "Okay I see the issue â€” there's no description of the environment variables. What does SECRET_KEY do?", createdAt: new Date(now - 15 * MIN) },
    { session: sessionB._id, sender: bob._id,   content: "That's the Flask session secret. It should never be committed to Git.",               createdAt: new Date(now - 14 * MIN) },
    { session: sessionB._id, sender: diana._id, content: "Got it. I'll add a .env.example file too so new developers know what to set.",        createdAt: new Date(now - 12 * MIN) },
    { session: sessionB._id, sender: bob._id,   content: "That would be perfect, thank you!",                                                   createdAt: new Date(now - 10 * MIN) },
  ]);

  // Session C â€” Charlie â†” Alice (Figma review, 4 messages â€” newer session)
  await Message.insertMany([
    { session: sessionC._id, sender: charlie._id, content: "Hi Alice! The Figma link is in the task description. Let me know when you have it open.", createdAt: new Date(now - 4 * MIN) },
    { session: sessionC._id, sender: alice._id,   content: "I can see it! First thing I notice â€” your button component has 3 different padding values.", createdAt: new Date(now - 3 * MIN) },
    { session: sessionC._id, sender: charlie._id, content: "Ah I knew something was off. Which ones should I standardise?",                             createdAt: new Date(now - 2 * MIN) },
    { session: sessionC._id, sender: alice._id,   content: "Let's use 12px vertical, 24px horizontal as your base. I'll mark all the inconsistent ones.", createdAt: new Date(now - 1 * MIN) },
  ]);

  // Session D â€” past messages (for completed session context)
  await Message.insertMany([
    { session: sessionD._id, sender: alice._id,   content: "Hi Diana! I've shared the doc. It's a 12-page report that needs IEEE formatting.", createdAt: new Date(now - 2 * DAY - 1 * HR + 5 * MIN) },
    { session: sessionD._id, sender: diana._id,   content: "Got it! I'll start with the title page and references section first.",             createdAt: new Date(now - 2 * DAY - 1 * HR + 8 * MIN) },
    { session: sessionD._id, sender: alice._id,   content: "Amazing, thank you so much. This submission is tomorrow morning.",                 createdAt: new Date(now - 2 * DAY - 1 * HR + 10 * MIN) },
    { session: sessionD._id, sender: diana._id,   content: "All done! I've formatted everything, added a list of figures, and fixed the citation style.", createdAt: new Date(now - 2 * DAY - 1 * HR + 25 * MIN) },
    { session: sessionD._id, sender: alice._id,   content: "This looks incredible, Diana! You're a lifesaver. ðŸ™",                            createdAt: new Date(now - 2 * DAY - 1 * HR + 28 * MIN) },
  ]);

  console.log("   Created 23 chat messages.\n");

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 6. PENDING MATCHES for Task 1  (Match Page + Top Helper)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log("ðŸ“Š Creating pending match requests for Task 1 ranking demo...");
  await Match.insertMany([
    { task: task1._id, helper: bob._id,     requestedBy: alice._id, score: 92, status: "Pending", requestTime: new Date() },
    { task: task1._id, helper: charlie._id, requestedBy: alice._id, score: 64, status: "Pending", requestTime: new Date() },
    { task: task1._id, helper: diana._id,   requestedBy: alice._id, score: 28, status: "Pending", requestTime: new Date() },
  ]);
  console.log("   Created 3 pending matches.\n");

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 7. SUMMARY
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");
  console.log("  âœ…  SEED COMPLETE");
  console.log("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n");
  console.log("  Password for ALL accounts:  Demo@1234\n");
  console.log("  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”");
  console.log("  â”‚ Name                 â”‚ Email                â”‚ Student ID â”‚");
  console.log("  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤");
  console.log("  â”‚ Alice Fernando       â”‚ alice@demo.com       â”‚ IT20230001 â”‚");
  console.log("  â”‚ Bob Perera           â”‚ bob@demo.com         â”‚ IT20230002 â”‚");
  console.log("  â”‚ Charlie Silva        â”‚ charlie@demo.com     â”‚ IT20230003 â”‚");
  console.log("  â”‚ Diana Jayasinghe     â”‚ diana@demo.com       â”‚ IT20230004 â”‚");
  console.log("  â”‚ Eve Ratnayake        â”‚ eve@demo.com         â”‚ IT20230005 â”‚");
  console.log("  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜\n");
  console.log("  Feature coverage:");
  console.log("  â€¢ Skills Page    â†’ login as any user â†’ 'Skills' tab (26 skills seeded)");
  console.log("  â€¢ Browse Tasks   â†’ login as Bob/Charlie â†’ see 8 open tasks (venue pills, urgency)");
  console.log("  â€¢ Task Popup     â†’ click 'Help / Accept' â†’ see full detail popup with venue");
  console.log("  â€¢ My Tasks       â†’ login as Alice â†’ OPEN (x5) + MATCHED (x1) + COMPLETED (x1)");
  console.log("  â€¢ Accepted By Me â†’ login as Bob â†’ see Node.js task; Diana â†’ IEEE + README tasks");
  console.log("  â€¢ Sessions List  â†’ login as Alice â†’ 3 ACTIVE + 2 COMPLETED sessions");
  console.log("  â€¢ Session + Chat â†’ Alice Task 4 â†’ 8 messages; Bob Task 11 â†’ 6 messages");
  console.log("  â€¢ Top Helper     â†’ Alice My Tasks â†’ Task 1 â†’ Bob shown as top (score 92)");
  console.log("  â€¢ Match Page     â†’ Alice â†’ Task 1 â†’ 3 ranked candidates\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
