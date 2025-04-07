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
        if (req.file) {
            recipe.image = `/uploads/recipes/${req.file.filename}`;
        }
        
        const createdRecipe = await recipe.save();
        
        // Update user stats based on visibility
        const user = await User.findById(req.user._id);
        if (visibility === 'public') {
            user.stats.publicRecipes += 1;
        } else {
            user.stats.privateRecipes += 1;
        }
        await user.save();
        
        res.status(201).json(createdRecipe);
    } catch (error) {
        console.error('Error in createRecipe:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all recipes with filtering
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
    try {
        const {
            query,
            cuisineType,
            category,
            dietary,
            cookTime,
            allergens,
            sort = 'createdAt',
            limit = 20,
            page = 1
        } = req.query;
        
        // Build query object
        const queryObj = { visibility: 'public' };
        
        // Text search if query is provided
        if (query) {
            queryObj.$text = { $search: query };
        }
        
        // Filter by cuisine type
        if (cuisineType) {
            queryObj.categories = { $in: [cuisineType] };
        }
        
        // Filter by meal type category
        if (category) {
            queryObj.mealTypes = { $in: [category] };
        }
        
        // Filter by dietary category
        if (dietary) {
            queryObj.dietaryCategories = { $in: [dietary] };
        }
        
        // Filter by cooking time (less than or equal to)
        if (cookTime) {
            queryObj.cookTime = { $lte: Number(cookTime) };
        }
        
        // Filter by allergens (exclude recipes with these allergens)
        if (allergens) {
            const allergensList = Array.isArray(allergens) ? allergens : [allergens];
            queryObj.allergens = { $nin: allergensList };
        }
        
        // Determine sort order
        let sortOrder = {};
        switch (sort) {
            case 'rating':
                sortOrder = { rating: -1 };
                break;
            case 'time':
                sortOrder = { cookTime: 1 };
                break;
            case 'latest':
                sortOrder = { createdAt: -1 };
                break;
            case 'popularity':
                sortOrder = { viewCount: -1 };
                break;
            default:
                sortOrder = { createdAt: -1 };
        }
        
        // Set pagination
        const pageSize = Number(limit);
        const skip = (Number(page) - 1) * pageSize;
        
        // Execute query
        const recipes = await Recipe.find(queryObj)
            .sort(sortOrder)
            .limit(pageSize)
            .skip(skip)
            .populate('user', 'username displayName');
        
        // Get total count for pagination
        const totalRecipes = await Recipe.countDocuments(queryObj);
        
        res.json({
            recipes,
            page: Number(page),
            pages: Math.ceil(totalRecipes / pageSize),
            total: totalRecipes
        });
    } catch (error) {
        console.error('Error in getRecipes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's recipes
// @route   GET /api/recipes/user
// @access  Private
const getUserRecipes = async (req, res) => {
    try {
        const { visibility } = req.query;
        
        // Build query object
        const queryObj = { user: req.user._id };
        
        // Filter by visibility if provided
        if (visibility) {
            queryObj.visibility = visibility;
        }
        
        const recipes = await Recipe.find(queryObj)
            .sort({ createdAt: -1 })
            .populate('user', 'username displayName');
        
        res.json(recipes);
    } catch (error) {
        console.error('Error in getUserRecipes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Public (with visibility check)
const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('user', 'username displayName');
        
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        // Check if recipe is private and user is not the owner
        if (recipe.visibility === 'private') {
            // Check if user is authenticated and is the owner
            if (!req.user || (req.user._id.toString() !== recipe.user._id.toString())) {
                return res.status(403).json({ message: 'Not authorized to view this recipe' });
            }
        }
        
        // Increment view count
        recipe.viewCount += 1;
        await recipe.save();
        
        res.json(recipe);
    } catch (error) {
        console.error('Error in getRecipeById:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private (owner only)
const updateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        // Check if user is the owner
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this recipe' });
        }
        
        // Check if visibility is changing
        const oldVisibility = recipe.visibility;
        const newVisibility = req.body.visibility;
        
        // Update recipe with all fields from request body
        Object.keys(req.body).forEach(key => {
            // Handle arrays that might be sent as strings
            if (['ingredients', 'steps', 'mealTypes', 'categories', 'dietaryCategories', 'allergens'].includes(key)) {
                recipe[key] = Array.isArray(req.body[key]) ? req.body[key] : JSON.parse(req.body[key]);
            } else if (key === 'nutrition') {
                recipe[key] = typeof req.body[key] === 'string' ? JSON.parse(req.body[key]) : req.body[key];
            } else {
                recipe[key] = req.body[key];
            }
        });
        
        // Handle image from file upload middleware
        if (req.file) {
            recipe.image = `/uploads/recipes/${req.file.filename}`;
        }
        
        const updatedRecipe = await recipe.save();
        
        // Update user stats if visibility changed
        if (oldVisibility !== newVisibility && oldVisibility && newVisibility) {
            const user = await User.findById(req.user._id);
            if (oldVisibility === 'private' && newVisibility === 'public') {
                user.stats.privateRecipes -= 1;
                user.stats.publicRecipes += 1;
            } else if (oldVisibility === 'public' && newVisibility === 'private') {
                user.stats.publicRecipes -= 1;
                user.stats.privateRecipes += 1;
            }
            await user.save();
        }
        
        res.json(updatedRecipe);
    } catch (error) {
        console.error('Error in updateRecipe:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private (owner only)
const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        // Check if user is the owner
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this recipe' });
        }
        
        // Store visibility for stat update
        const visibility = recipe.visibility;
        
        await recipe.remove();
        
        // Update user stats
        const user = await User.findById(req.user._id);
        if (visibility === 'public') {
            user.stats.publicRecipes -= 1;
        } else {
            user.stats.privateRecipes -= 1;
        }
        await user.save();
        
        res.json({ message: 'Recipe removed' });
    } catch (error) {
        console.error('Error in deleteRecipe:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle star (like) a recipe
// @route   POST /api/recipes/:id/star
// @access  Private
const toggleStarRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        // Check if recipe is visible to user
        if (recipe.visibility === 'private' && recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to star this recipe' });
        }
        
        // Get the starredBy array or create if it doesn't exist
        if (!recipe.starredBy) {
            recipe.starredBy = [];
        }
        
        // Check if user already starred
        const userIndex = recipe.starredBy.indexOf(req.user._id);
        
        if (userIndex === -1) {
            // User hasn't starred yet, add star
            recipe.starredBy.push(req.user._id);
            recipe.starCount += 1;
            
            await recipe.save();
            
            res.json({ starred: true, starCount: recipe.starCount });
        } else {
            // User already starred, remove star
            recipe.starredBy.splice(userIndex, 1);
            recipe.starCount -= 1;
            
            await recipe.save();
            
            res.json({ starred: false, starCount: recipe.starCount });
        }
    } catch (error) {
        console.error('Error in toggleStarRecipe:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle favorite a recipe
// @route   POST /api/recipes/:id/favorite
// @access  Private
const toggleFavoriteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        // Check if recipe is visible to user
        if (recipe.visibility === 'private' && recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to favorite this recipe' });
        }
        
        const user = await User.findById(req.user._id);
        
        // Check if recipe is already in favorites
        const favoriteIndex = user.favorites.indexOf(req.params.id);
        
        if (favoriteIndex === -1) {
            // Add to favorites
            user.favorites.push(req.params.id);
            user.stats.favorites += 1;
            
            await user.save();
            
            res.json({ favorited: true });
        } else {
            // Remove from favorites
            user.favorites.splice(favoriteIndex, 1);
            user.stats.favorites -= 1;
            
            await user.save();
            
            res.json({ favorited: false });
        }
    } catch (error) {
        console.error('Error in toggleFavoriteRecipe:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user interactions with a recipe (stars, favorites)
// @route   GET /api/recipes/:id/interactions
// @access  Private
const getRecipeInteractions = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const recipe = await Recipe.findById(req.params.id);
        
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        // Check favorites
        const isFavorite = user.favorites.includes(req.params.id);
        
        // Check stars
        const isStarred = recipe.starredBy && recipe.starredBy.includes(req.user._id);
        
        res.json({
            starred: isStarred,
            favorited: isFavorite,
            starCount: recipe.starCount || 0
        });
    } catch (error) {
        console.error('Error in getRecipeInteractions:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

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