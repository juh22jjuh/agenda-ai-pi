
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specifies the directory where the images will be saved.
    // Make sure this directory exists.
    cb(null, 'public/images'); 
  },
  filename: (req, file, cb) => {
    // Creates a unique filename to prevent overwriting.
    // Example: 2023-10-27-my-image.png
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Filters to accept only image files
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
