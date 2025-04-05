// Local database service for recipes
const LOCAL_API_BASE = '/api';

// Cache for local database responses
const localRecipeCache = new Map();

// Export local database service functions
window.createLocalRecipe = createLocalRecipe;
window.getLocalRecipes = getLocalRecipes;
window.updateLocalRecipe = updateLocalRecipe;
window.deleteLocalRecipe = deleteLocalRecipe;
window.searchLocalRecipes = searchLocalRecipes;

async function createLocalRecipe(recipeData, imageFiles) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }

        const formData = new FormData();
        formData.append('recipeData', JSON.stringify(recipeData));
        
        if (imageFiles && imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }
        }

        const response = await fetch(`${LOCAL_API_BASE}/recipes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
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
            recipe: data
        };
    } catch (error) {
        console.error('Recipe creation error:', error);
        return {
            success: false,
            message: 'Unable to connect to recipe service'
        };
    }
}

async function getLocalRecipes(filters = {}) {
    try {
        const queryParams = new URLSearchParams();
        
        if (filters.query) queryParams.append('query', filters.query);
        if (filters.cuisineType) queryParams.append('cuisineType', filters.cuisineType);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.dietary) queryParams.append('dietary', filters.dietary);
        if (filters.cookTime) queryParams.append('cookTime', filters.cookTime);
        if (filters.allergens) queryParams.append('allergens', filters.allergens);
        if (filters.sort) queryParams.append('sort', filters.sort);
        if (filters.limit) queryParams.append('limit', filters.limit);
        if (filters.page) queryParams.append('page', filters.page);

        const url = `${LOCAL_API_BASE}/recipes?${queryParams.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch recipes'
            };
        }

        return {
            success: true,
            recipes: data
        };
    } catch (error) {
        console.error('Recipe fetch error:', error);
        return {
            success: false,
            message: 'Unable to connect to recipe service'
        };
    }
}

async function updateLocalRecipe(recipeId, recipeData, imageFiles) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }

        const formData = new FormData();
        formData.append('recipeData', JSON.stringify(recipeData));
        
        if (imageFiles && imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }
        }

        const response = await fetch(`${LOCAL_API_BASE}/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
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
            recipe: data
        };
    } catch (error) {
        console.error('Recipe update error:', error);
        return {
            success: false,
            message: 'Unable to connect to recipe service'
        };
    }
}

async function deleteLocalRecipe(recipeId) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }

        const response = await fetch(`${LOCAL_API_BASE}/recipes/${recipeId}`, {
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
            message: 'Recipe deleted successfully'
        };
    } catch (error) {
        console.error('Recipe deletion error:', error);
        return {
            success: false,
            message: 'Unable to connect to recipe service'
        };
    }
}

async function searchLocalRecipes(searchQuery) {
    try {
        const queryParams = new URLSearchParams({
            query: searchQuery
        });

        const url = `${LOCAL_API_BASE}/recipes?${queryParams.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to search recipes'
            };
        }

        return {
            success: true,
            recipes: data
        };
    } catch (error) {
        console.error('Recipe search error:', error);
        return {
            success: false,
            message: 'Unable to connect to recipe service'
        };
    }
}