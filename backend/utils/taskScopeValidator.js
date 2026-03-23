export function validateTaskScope({ title, description, expectedOutcome }) {
  const issues = [];
  const text = `${title} ${description} ${expectedOutcome}`.toLowerCase();

  const vaguePhrases = [
    "need help",
    "help me",
    "urgent",
    "asap",
    "project help",
    "assignment help",
    "anything",
    "do my",
  ];

  if ((title || "").trim().length < 8) issues.push("Title is too short.");
  if ((description || "").trim().length < 20) issues.push("Description is too short. Add more context.");
  if ((expectedOutcome || "").trim().length < 10)
    issues.push("Expected outcome is too short. Describe the exact result you want.");

  const vagueHits = vaguePhrases.filter((p) => text.includes(p));
  if (vagueHits.length > 0) issues.push("Task looks vague (contains generic phrases). Make it more specific.");

  // Encourage outcome clarity (simple)
  if (!expectedOutcome || !expectedOutcome.includes(" ")) {
    issues.push("Expected outcome should be a clear sentence, not a single word.");
  }

  return { ok: issues.length === 0, issues };
}