const express = require('express');
const router = express.Router();
const { 
    createRecipe,
    getRecipes,
    getUserRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    toggleStarRecipe,
    toggleFavoriteRecipe,
    getRecipeInteractions
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipeById);

// Protected routes
router.post('/', protect, upload.recipe.array('images', 5), createRecipe);
router.get('/user/my-recipes', protect, getUserRecipes);
router.put('/:id', protect, upload.recipe.array('images', 5), updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/:id/star', protect, toggleStarRecipe);
router.post('/:id/favorite', protect, toggleFavoriteRecipe);
router.get('/:id/interactions', protect, getRecipeInteractions);

module.exports = router; 