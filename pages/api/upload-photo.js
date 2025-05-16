import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), "public", "images"),
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Failed to parse form" });

    const username = fields.username?.[0] || fields.username;
    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!username || !file || !file.filepath) {
      return res.status(400).json({ error: "Missing file or username" });
    }

    const oldPath = file.filepath;
    const newPath = path.join(form.uploadDir, `${username}.jpg`);

    fs.rename(oldPath, newPath, (err) => {
      if (err) return res.status(500).json({ error: "Failed to save file" });
      return res.status(200).json({ success: true });
    });
  });
}