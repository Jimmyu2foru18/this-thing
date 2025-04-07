import { getAllRecipes } from './recipeService.js';

document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const recipesGrid = document.getElementById('recipes-grid');
    const totalRatings = document.getElementById('total-ratings');
    const totalReviews = document.getElementById('total-reviews');

    let currentCategory = 'all-time';
    loadTopRecipes(currentCategory);

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = category;
            loadTopRecipes(category);
        });
    });

    async function loadTopRecipes(category) 
    {
        try {
            recipesGrid.innerHTML = '<div class="loading-spinner">Loading...</div>';
            
            const recipes = await fetchTopRecipes(category);
            
            if (recipes.length === 0) {
                recipesGrid.innerHTML = '<p class="no-results">No recipes found for this category.</p>';
                return;
            }
            
            displayRecipes(recipes);
            updateStats(recipes);
        } catch (error) {
            console.error('Error loading top recipes:', error);
            showError('Failed to load recipes. Please try again later.');
        }
    }

    function displayRecipes(recipes) 
    {
        recipesGrid.innerHTML = '';
        
        const topRecipes = recipes.slice(0, 10);
        
        topRecipes.forEach((recipe, index) => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            recipeCard.innerHTML = `
                <div class="recipe-rank">${index + 1}</div>
                <img src="${recipe.image || '../LOGO/recipe-placeholder.jpg'}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span class="meta-item"><i class="meta-icon">⭐</i> ${recipe.rating.toFixed(1)}</span>
                        <span class="meta-item"><i class="meta-icon">👨‍🍳</i> ${recipe.difficulty || 'Easy'}</span>
                        <span class="meta-item"><i class="meta-icon">⏱️</i> ${recipe.cookTime + recipe.prepTime} min</span>
                    </div>
                </div>
            `;

            recipeCard.addEventListener('click', () => {
                window.location.href = `recipe.html?id=${recipe.id || recipe._id}`;
            });
            
            recipesGrid.appendChild(recipeCard);
        });
    }


    function updateStats(recipes) 
    {
        let ratings = 0;
        let reviews = 0;
        
        recipes.forEach(recipe => {
            ratings += recipe.starCount || 0;
            reviews += recipe.reviewCount || 0;
        });
        totalRatings.textContent = ratings.toLocaleString();
        totalReviews.textContent = reviews.toLocaleString();
    }

    function showError(message) 
    {
        recipesGrid.innerHTML = `<p class="error-message">${message}</p>`;
    }

    async function fetchTopRecipes(category) {
        let filters = {};
        let sortBy = '';

        switch (category) {
            case 'all-time':
                sortBy = 'rating';
                break;
            case 'this-week':
                sortBy = 'rating';
                filters.timeFrame = 'week';
                break;
            case 'trending':
                sortBy = 'views';
                break;
            case 'highest-rated':
                sortBy = 'rating';
                break;
            default:
                sortBy = 'rating';
        }
        
        filters.sort = sortBy;
        filters.limit = 10;

        const result = await getAllRecipes(filters);
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch recipes');
        }
        
        return result.recipes;
    }
}); 