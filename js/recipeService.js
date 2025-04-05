// API Configuration
const TASTY_API_KEY = process.env.TASTY_API_KEY || '';
const TASTY_API_HOST = 'tasty.p.rapidapi.com';
const NUTRITION_API_HOST = 'nutritional-data.p.rapidapi.com';

// API Base URLs
const API_BASE_URL = '/api';
const TASTY_BASE_URL = 'https://tasty.p.rapidapi.com';
const NUTRITION_BASE_URL = 'https://nutritional-data.p.rapidapi.com';

// Cache for API responses
const recipeCache = new Map();
const nutritionCache = new Map();

// Export recipe service functions
window.getRecipeById = getRecipeById;
window.getAllRecipes = getAllRecipes;
window.getUserRecipes = getUserRecipes;
window.createRecipe = createRecipe;
window.updateRecipe = updateRecipe;
window.deleteRecipe = deleteRecipe;
window.starRecipe = starRecipe;
window.favoriteRecipe = favoriteRecipe;
window.searchRecipes = searchRecipes;

const RECIPE_ENDPOINTS = {
    getRecipe: `${TASTY_BASE_URL}/recipes/get-more-info`,
    getAllRecipes: `${TASTY_BASE_URL}/recipes/list`,
    getUserRecipes: `${API_BASE_URL}/recipes/user/my-recipes`,
    createRecipe: `${API_BASE_URL}/recipes`,
    updateRecipe: `${API_BASE_URL}/recipes`,
    deleteRecipe: `${API_BASE_URL}/recipes`,
    starRecipe: `${API_BASE_URL}/recipes`,
    favoriteRecipe: `${API_BASE_URL}/recipes`,
    searchRecipes: `${TASTY_BASE_URL}/recipes/list`,
    getNutrition: `${NUTRITION_BASE_URL}`
};

// Common headers for Rapid API requests
const RAPID_API_HEADERS = {
    'x-rapidapi-key': TASTY_API_KEY,
    'x-rapidapi-host': TASTY_API_HOST
};

const NUTRITION_API_HEADERS = {
    'x-rapidapi-key': TASTY_API_KEY,
    'x-rapidapi-host': NUTRITION_API_HOST
};

async function getRecipeById(recipeId) {
    if (USE_MOCK_DATA) {
        return await mockGetRecipeById(recipeId);
    }
    
    try {
        // Check cache first
        if (recipeCache.has(recipeId)) {
            return recipeCache.get(recipeId);
        }

        if (!TASTY_API_KEY) {
            return {
                success: false,
                message: 'Tasty API key not configured. Please contact administrator.'
            };
        }

        const response = await fetch(`${RECIPE_ENDPOINTS.getRecipe}?recipe_id=${recipeId}`, {
            headers: RAPID_API_HEADERS
        });
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            return {
                success: false,
                message: 'Failed to fetch recipe from Tasty API'
            };
        }
        
        const data = await response.json();
        
        // Transform Tasty API response to match our app's format
        const recipe = {
            id: data.id,
            title: data.name,
            description: data.description || '',
            image: data.thumbnail_url || '',
            cookTime: data.cook_time_minutes || 0,
            prepTime: data.prep_time_minutes || 0,
            servings: data.num_servings || 4,
            difficulty: data.difficulty || 'Easy',
            ingredients: data.sections?.flatMap(section => 
                section.components?.map(component => ({
                    name: component.ingredient?.name || '',
                    amount: component.measurements?.[0]?.quantity || '',
                    unit: component.measurements?.[0]?.unit?.name || ''
                })) || []
            ) || [],
            instructions: data.instructions?.map(step => step.display_text) || [],
            nutrition: await getNutritionData(data.nutrition || {})
        };
        
        const result = {
            success: true,
            recipe: recipe
        };

        // Cache the result
        recipeCache.set(recipeId, result);
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Recipe service unavailable');
    }
}

async function getAllRecipes(filters = {}) {
    if (USE_MOCK_DATA) {
        return await mockGetAllRecipes(filters);
    }
    
    try {
        // Get recipes from both local database and external API
        const [localResults, externalResults] = await Promise.all([
            window.getLocalRecipes(filters),
            getExternalRecipes(filters)
        ]);

        // Combine and deduplicate results
        const combinedRecipes = [];
        const recipeIds = new Set();

        // Add local recipes first
        if (localResults.success && localResults.recipes) {
            localResults.recipes.forEach(recipe => {
                if (!recipeIds.has(recipe.id)) {
                    combinedRecipes.push({
                        ...recipe,
                        source: 'local'
                    });
                    recipeIds.add(recipe.id);
                }
            });
        }

        // Add external recipes
        if (externalResults.success && externalResults.recipes) {
            externalResults.recipes.forEach(recipe => {
                if (!recipeIds.has(recipe.id)) {
                    combinedRecipes.push({
                        ...recipe,
                        source: 'external'
                    });
                    recipeIds.add(recipe.id);
                }
            });
        }

        return {
            success: true,
            recipes: combinedRecipes
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Recipe service unavailable');
    }
}

async function getExternalRecipes(filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            from: '0',
            size: filters.limit || '20',
            max_time: filters.cookTime || '120'
        });

        // Enhanced recipe filtering
        
        // Enhanced filter handling
        if (filters.mealType) {
            queryParams.append('tags', filters.mealType.toLowerCase());
        }
        if (filters.dietaryCategory) {
            queryParams.append('tags', filters.dietaryCategory.toLowerCase());
        }
        if (filters.difficulty) {
            queryParams.append('difficulty', filters.difficulty.toLowerCase());
        }
        if (filters.cookTime) {
            queryParams.append('max_time', filters.cookTime);
        }
        if (filters.query) {
            queryParams.append('q', filters.query);
        }
        
        const url = `${RECIPE_ENDPOINTS.getAllRecipes}?${queryParams.toString()}`;
        const response = await fetch(url, {
            headers: RAPID_API_HEADERS
        });
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch external recipes'
            };
        }

        // Transform external recipes to match our app's format
        const transformedRecipes = data.results.map(recipe => ({
            id: recipe.id,
            title: recipe.name,
            description: recipe.description || '',
            image: recipe.thumbnail_url || '../LOGO/recipe-placeholder.svg',
            cookTime: recipe.total_time_minutes || recipe.cook_time_minutes || 30,
            prepTime: recipe.prep_time_minutes || 10,
            servings: recipe.num_servings || 4,
            difficulty: recipe.difficulty || 'Medium',
            rating: recipe.user_ratings?.score || 0,
            categories: recipe.tags?.map(tag => tag.name) || [],
            dietaryCategories: recipe.tags?.filter(tag => 
                ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].includes(tag.name.toLowerCase())
            ).map(tag => tag.name) || [],
            mealTypes: recipe.tags?.filter(tag => 
                ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].includes(tag.name.toLowerCase())
            ).map(tag => tag.name) || []
        }));
        
        const recipes = data.results.map(result => ({
            id: result.id,
            title: result.name,
            description: result.description,
            image: result.thumbnail_url,
            cookTime: result.cook_time_minutes || 0,
            prepTime: result.prep_time_minutes || 0,
            difficulty: result.difficulty || 'Easy',
            rating: result.user_ratings?.score ? (result.user_ratings.score * 5).toFixed(1) : '4.5',
            dietaryCategories: result.tags?.filter(tag => [
                'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'
            ].includes(tag.name.toLowerCase())).map(tag => tag.name) || []
        }));
        
        return {
            success: true,
            recipes: recipes
        };
    } catch (error) {
        console.error('External API Error:', error);
        return {
            success: false,
            message: 'External recipe service unavailable'
        };
    }

}

async function createRecipe(recipeData, token) {
    if (USE_MOCK_DATA) {
        return await mockCreateRecipe(recipeData);
    }
    
    try {
        const response = await fetch(RECIPE_ENDPOINTS.createRecipe, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(recipeData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to create recipe'
            };
        }
        
        return {
            success: true,
            recipe: data.recipe
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Recipe creation service unavailable');
    }
}

async function updateRecipe(recipeId, recipeData, token) {
    if (USE_MOCK_DATA) {
        return await mockUpdateRecipe(recipeId, recipeData);
    }
    
    try {
        const response = await fetch(`${RECIPE_ENDPOINTS.updateRecipe}/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(recipeData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to update recipe'
            };
        }
        
        return {
            success: true,
            recipe: data.recipe
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Recipe update service unavailable');
    }
}

async function toggleStar(recipeId, token) {
    if (USE_MOCK_DATA) {
        return await mockToggleStar(recipeId);
    }
    
    try {
        const response = await fetch(`${RECIPE_ENDPOINTS.starRecipe}/${recipeId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to update star status'
            };
        }
        
        return {
            success: true,
            starred: data.starred,
            starCount: data.starCount
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Star service unavailable');
    }
}

async function toggleFavorite(recipeId, token) {
    if (USE_MOCK_DATA) {
        return await mockToggleFavorite(recipeId);
    }
    
    try {
        const response = await fetch(`${RECIPE_ENDPOINTS.favoriteRecipe}/${recipeId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to update favorite status'
            };
        }
        
        return {
            success: true,
            favorited: data.favorited
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Favorite service unavailable');
    }
}

async function getUserRecipeInteractions(recipeId, token) {
    if (USE_MOCK_DATA) {
        return await mockGetUserRecipeInteractions(recipeId);
    }
    
    try {
        const response = await fetch(`${RECIPE_ENDPOINTS.getRecipe}/${recipeId}/interactions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch user interactions'
            };
        }
        
        return {
            success: true,
            interactions: data.interactions
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Interactions service unavailable');
    }
}

async function deleteRecipe(recipeId, token) {
    if (USE_MOCK_DATA) {
        return await mockDeleteRecipe(recipeId);
    }
    
    try {
        const response = await fetch(`${RECIPE_ENDPOINTS.deleteRecipe}/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to delete recipe'
            };
        }
        
        return {
            success: true,
            message: data.message || 'Recipe deleted successfully'
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Recipe deletion service unavailable');
    }
}

function getAuthToken() {
    return localStorage.getItem('token');
}

async function uploadRecipeWithImages(url, method, recipeData, imageFiles, token) {
    try {
        const formData = new FormData();
        formData.append('recipeData', JSON.stringify(recipeData));
        if (imageFiles && imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || `Failed to ${method === 'POST' ? 'create' : 'update'} recipe`
            };
        }
        
        return {
            success: true,
            recipe: data
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error(`Recipe ${method === 'POST' ? 'creation' : 'update'} service unavailable`);
    }
}

export {
    getRecipeById,
    getAllRecipes,
    createRecipe,
    updateRecipe,
    toggleStar,
    toggleFavorite,
    getUserRecipeInteractions,
    deleteRecipe
};