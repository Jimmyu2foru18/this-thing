const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createDirectories = () => {
    const dirs = ['./uploads', './uploads/avatars', './uploads/recipes'];
    
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
};
p
createDirectories();

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars');
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = `avatar-${req.user.id}-${Date.now()}${fileExt}`;
        cb(null, fileName);
    }
});

const recipeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/recipes');
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        let fileName = '';
        
        if (req.params.id) {
            fileName = `recipe-${req.params.id}-${Date.now()}${fileExt}`;
        } else {
            fileName = `recipe-new-${req.user.id}-${Date.now()}${fileExt}`;
        }
        
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 
    },
    fileFilter
});

const uploadRecipeImage = multer({
    storage: recipeStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter
});

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large.' });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(500).json({ message: err.message });
    }
    next();
};

module.exports = {
    uploadAvatar: uploadAvatar.single('avatar'),
    uploadRecipeImage: uploadRecipeImage.single('image'),
    handleUploadError
}; 