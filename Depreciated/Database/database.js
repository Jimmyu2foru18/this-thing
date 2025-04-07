const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: false,
        trim: true
    },
    bio: {
        type: String,
        required: false
    },
    avatar: {
        type: String, 
        required: false
    },
    dietaryPreferences: {
        type: [String],
        required: false,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'pescatarian', 'low-carb']
    },
    healthGoals: {
        type: [String],
        required: false,
        enum: ['weight-loss', 'weight-gain', 'maintenance', 'muscle-building', 'performance']
    },
    location: {
        city: {
            type: String,
            required: false,
            trim: true
        },
        country: {
            type: String,
            required: false,
            trim: true
        }
    },
    calorieDefaults: {
        age: {
            type: Number,
            required: false,
            min: 0,
            max: 120
        },
        gender: {
            type: String,
            required: false,
            enum: ['male', 'female', 'other']
        },
        weight: {
            type: Number,
            required: false
        },
        height: {
            type: Number,
            required: false
        },
        activityLevel: {
            type: String,
            required: false,
            enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extra-active']
        },
        calorieGoal: {
            type: Number,
            required: false,
            default: 2000
        },
        macroDistribution: {
            protein: {
                type: Number,
                required: false,
                default: 30
            },
            carbs: {
                type: Number,
                required: false,
                default: 40
            },
            fats: {
                type: Number,
                required: false,
                default: 30
            }
        }
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

userSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false
    },
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: false
        },
        unit: {
            type: String,
            required: false
        },
        calories: {
            type: Number,
            required: false
        },
        protein: {
            type: Number,
            required: false
        },
        carbs: {
            type: Number,
            required: false
        },
        fats: {
            type: Number,
            required: false
        }
    }],
    steps: {
        type: [String], 
        required: false
    },
    cookTime: {
        type: Number,
        required: false
    },
    prepTime: {
        type: Number,
        required: false
    },
    servings: {
        type: Number,
        required: false,
        default: 4
    },
    nutrition: {
        calories: {
            type: Number,
            required: false
        },
        protein: {
            type: Number,
            required: false
        },
        carbs: {
            type: Number,
            required: false
        },
        fats: {
            type: Number,
            required: false
        },
        fiber: {
            type: Number,
            required: false
        },
        sugar: {
            type: Number,
            required: false
        }
    },
    mealTypes: {
        type: [String],
        required: false,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
    },
    categories: {
        type: [String],
        required: false
    },
    dietaryCategories: {
        type: [String],
        required: false,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'pescatarian', 'low-carb']
    },
    difficulty: {
        type: String,
        required: false,
        enum: ['easy', 'medium', 'hard']
    },
    image: {
        type: String, 
        required: false
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: false
    },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            required: true
        },
        comment: {
            type: String,
            required: false
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

recipeSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const mealSchema = new mongoose.Schema({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: false 
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false
    },
    servings: {
        type: Number,
        required: false,
        default: 1
    },
    nutrition: {
        calories: {
            type: Number,
            required: false
        },
        protein: {
            type: Number,
            required: false
        },
        carbs: {
            type: Number,
            required: false
        },
        fats: {
            type: Number,
            required: false
        }
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

mealSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: false,
        default: Date.now()
    },
    notes: {
        type: String,
        required: false
    },
    servings: {
        type: Number,
        required: false,
        default: 4
    },
    calorieGoal: {
        type: Number,
        required: false
    },
    macroDistribution: {
        protein: {
            type: Number,
            required: false,
            default: 30
        },
        carbs: {
            type: Number,
            required: false,
            default: 40
        },
        fats: {
            type: Number,
            required: false,
            default: 30
        }
    },
    meals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal'
    }],
    dietaryPreferences: {
        type: [String],
        required: false,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'pescatarian', 'low-carb']
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

planSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const shoppingListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: false 
    },
    name: {
        type: String,
        required: false,
        default: "Shopping List"
    },
    items: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: false
        },
        unit: {
            type: String,
            required: false
        },
        category: {
            type: String,
            required: false,
            enum: ['produce', 'meat', 'dairy', 'bakery', 'pantry', 'frozen', 'other']
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

shoppingListSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);
const Recipe = mongoose.model('Recipe', recipeSchema);
const Meal = mongoose.model('Meal', mealSchema);
const Plan = mongoose.model('Plan', planSchema);
const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

module.exports = {
    User,
    Recipe,
    Meal,
    Plan,
    ShoppingList
};






/*
// Creating a new user
const newUser = new User({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'hashedpassword',
    dietaryPreferences: ['vegetarian'],
    calorieDefaults: {
        calorieGoal: 2200,
        macroDistribution: {
            protein: 30,
            carbs: 45,
            fats: 25
        }
    }
});

// Creating a new recipe
const newRecipe = new Recipe({
    title: 'Vegetarian Pasta',
    description: 'A delicious pasta dish with fresh vegetables.',
    ingredients: [
        { name: 'pasta', amount: 200, unit: 'g', calories: 720, protein: 24, carbs: 144, fats: 2 },
        { name: 'tomatoes', amount: 3, unit: 'each', calories: 60, protein: 3, carbs: 12, fats: 0 }
    ],
    steps: [
        'Boil water in a large pot',
        'Add pasta and cook according to package instructions',
        'Dice tomatoes and prepare sauce',
        'Mix pasta with sauce and serve'
    ],
    cookTime: 20,
    prepTime: 10,
    servings: 4,
    nutrition: {
        calories: 350,
        protein: 12,
        carbs: 65,
        fats: 5
    },
    mealTypes: ['Lunch', 'Dinner'],
    user: userId
});

// Creating a meal plan
const newPlan = new Plan({
    name: 'Weekly Plan',
    userId: userId,
    startDate: new Date('2023-06-01'),
    notes: 'Trying to incorporate more vegetables this week',
    servings: 4,
    calorieGoal: 2500,
    macroDistribution: {
        protein: 30,
        carbs: 40, 
        fats: 30
    },
    dietaryPreferences: ['vegetarian']
});

// Adding a meal to a plan
const newMeal = new Meal({
    recipe: recipeId,
    title: 'Vegetarian Pasta',
    servings: 2,
    nutrition: {
        calories: 350,
        protein: 12,
        carbs: 65,
        fats: 5
    },
    planId: planId,
    day: 'Monday',
    mealType: 'Dinner'
});

// Generating a shopping list from a meal plan
const newShoppingList = new ShoppingList({
    userId: userId,
    planId: planId,
    name: 'Groceries for June 1-7',
    items: [
        { name: 'pasta', quantity: 1, unit: 'box', category: 'pantry' },
        { name: 'tomatoes', quantity: 6, unit: 'each', category: 'produce' }
    ]
});
*/ 