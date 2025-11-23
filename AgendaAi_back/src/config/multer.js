
import multer from 'multer';

// Use memoryStorage to hold the file as a buffer in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage, // The file will be stored in req.file.buffer
  fileFilter: (req, file, cb) => {
    // Filter to accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado! Envie apenas imagens.'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB limit
  }
});

export default upload;
