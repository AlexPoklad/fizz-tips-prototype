// pages/api/save-user.js

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const dataPath = path.join(process.cwd(), 'data', 'users.json');
  const { userId, profile } = req.body;

  if (!userId || !profile) return res.status(400).json({ error: 'Missing userId or profile' });

  try {
    let current = {};
    if (fs.existsSync(dataPath)) {
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      current = JSON.parse(fileData);
    }

    current[userId] = profile;
    fs.writeFileSync(dataPath, JSON.stringify(current, null, 2));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error writing user data:', err);
    return res.status(500).json({ error: 'Failed to save profile' });
  }
}
