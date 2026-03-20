import Task from "../models/Task.js";

export async function expireOverdueTasks() {
  try {
    const now = new Date();

    const result = await Task.updateMany(
      {
        status: "OPEN",
        expireAt: { $lte: now },
      },
      {
        $set: { status: "EXPIRED" },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Expired tasks updated: ${result.modifiedCount}`);
    }
  } catch (err) {
    console.error("Task expiry update failed:", err.message);
  }
}