import { getAllRecipes } from './recipeService.js';

document.addEventListener('DOMContentLoaded', () => {
    const categoryCards = document.querySelectorAll('.category-card');
    const recipesGrid = document.getElementById('recipes-grid');
    const sectionTitle = document.getElementById('section-title');

    let currentCategory = 'breakfast';
    loadRecipesByMeal(currentCategory);
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentCategory = category;
            loadRecipesByMeal(category);
            document.getElementById('recipe-section').scrollIntoView({ behavior: 'smooth' });
        });
    });

    async function loadRecipesByMeal(category) {
        try {
            recipesGrid.innerHTML = '<div class="loading-spinner">Loading recipes...</div>';
            
            const recipes = await fetchRecipesByMeal(category);
            
            if (recipes.length === 0) {
                recipesGrid.innerHTML = '<p class="no-results">No recipes found for this meal type.</p>';
                return;
            }
            
            displayRecipes(recipes);
            updateSectionTitle(category);
        } catch (error) {
            console.error('Error loading recipes by meal:', error);
            showError('Failed to load recipes. Please try again later.');
        }
    }

    function displayRecipes(recipes) {
        recipesGrid.innerHTML = '';
        
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            recipeCard.innerHTML = `
                <img src="${recipe.image || '../LOGO/recipe-placeholder.jpg'}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span class="meta-item"><i class="meta-icon">⭐</i> ${recipe.rating.toFixed(1)}</span>
                        <span class="meta-item"><i class="meta-icon">⏱️</i> ${recipe.cookTime + recipe.prepTime} min</span>
                        <span class="meta-item"><i class="meta-icon">👨‍🍳</i> ${recipe.difficulty || 'Easy'}</span>
                    </div>
                </div>
            `;

            recipeCard.addEventListener('click', () => {
                window.location.href = `recipe.html?id=${recipe.id || recipe._id}`;
            });
            
            recipesGrid.appendChild(recipeCard);
        });
    }
    function updateSectionTitle(category) {
        const titles = {
            breakfast: 'Breakfast Recipes',
            lunch: 'Lunch Recipes',
            dinner: 'Dinner Recipes',
            snacks: 'Snack Recipes',
            desserts: 'Dessert Recipes',
            drinks: 'Drink Recipes'
        };
        
        sectionTitle.textContent = titles[category] || 'Recipes by Meal Type';
    }
    function showError(message) {
        recipesGrid.innerHTML = `<p class="error-message">${message}</p>`;
    }
    async function fetchRecipesByMeal(category) {
        const mealTypeMap = {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snacks: 'Snack',
            desserts: 'Dessert',
            drinks: 'Drink'
        };
        
        const mealType = mealTypeMap[category] || '';
        const filters = {
            mealType: mealType,
            limit: 12,
            sort: 'rating'
        };

        const result = await getAllRecipes(filters);
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch recipes');
        }
        
        return result.recipes;
    }
}); 