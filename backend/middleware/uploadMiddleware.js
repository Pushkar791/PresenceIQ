const multer = require('multer');
const path = require('path');
const fs = require('fs');

const useMemoryStorage = Boolean(process.env.VERCEL);

const storage = useMemoryStorage
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination(req, file, cb) {
            const dir = path.join(__dirname, '../../uploads/');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename(req, file, cb) {
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
        },
    });

const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error('Images Only!'));
    },
});

module.exports = upload;
