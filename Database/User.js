const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        maxlength: [30, 'Username cannot be more than 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: [50, 'Display name cannot be more than 50 characters']
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio cannot be more than 200 characters']
    },
    profileImage: {
        type: String
    },
    dietaryPreferences: [{
        type: String,
        enum: [
            'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 
            'paleo', 'low-carb', 'low-fat', 'high-protein', 'pescatarian'
        ]
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    favoritesCount: {
        type: Number,
        default: 0
    },
    recipeCount: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 