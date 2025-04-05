import { getAllRecipes, toggleStar, toggleFavorite, getUserRecipeInteractions } from './recipeService.js';
import { DOM, Notifications, Auth } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const starBtn = document.getElementById('star-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const printBtn = document.getElementById('print-btn');

    generateRandomRecipe();
    setupEventListeners();

    generateBtn.addEventListener('click', generateRandomRecipe);
    
    if (starBtn) {
        starBtn.addEventListener('click', async () => {
            if (!Auth.isAuthenticated()) {
                Notifications.show('Please sign in to rate recipes', 'info');
                return;
            }
            if (currentRecipe) {
                await toggleRecipeStar(currentRecipe.id);
            }
        });
    }

    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', async () => {
            if (!Auth.isAuthenticated()) {
                Notifications.show('Please sign in to favorite recipes', 'info');
                return;
            }
            if (currentRecipe) {
                await toggleRecipeFavorite(currentRecipe.id);
            }
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            if (currentRecipe) {
                window.location.href = `print-recipe.html?id=${currentRecipe.id}`;
            }
        });
    }
});



async function generateRandomRecipe() {
    const container = document.querySelector('.recipe-content-wrapper');
    container.classList.add('loading');

    try {
        const recipe = await fetchRandomRecipe();
        currentRecipe = recipe;
        
        updateRecipeUI(recipe);
        if (Auth.isAuthenticated()) {
            await checkUserInteractions(recipe.id);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error generating recipe:', error);
        showError('Failed to generate recipe');
    } finally {
        container.classList.remove('loading');
    }
}



function updateRecipeUI(recipe) 
{
    document.getElementById('recipe-image').src = recipe.image;
    document.getElementById('recipe-image').alt = recipe.title;
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('cook-time').textContent = `${recipe.cookTime} mins`;
    document.getElementById('servings').textContent = `${recipe.servings} servings`;
    document.getElementById('difficulty').textContent = recipe.difficulty;
    document.getElementById('recipe-description').textContent = recipe.description;
    document.getElementById('star-count').textContent = recipe.stars;


    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = recipe.ingredients.map(ingredient => 
        `<li>${ingredient}</li>`
    ).join('');


    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = recipe.instructions.map(instruction => 
        `<li>${instruction}</li>`
    ).join('');


    document.getElementById('recipe-notes').textContent = recipe.notes || 'No additional notes.';


    const nutritionFacts = document.getElementById('nutrition-facts');
    nutritionFacts.innerHTML = Object.entries(recipe.nutrition).map(([key, value]) => `
        <div class="nutrition-item">
            <span class="nutrition-label">${key}</span>
            <span class="nutrition-value">${value}${key === 'calories' ? '' : 'g'}</span>
        </div>
    `).join('');


    const tagsContainer = document.getElementById('recipe-tags');
    tagsContainer.innerHTML = recipe.tags.map(tag => 
        `<span class="recipe-tag">${tag}</span>`
    ).join('');


    document.title = `${recipe.title} - Random Recipe - Recspicy`;
}

function saveRecipe() 
{
    const userToken = localStorage.getItem('userToken');
    if (!userToken) 
	{
        alert('Please sign in to save recipes');
        return;
    }
    alert('Recipe saved to your favorites!');
}

function shareRecipe() 
{
    if (navigator.share) 
	{
        navigator.share(
		{
            title: document.getElementById('recipe-title').textContent,
            text: 'Check out this recipe I found on Recspicy!',
            url: window.location.href
        }).catch(console.error);
    } 
	else 
	{
        const recipeUrl = window.location.href;
        navigator.clipboard.writeText(recipeUrl)
            .then(() => alert('Recipe link copied to clipboard!'))
            .catch(console.error);
    }
}



function navigateToPrintPage(recipeId) 
{
    window.location.href = `print-recipe.html?id=${recipeId}`;
}



function showError(message) 
{
    const recipeSection = document.getElementById('recipe-section');
    recipeSection.innerHTML = `
        <div class="error-message">
            ${message}
        </div>
    `;
}




async function fetchRandomRecipe() {
    try {
        const result = await getAllRecipes({ random: true, limit: 1 });
        
        if (!result.success || !result.recipes.length) {
            throw new Error('Failed to fetch random recipe');
        }
        
        return result.recipes[0];
    } catch (error) {
        console.error('Error fetching random recipe:', error);
        throw error;
    }
}




let currentRecipe = null;



async function checkUserInteractions(recipeId) {
    try {
        const interactions = await getUserRecipeInteractions(recipeId);
        
        if (interactions.starred) {
            DOM.get('star-btn').classList.add('active');
        }
        
        if (interactions.favorited) {
            DOM.get('favorite-btn').classList.add('active');
        }
    } catch (error) {
        console.error('Error checking user interactions:', error);
    }
}

async function toggleRecipeStar(recipeId) {
    try {
        const result = await toggleStar(recipeId);
        if (result.success) {
            const starBtn = DOM.get('star-btn');
            starBtn.classList.toggle('active');
            const starCount = DOM.get('star-count');
            starCount.textContent = result.newStarCount;
            Notifications.show(result.message, 'success');
        }
    } catch (error) {
        console.error('Error toggling star:', error);
        Notifications.show('Failed to update star status', 'error');
    }
}

async function toggleRecipeFavorite(recipeId) {
    try {
        const result = await toggleFavorite(recipeId);
        if (result.success) {
            const favoriteBtn = DOM.get('favorite-btn');
            favoriteBtn.classList.toggle('active');
            Notifications.show(result.message, 'success');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        Notifications.show('Failed to update favorite status', 'error');
    }
}

function setupEventListeners() {
    // Event listeners are set up in the DOMContentLoaded event

    starBtn.addEventListener('click', () => toggleStar(currentRecipe.id));
    favoriteBtn.addEventListener('click', () => toggleFavorite(currentRecipe.id));
    printBtn.addEventListener('click', () => navigateToPrintPage(currentRecipe.id));
}