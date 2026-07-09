const fs = require('fs');

const getImageBase64 = (file) => {
    if (!file) {
        throw new Error('Uploaded file is missing');
    }
    if (file.buffer) {
        return file.buffer.toString('base64');
    }
    if (file.path) {
        return fs.readFileSync(file.path, { encoding: 'base64' });
    }
    throw new Error('Uploaded file data is missing');
};

const cleanupUpload = (file) => {
    if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
};

const cleanupUploads = (files = []) => {
    files.forEach(cleanupUpload);
};

const getPythonApiUrl = () => (process.env.PYTHON_API_URL || '').trim().replace(/\/$/, '');

module.exports = {
    getImageBase64,
    cleanupUpload,
    cleanupUploads,
    getPythonApiUrl,
};
