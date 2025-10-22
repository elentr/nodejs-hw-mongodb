import path from 'node:path';
import fs from 'node:fs/promises';

export const saveFileToUploadDir = async file => {
  const tempUploadDir = path.join(process.cwd(), 'temp');
  const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  await fs.rename(
    path.join(tempUploadDir, file.filename),
    path.join(UPLOAD_DIR, file.filename)
  );

  return `${process.env.APP_DOMAIN}/uploads/${file.filename}`;
};
