import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';

const tempDir = path.join(process.cwd(), 'temp');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
