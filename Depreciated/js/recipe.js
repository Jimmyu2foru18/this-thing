import { getRecipeById, toggleStar, toggleFavorite, getUserRecipeInteractions } from './recipeService.js';
import { DOM, Notifications, Auth } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (!recipeId) {
        showError('Recipe ID is missing');
        return;
    }
    
    try {
        await loadRecipe(recipeId);
        setupEventListeners(recipeId);
        if (Auth.isAuthenticated()) {
            await checkUserInteractions(recipeId);
        }
    } catch (error) {
        console.error('Error loading recipe:', error);
        showError('Failed to load recipe. Please try again later.');
    }
});
let currentRecipe = null;

async function loadRecipe(recipeId) {
    try {
        const response = await getRecipeById(recipeId);
        
        if (!response.success) {
            showError(response.message || 'Recipe not found');
            return;
        }
        
        currentRecipe = response.recipe;
        updateRecipeUI(response.recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        throw error;
    }
}

function updateRecipeUI(recipe) {
    document.title = `${recipe.title} - Recspicy`;
    DOM.set('recipe-title', recipe.title);
    DOM.set('recipe-description', recipe.description);

    const recipeImage = DOM.get('recipe-image');
    if (recipeImage) {
        recipeImage.src = recipe.image || '../LOGO/recipe-placeholder.jpg';
        recipeImage.alt = recipe.title;
    }
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    DOM.set('cook-time', `${totalTime} min`);
    DOM.set('servings', `${recipe.servings} servings`);
    DOM.set('difficulty', recipe.difficulty || 'Medium');

    DOM.set('star-count', recipe.starCount || 0);
    renderIngredients(recipe.ingredients);
    renderInstructions(recipe.steps);
    DOM.set('recipe-notes', recipe.notes || 'No additional notes for this recipe.');
    renderNutritionFacts(recipe.nutrition);
    renderTags(recipe);
}


function renderIngredients(ingredients) {
    const ingredientsList = DOM.get('ingredients-list');
    if (!ingredientsList) return;
    
    ingredientsList.innerHTML = '';
    
    if (!ingredients || !ingredients.length) {
        const li = document.createElement('li');
        li.textContent = 'No ingredients available';
        ingredientsList.appendChild(li);
        return;
    }
    
    ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        let ingredientText = '';
        
        if (typeof ingredient === 'string') {
            ingredientText = ingredient;
        } else if (ingredient.amount && ingredient.unit) {
            ingredientText = `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
        } else {
            ingredientText = ingredient.name;
        }
        
        li.textContent = ingredientText;
        ingredientsList.appendChild(li);
    });
}

function renderInstructions(steps) {
    const instructionsList = DOM.get('instructions-list');
    if (!instructionsList) return;
    
    instructionsList.innerHTML = '';
    
    if (!steps || !steps.length) {
        const li = document.createElement('li');
        li.textContent = 'No instructions available';
        instructionsList.appendChild(li);
        return;
    }
    
    steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        instructionsList.appendChild(li);
    });
}

function renderNutritionFacts(nutrition) {
    const nutritionFacts = DOM.get('nutrition-facts');
    if (!nutritionFacts) return;
    
    nutritionFacts.innerHTML = '';
    
    if (!nutrition) {
        nutritionFacts.innerHTML = '<p>Nutrition information not available</p>';
        return;
    }
    
    const nutritionItems = [
        { label: 'Calories', value: `${nutrition.calories || 0} kcal` },
        { label: 'Protein', value: `${nutrition.protein || 0}g` },
        { label: 'Carbs', value: `${nutrition.carbs || 0}g` },
        { label: 'Fats', value: `${nutrition.fats || 0}g` },
        { label: 'Fiber', value: `${nutrition.fiber || 0}g` },
        { label: 'Sugar', value: `${nutrition.sugar || 0}g` }
    ];
    
    nutritionItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'nutrition-item';
        
        const label = document.createElement('span');
        label.className = 'nutrition-label';
        label.textContent = item.label;
        
        const value = document.createElement('span');
        value.className = 'nutrition-value';
        value.textContent = item.value;
        
        div.appendChild(label);
        div.appendChild(value);
        nutritionFacts.appendChild(div);
    });
}

function renderTags(recipe) {
    const tagsContainer = DOM.get('recipe-tags');
    if (!tagsContainer) return;
    
    tagsContainer.innerHTML = '';
    const allTags = [
        ...(recipe.mealTypes || []),
        ...(recipe.categories || []),
        ...(recipe.dietaryCategories || [])
    ];
    
    if (!allTags.length) {
        tagsContainer.innerHTML = '<p>No tags available</p>';
        return;
    }
    [...new Set(allTags)].forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'recipe-tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
}

function setupEventListeners(recipeId) {
    const starBtn = DOM.get('star-btn');
    if (starBtn) {
        starBtn.addEventListener('click', async () => {
            if (!Auth.isAuthenticated()) {
                Notifications.show('Please sign in to star recipes', 'info');
                return;
            }
            
            await toggleRecipeStar(recipeId);
        });
    }
    const favoriteBtn = DOM.get('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', async () => {
            if (!Auth.isAuthenticated()) {
                Notifications.show('Please sign in to favorite recipes', 'info');
                return;
            }
            
            await toggleRecipeFavorite(recipeId);
        });
    }
    const copyBtn = DOM.get('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyRecipeToClipboard();
        });
    }
    const printBtn = DOM.get('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            navigateToPrintPage(recipeId);
        });
    }
}

function copyRecipeToClipboard() {
    if (!currentRecipe) {
        showError('No recipe data available');
        return;
    }
    
    try {
        const recipe = currentRecipe;
        let recipeText = `${recipe.title}\n\n`;
        
        recipeText += `DESCRIPTION:\n${recipe.description}\n\n`;
        
        recipeText += 'INGREDIENTS:\n';
        recipe.ingredients.forEach(ingredient => {
            let ingredientText = '';
            if (typeof ingredient === 'string') {
                ingredientText = ingredient;
            } else if (ingredient.amount && ingredient.unit) {
                ingredientText = `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
            } else {
                ingredientText = ingredient.name;
            }
            recipeText += `- ${ingredientText}\n`;
        });
        
        recipeText += '\nINSTRUCTIONS:\n';
        recipe.steps.forEach((step, index) => {
            recipeText += `${index + 1}. ${step}\n`;
        });
        
        if (recipe.notes) {
            recipeText += `\nNOTES:\n${recipe.notes}\n\n`;
        }
        
        recipeText += `Recipe from: ${window.location.href}`;
        
        // trying this as a learnining suguestion: clipboard API
        navigator.clipboard.writeText(recipeText)
            .then(() => {
                Notifications.success('Recipe copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                showError('Failed to copy recipe. Try manually selecting and copying the content.');
            });
    } catch (error) {
        console.error('Error copying recipe:', error);
        showError('Failed to copy recipe');
    }
}

function navigateToPrintPage(recipeId) {
    const printUrl = `print-recipe.html?id=${recipeId}`;
    window.open(printUrl, '_blank');
}


async function checkUserInteractions(recipeId) {
    try {
        const response = await getUserRecipeInteractions(recipeId);
        
        if (response.success && response.interactions) {
            updateInteractionUI(response.interactions);
        }
    } catch (error) {
        console.error('Error checking user interactions:', error);
    }
}

async function toggleRecipeStar(recipeId) {
    try {
        const response = await toggleStar(recipeId);
        
        if (response.success) {
            DOM.set('star-count', response.starCount || 0);
            const starBtn = DOM.get('star-btn');
            if (starBtn) {
                if (response.starred) {
                    starBtn.classList.add('active');
                    Notifications.success('Recipe starred!');
                } else {
                    starBtn.classList.remove('active');
                    Notifications.show('Star removed', 'info');
                }
            }
        } else {
            showError(response.message || 'Failed to update star');
        }
    } catch (error) {
        console.error('Error toggling star:', error);
        showError('An error occurred. Please try again.');
    }
}

async function toggleRecipeFavorite(recipeId) {
    try {
        const response = await toggleFavorite(recipeId);
        
        if (response.success) {
            const favoriteBtn = DOM.get('favorite-btn');
            if (favoriteBtn) {
                if (response.favorited) {
                    favoriteBtn.classList.add('active');
                    Notifications.success('Added to favorites!');
                } else {
                    favoriteBtn.classList.remove('active');
                    Notifications.show('Removed from favorites', 'info');
                }
            }
        } else {
            showError(response.message || 'Failed to update favorites');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showError('An error occurred. Please try again.');
    }
}

function updateInteractionUI(interactions) {
    if (interactions.starred) {
        const starBtn = DOM.get('star-btn');
        if (starBtn) {
            starBtn.classList.add('active');
        }
    }
    
    if (interactions.favorited) {
        const favoriteBtn = DOM.get('favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.classList.add('active');
        }
    }
}

function showError(message) {
    let errorElement = document.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        const recipeContainer = document.querySelector('.recipe-container');
        if (recipeContainer) {
            recipeContainer.prepend(errorElement);
        } else {
            document.body.prepend(errorElement);
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
} 