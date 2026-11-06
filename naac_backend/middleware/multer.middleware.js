const multer = require("multer");
const path = require("path");

// Storage configuration for memory (for cloud uploads)
// Using memory storage for all uploads since we're using Cloudinary
const memoryStorage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// File filter for CSV files
const csvFilter = (req, file, cb) => {
    if (file.mimetype === "text/csv" || path.extname(file.originalname).toLowerCase() === '.csv') {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed!"), false);
    }
};

// File filter for both images and CSV
const generalFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'text/csv',
        'application/vnd.ms-excel'
    ];
    
    const isCSV = file.mimetype === "text/csv" || path.extname(file.originalname).toLowerCase() === '.csv';
    const isImage = file.mimetype.startsWith("image/");
    
    if (isImage || isCSV || allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File type not allowed! Only images and CSV files are supported."), false);
    }
};

// File filter for notices (supports documents, images, and common file types)
const noticeFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File type not allowed! Only images, PDF, Word, Excel, CSV and text files are supported."), false);
    }
};

// Upload configurations
const upload = multer({
    storage: memoryStorage, // Changed to memory storage for cloud uploads
    fileFilter: noticeFilter, // Changed to support more file types
    limits: {
        fileSize: 1024 * 1024 * 20, // Increased to 20MB limit
    }
});

const facultyUpload = multer({
    storage: memoryStorage, // Changed to memory storage for cloud uploads
    fileFilter: imageFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB limit for images
    }
});

const csvUpload = multer({
    storage: memoryStorage, // Changed to memory storage for cloud uploads
    fileFilter: csvFilter,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB limit for CSV
    }
});

// Upload configuration for notices (using memory storage for cloud upload)
const noticeUpload = multer({
    storage: memoryStorage,
    fileFilter: noticeFilter,
    limits: {
        fileSize: 1024 * 1024 * 20, // 20MB limit for notice files
    }
});

// Error handler middleware
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size allowed is 10MB.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field. Please check the field name.'
            });
        }
    }
    
    if (error.message.includes('Only')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

module.exports = {
    upload,
    facultyUpload,
    csvUpload,
    noticeUpload,
    handleMulterError
};