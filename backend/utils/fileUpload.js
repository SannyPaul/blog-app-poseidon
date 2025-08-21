const path = require('path');
const multer = require('multer');
const ErrorResponse = require('./errorResponse');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILE_UPLOAD_PATH || './public/uploads');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
const checkFileType = (file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, gif)'));
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: process.env.MAX_FILE_UPLOAD || 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single('image');

// Middleware to handle file upload
const uploadFile = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }
    next();
  });
};

module.exports = uploadFile;
