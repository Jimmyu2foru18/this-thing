const Recipe = require('../models/Recipe');

// Normalize recipe data for comparison
function normalizeRecipeData(recipe) {
    return {
        title: recipe.title.toLowerCase().trim(),
        ingredients: recipe.ingredients.map(ing => {
            if (typeof ing === 'string') return ing.toLowerCase().trim();
            return ing.name.toLowerCase().trim();
        }).sort(),
        steps: recipe.steps.map(step => step.toLowerCase().trim()).sort()
    };
}

// Calculate similarity score between two recipes
function calculateSimilarity(recipe1, recipe2) {
    const normalized1 = normalizeRecipeData(recipe1);
    const normalized2 = normalizeRecipeData(recipe2);
    
    // Title similarity (exact match)
    const titleScore = normalized1.title === normalized2.title ? 1 : 0;
    
    // Ingredients similarity (Jaccard similarity)
    const ingredientIntersection = normalized1.ingredients.filter(ing => 
        normalized2.ingredients.includes(ing)
    ).length;
    const ingredientUnion = new Set([...normalized1.ingredients, ...normalized2.ingredients]).size;
    const ingredientScore = ingredientIntersection / ingredientUnion;
    
    // Steps similarity (Jaccard similarity)
    const stepsIntersection = normalized1.steps.filter(step => 
        normalized2.steps.includes(step)
    ).length;
    const stepsUnion = new Set([...normalized1.steps, ...normalized2.steps]).size;
    const stepsScore = stepsIntersection / stepsUnion;
    
    // Weighted average (title: 30%, ingredients: 40%, steps: 30%)
    return titleScore * 0.3 + ingredientScore * 0.4 + stepsScore * 0.3;
}

// Check for duplicate recipes
async function checkDuplicateRecipe(newRecipe, similarityThreshold = 0.8) {
    if (newRecipe.visibility !== 'public') return { isDuplicate: false };
    
    // Find potential duplicates by title similarity
    const similarTitleRecipes = await Recipe.find({
        visibility: 'public',
        title: { 
            $regex: new RegExp(newRecipe.title.split(' ').join('|'), 'i')
        }
    });
    
    // Calculate similarity scores
    const duplicates = similarTitleRecipes
        .map(recipe => ({
            recipe,
            similarity: calculateSimilarity(newRecipe, recipe)
        }))
        .filter(({ similarity }) => similarity >= similarityThreshold);
    
    return {
        isDuplicate: duplicates.length > 0,
        duplicates: duplicates.map(({ recipe, similarity }) => ({
            id: recipe._id,
            title: recipe.title,
            similarity: Math.round(similarity * 100)
        }))
    };
}

module.exports = { checkDuplicateRecipe };