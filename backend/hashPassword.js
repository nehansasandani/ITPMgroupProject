import bcrypt from "bcryptjs";

const password = "Admin@123"; // ← change this to your chosen password

const hash = await bcrypt.hash(password, 12);

console.log("=================================");
console.log("Your bcrypt hash:");
console.log(hash);
console.log("=================================");
console.log("Copy the hash above into MongoDB");