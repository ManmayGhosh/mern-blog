import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', subfolder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = crypto.randomBytes(16).toString('hex');
      cb(null, `${Date.now()}-${unique}${ext}`);
    }
  });
}

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'), false);
  }
}

export const uploadPostImage = multer({
  storage: makeStorage('posts'),
  fileFilter,
  limits: { fileSize: MAX_SIZE }
}).single('coverImage');

export const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter,
  limits: { fileSize: MAX_SIZE }
}).single('avatar');

// Wrap multer to forward errors into the central error handler cleanly
export const handleUpload = (uploader) => (req, res, next) => {
  uploader(req, res, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    next();
  });
};
