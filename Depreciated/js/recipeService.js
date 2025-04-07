// This points to API server
const API_BASE_URL = '/api'; 
const RECIPE_ENDPOINTS = {
    getRecipe: `${API_BASE_URL}/recipes`,
    getAllRecipes: `${API_BASE_URL}/recipes`,
    getUserRecipes: `${API_BASE_URL}/recipes/user/my-recipes`,
    createRecipe: `${API_BASE_URL}/recipes`,
    updateRecipe: `${API_BASE_URL}/recipes`,
    deleteRecipe: `${API_BASE_URL}/recipes`,
    starRecipe: `${API_BASE_URL}/recipes`,
    favoriteRecipe: `${API_BASE_URL}/recipes`,
    searchRecipes: `${API_BASE_URL}/recipes/search`
};

async function getRecipeById(recipeId) {
    if (USE_MOCK_DATA) {
        return await mockGetRecipeById(recipeId);
    }
    
    try {
        const response = await fetch(`${RECIPE_ENDPOINTS.getRecipe}/${recipeId}`);
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch recipe'
            };
        }
        
        return {
            success: true,
            recipe: data.recipe
        };
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
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            queryParams.append(key, value);
        });
        
        const url = `${RECIPE_ENDPOINTS.getAllRecipes}?${queryParams.toString()}`;
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
            recipes: data.recipes
        };
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Recipe service unavailable');
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