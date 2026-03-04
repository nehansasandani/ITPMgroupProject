const VAGUE_PATTERNS = [
  /help\b/i,
  /urgent\b/i,
  /asap\b/i,
  /project\b/i,
  /assignment\b/i,
  /anything\b/i,
  /need\s+support\b/i,
  /pls\b/i,
  /please\b/i,
];

export function checkTaskClarity({ title, description, expectedOutcome }) {
  const issues = [];

  const t = (title || "").trim();
  const d = (description || "").trim();
  const o = (expectedOutcome || "").trim();

  if (t.length < 8) issues.push("Title is too short. Add more details.");
  if (d.length < 20) issues.push("Description is too short. Explain the problem clearly.");
  if (o.length < 10) issues.push("Expected outcome is too short. Say what result you want.");

  const combined = `${t} ${d} ${o}`;
  const vagueHits = VAGUE_PATTERNS.filter((p) => p.test(combined));
  if (vagueHits.length >= 2) {
    issues.push("Task looks too vague/open-ended. Add specific details and expected result.");
  }

  // Simple “open-ended” blocker
  if (combined.length < 60) {
    issues.push("Task is not detailed enough. Add more context to avoid scope creep.");
  }

  return issues;
}