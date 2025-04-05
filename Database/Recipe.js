const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Recipe title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number
        },
        unit: {
            type: String
        }
    }],
    steps: [{
        type: String,
        required: true
    }],
    cookTime: {
        type: Number,
        min: [0, 'Cook time cannot be negative']
    },
    prepTime: {
        type: Number,
        min: [0, 'Prep time cannot be negative']
    },
    servings: {
        type: Number,
        required: [true, 'Number of servings is required'],
        min: [1, 'Servings must be at least 1']
    },
    image: {
        type: String
    },
    nutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
        fiber: Number,
        sugar: Number
    },
    mealTypes: [{
        type: String,
        enum: [
            'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer',
            'Brunch', 'Side Dish', 'Drink', 'Smoothie'
        ]
    }],
    categories: [{
        type: String
    }],
    dietaryCategories: [{
        type: String,
        enum: [
            'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto',
            'paleo', 'low-carb', 'low-fat', 'high-protein', 'pescatarian',
            'nut-free', 'egg-free', 'soy-free'
        ]
    }],
    allergens: [{
        type: String,
        enum: [
            'gluten', 'dairy', 'nuts', 'eggs', 'soy', 'fish', 'shellfish'
        ]
    }],
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    starCount: {
        type: Number,
        default: 0
    },
    starredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    viewCount: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for recipe search
RecipeSchema.index({
    title: 'text',
    description: 'text',
    'ingredients.name': 'text',
    categories: 'text',
    dietaryCategories: 'text'
});

// Update the updatedAt field before saving
RecipeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Recipe', RecipeSchema); 