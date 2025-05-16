// pages/api/get-user.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { userId } = req.query;
  const file = path.join(process.cwd(), "data/users.json");

  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data[userId]) return res.status(404).json({ error: "User not found" });

    return res.status(200).json(data[userId]);
  } catch (err) {
    return res.status(500).json({ error: "Failed to read user data" });
  }
}