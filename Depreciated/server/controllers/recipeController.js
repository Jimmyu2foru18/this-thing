const Recipe = require('../models/Recipe');
const User = require('../models/User');

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
    try {
        const {
            title,
            description,
            ingredients,
            steps,
            cookTime,
            prepTime,
            servings,
            nutrition,
            mealTypes,
            categories,
            dietaryCategories,
            allergens,
            difficulty,
            visibility,
            notes
        } = req.body;
        
        // Create recipe object
        const recipe = new Recipe({
            title,
            description,
            ingredients: Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients),
            steps: Array.isArray(steps) ? steps : JSON.parse(steps),
            cookTime,
            prepTime,
            servings,
            nutrition: nutrition ? (typeof nutrition === 'string' ? JSON.parse(nutrition) : nutrition) : undefined,
            mealTypes: mealTypes ? (Array.isArray(mealTypes) ? mealTypes : JSON.parse(mealTypes)) : [],
            categories: categories ? (Array.isArray(categories) ? categories : JSON.parse(categories)) : [],
            dietaryCategories: dietaryCategories ? (Array.isArray(dietaryCategories) ? dietaryCategories : JSON.parse(dietaryCategories)) : [],
            allergens: allergens ? (Array.isArray(allergens) ? allergens : JSON.parse(allergens)) : [],
            difficulty: difficulty || 'easy',
            visibility: visibility || 'public',
            notes,
            user: req.user._id
        });
        
        // Handle image from file upload middleware
        if (req.files && req.files.length > 0) {
            recipe.image = `/uploads/recipes/${req.files[0].filename}`;
        }
        
        const createdRecipe = await recipe.save();
        
        // Update user stats based on visibility
        const user = await User.findById(req.user._id);
        if (visibility === 'public') {
            user.stats = user.stats || {};
            user.stats.publicRecipes = (user.stats.publicRecipes || 0) + 1;
        } else {
            user.stats = user.stats || {};
            user.stats.privateRecipes = (user.stats.privateRecipes || 0) + 1;
        }
        await user.save();
        
        res.status(201).json(createdRecipe);
    } catch (error) {
        console.error('Error in createRecipe:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Other methods remain the same, just make sure to handle potential null values
// ...

module.exports = {
    createRecipe,
    getRecipes,
    getUserRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    toggleStarRecipe,
    toggleFavoriteRecipe,
    getRecipeInteractions
}; 