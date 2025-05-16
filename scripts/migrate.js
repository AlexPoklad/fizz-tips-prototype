const fs = require("fs");
const path = require("path");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);
const file = path.join(__dirname, "../data/users.json");

const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
const result = {};

for (const username in raw) {
  const entry = raw[username];
  const profile =
    entry?.profile?.profile ||
    entry?.profile ||
    entry;

  const userId = nanoid();
  result[userId] = {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
    phone: profile.phone || ""
  };
}

fs.writeFileSync(file, JSON.stringify(result, null, 2));
console.log("✅ users.json migrated without usernames");