const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    },
    title: {
        type: String
    }
}, { _id: false });

const MealPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Meal plan name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    meals: {
        Monday: {
            Breakfast: MealSchema,
            Lunch: MealSchema,
            Dinner: MealSchema
        },
        Tuesday: {
            Breakfast: MealSchema,
            Lunch: MealSchema,
            Dinner: MealSchema
        },
        Wednesday: {
            Breakfast: MealSchema,
            Lunch: MealSchema,
            Dinner: MealSchema
        },
        Thursday: {
            Breakfast: MealSchema,
            Lunch: MealSchema,
            Dinner: MealSchema
        },
        Friday: {
            Breakfast: MealSchema,
            Lunch: MealSchema,
            Dinner: MealSchema
        },
        Saturday: {
            Breakfast: MealSchema,
            Lunch: MealSchema,
            Dinner: MealSchema
        },
        Sunday: {
            Breakfast: MealSchema,
            Lunch: MealSchema,
            Dinner: MealSchema
        }
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    servings: {
        type: Number,
        default: 1,
        min: [1, 'Servings must be at least 1']
    },
    startDate: {
        type: Date,
        default: Date.now
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

// Update the updatedAt field before saving
MealPlanSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('MealPlan', MealPlanSchema); 