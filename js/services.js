// Core services module that exports all service functions

// Import utility functions
const { DOM, ErrorHandler, Notifications } = window.utils;

// Auth Service
const AuthService = {
    registerUser,
    authenticateUser,
    logoutUser,
    checkAuthStatus,
    updateUserProfile,
    resetPassword
};

// Recipe Service
const RecipeService = {
    getRecipeById,
    getAllRecipes,
    getUserRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    starRecipe,
    favoriteRecipe,
    searchRecipes
};

// Meal Plan Service 
const MealPlanService = {
    createMealPlan,
    getUserMealPlans,
    updateMealPlan,
    deleteMealPlan,
    addRecipeToMealPlan,
    removeRecipeFromMealPlan
};

// Export all services
window.services = {
    auth: AuthService,
    recipe: RecipeService,
    mealPlan: MealPlanService
};