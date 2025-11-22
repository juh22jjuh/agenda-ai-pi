import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/"); // pasta onde salva
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString("hex");
    callback(null, `${name}${ext}`);
  }
});

const upload = multer({ storage });

export default upload;
